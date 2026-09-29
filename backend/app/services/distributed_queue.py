"""Persistent, lease-based queue used by the Azure control plane."""

import asyncio
import json
import logging
import os
import secrets
from typing import Any

from app.config import settings

logger = logging.getLogger(__name__)


class DistributedQueue:
    def __init__(self) -> None:
        self._pool: Any = None

    @property
    def enabled(self) -> bool:
        return settings.DISTRIBUTED_QUEUE_ENABLED

    async def start(self) -> None:
        if not self.enabled or self._pool:
            return
        if not settings.QUEUE_DATABASE_URL:
            raise RuntimeError("QUEUE_DATABASE_URL is required when DISTRIBUTED_QUEUE_ENABLED=true")
        try:
            import asyncpg
        except ImportError as exc:
            raise RuntimeError("Install backend requirements before enabling distributed workers") from exc
        self._pool = await asyncpg.create_pool(
            settings.QUEUE_DATABASE_URL, min_size=1, max_size=5, command_timeout=20
        )
        logger.info("Distributed video queue connected.")

    async def stop(self) -> None:
        if self._pool:
            await self._pool.close()
            self._pool = None

    def _require_pool(self) -> Any:
        if not self._pool:
            raise RuntimeError("Distributed queue is not started")
        return self._pool

    async def enqueue(self, job_id: str, user_id: str, payload: dict[str, Any]) -> None:
        pool = self._require_pool()
        async with pool.acquire() as conn:
            pending = await conn.fetchval(
                "SELECT count(*) FROM video_jobs WHERE status IN ('reserving', 'queued', 'running')"
            )
            if pending >= settings.MAX_PENDING_VIDEO_JOBS:
                raise QueueFullError(settings.MAX_PENDING_VIDEO_JOBS)
            await conn.execute(
                """INSERT INTO video_jobs (id, user_id, status, payload)
                   VALUES ($1::uuid, $2, 'reserving', $3::jsonb)""",
                job_id,
                user_id,
                json.dumps(payload),
            )

    async def activate(self, job_id: str, user_id: str) -> bool:
        pool = self._require_pool()
        async with pool.acquire() as conn:
            result = await conn.execute(
                """UPDATE video_jobs SET status = 'queued', updated_at = now()
                   WHERE id = $1::uuid AND user_id = $2 AND status = 'reserving'""",
                job_id, user_id,
            )
        return _command_count(result) == 1

    async def cancel_reservation(self, job_id: str, user_id: str) -> None:
        pool = self._require_pool()
        async with pool.acquire() as conn:
            await conn.execute(
                "DELETE FROM video_jobs WHERE id = $1::uuid AND user_id = $2 AND status = 'reserving'",
                job_id, user_id,
            )

    async def reclaim_expired(self) -> int:
        """Return abandoned jobs to the queue; fail jobs that exceeded retry limit."""
        pool = self._require_pool()
        async with pool.acquire() as conn:
            # A process can die after reserving capacity but before charging the
            # user/activating its job. Reservations are never claimable and can
            # safely be discarded after a short grace period.
            abandoned_reservations = await conn.execute(
                """DELETE FROM video_jobs WHERE status = 'reserving'
                   AND created_at < now() - interval '5 minutes'"""
            )
            failed = await conn.execute(
                """UPDATE video_jobs SET status = 'failed', error_code = 'worker_lost',
                           lease_expires_at = NULL, updated_at = now()
                   WHERE status = 'running' AND lease_expires_at < now() AND attempts >= $1""",
                settings.MAX_JOB_ATTEMPTS,
            )
            queued = await conn.execute(
                """UPDATE video_jobs SET status = 'queued', worker_id = NULL, account_id = NULL,
                           lease_expires_at = NULL, updated_at = now()
                   WHERE status = 'running' AND lease_expires_at < now() AND attempts < $1""",
                settings.MAX_JOB_ATTEMPTS,
            )
        return _command_count(abandoned_reservations) + _command_count(failed) + _command_count(queued)

    async def claim(self, worker_id: str, account_id: str) -> dict[str, Any] | None:
        await self.reclaim_expired()
        pool = self._require_pool()
        async with pool.acquire() as conn:
            row = await conn.fetchrow(
                """WITH candidate AS (
                       SELECT id FROM video_jobs WHERE status = 'queued'
                       ORDER BY created_at FOR UPDATE SKIP LOCKED LIMIT 1
                   )
                   UPDATE video_jobs j
                   SET status = 'running', worker_id = $1, account_id = $2,
                       attempts = attempts + 1,
                       lease_expires_at = now() + ($3::text || ' seconds')::interval,
                       updated_at = now()
                   FROM candidate WHERE j.id = candidate.id
                   RETURNING j.id::text, j.payload, j.attempts""",
                worker_id,
                account_id,
                settings.WORKER_LEASE_SECONDS,
            )
        return dict(row) if row else None

    async def heartbeat(self, job_id: str, worker_id: str, account_id: str) -> bool:
        pool = self._require_pool()
        async with pool.acquire() as conn:
            result = await conn.execute(
                """UPDATE video_jobs SET lease_expires_at = now() + ($1::text || ' seconds')::interval,
                           updated_at = now()
                   WHERE id = $2::uuid AND status = 'running' AND worker_id = $3 AND account_id = $4""",
                settings.WORKER_LEASE_SECONDS, job_id, worker_id, account_id,
            )
        return _command_count(result) == 1

    async def complete(self, job_id: str, worker_id: str, account_id: str, object_key: str) -> bool:
        pool = self._require_pool()
        async with pool.acquire() as conn:
            result = await conn.execute(
                """UPDATE video_jobs SET status = 'completed', output_object_key = $1,
                           lease_expires_at = NULL, updated_at = now()
                   WHERE id = $2::uuid AND status = 'running' AND worker_id = $3 AND account_id = $4""",
                object_key, job_id, worker_id, account_id,
            )
        return _command_count(result) == 1

    async def fail(self, job_id: str, worker_id: str, account_id: str, error_code: str) -> bool:
        pool = self._require_pool()
        async with pool.acquire() as conn:
            result = await conn.execute(
                """UPDATE video_jobs SET status = CASE WHEN attempts >= $1 THEN 'failed'::video_job_status
                                                         ELSE 'queued'::video_job_status END,
                           error_code = $2, worker_id = NULL, account_id = NULL,
                           lease_expires_at = NULL, updated_at = now()
                   WHERE id = $3::uuid AND status = 'running' AND worker_id = $4 AND account_id = $5""",
                settings.MAX_JOB_ATTEMPTS, error_code[:120], job_id, worker_id, account_id,
            )
        return _command_count(result) == 1

    async def get_for_user(self, job_id: str, user_id: str) -> dict[str, Any] | None:
        pool = self._require_pool()
        async with pool.acquire() as conn:
            row = await conn.fetchrow(
                """SELECT id::text, status::text, output_object_key, error_code, created_at
                   FROM video_jobs WHERE id = $1::uuid AND user_id = $2""", job_id, user_id
            )
        return dict(row) if row else None


class QueueFullError(Exception):
    def __init__(self, limit: int) -> None:
        self.limit = limit


def _command_count(result: str) -> int:
    return int(result.rsplit(" ", 1)[-1])


queue = DistributedQueue()
