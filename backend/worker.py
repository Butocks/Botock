"""Run one Flow account worker on Azure, a laptop, or Colab.

This process has no database or Blob credentials. It only needs a worker token,
an encrypted local Flow session, and outbound HTTPS access to the Azure API.
"""

import asyncio
import logging
import os
from pathlib import Path

import httpx
from pydantic_settings import BaseSettings, SettingsConfigDict

from app.services.flow_service import FlowVideoService

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("botock.worker")


class WorkerSettings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")
    CONTROL_PLANE_URL: str
    WORKER_ID: str
    FLOW_ACCOUNT_ID: str
    WORKER_TOKEN: str
    FLOW_CONCURRENCY: int = 1
    WORKER_POLL_SECONDS: int = 5
    WORKER_HEARTBEAT_SECONDS: int = 30


worker_settings = WorkerSettings()


def headers() -> dict[str, str]:
    return {
        "X-Worker-Id": worker_settings.WORKER_ID,
        "X-Worker-Token": worker_settings.WORKER_TOKEN,
    }


async def heartbeat(client: httpx.AsyncClient, job_id: str, stop: asyncio.Event) -> None:
    while not stop.is_set():
        try:
            await asyncio.wait_for(stop.wait(), timeout=worker_settings.WORKER_HEARTBEAT_SECONDS)
            return
        except asyncio.TimeoutError:
            response = await client.post(f"/api/worker/heartbeat/{job_id}", headers=headers())
            response.raise_for_status()


async def run_job(client: httpx.AsyncClient, job: dict) -> None:
    job_id = job["id"]
    payload = job["payload"]
    state: dict = {}
    stop = asyncio.Event()
    heartbeat_task = asyncio.create_task(heartbeat(client, job_id, stop))
    try:
        service = FlowVideoService()
        await service.generate_video(
            prompt=payload["prompt"], generation_id=job_id, status_dict=state,
            is_pro=bool(payload.get("is_pro")), model=payload.get("model", "omni-1.1-flash-360p"),
            aspect_ratio=payload.get("aspect_ratio", "16:9"),
            duration_seconds=int(payload.get("duration_seconds", 8)),
            motion_hint=payload.get("motion_hint"), image_base64=payload.get("image_base64"),
        )
        result = state.get(job_id, {})
        path = Path(service.videos_dir) / f"{job_id}.mp4"
        if result.get("status") != "completed" or not path.is_file():
            raise RuntimeError("generation_failed")
        with path.open("rb") as video_file:
            response = await client.post(
                f"/api/worker/complete/{job_id}", headers=headers(),
                files={"video": (f"{job_id}.mp4", video_file, "video/mp4")}, timeout=300,
            )
        response.raise_for_status()
        path.unlink(missing_ok=True)
    except Exception as exc:
        logger.exception("Job %s failed", job_id)
        await client.post(
            f"/api/worker/fail/{job_id}", headers=headers(),
            params={"error_code": type(exc).__name__.lower()}, timeout=30,
        )
    finally:
        stop.set()
        await heartbeat_task


async def main() -> None:
    if worker_settings.FLOW_CONCURRENCY != 1:
        raise RuntimeError("FLOW_CONCURRENCY must stay 1: one Flow account owns one Chromium worker")
    base_url = worker_settings.CONTROL_PLANE_URL.rstrip("/")
    async with httpx.AsyncClient(base_url=base_url, timeout=45, follow_redirects=False) as client:
        while True:
            try:
                response = await client.post("/api/worker/claim", headers=headers())
                response.raise_for_status()
                job = response.json().get("job")
                if job:
                    await run_job(client, job)
                else:
                    await asyncio.sleep(worker_settings.WORKER_POLL_SECONDS)
            except httpx.HTTPError as exc:
                logger.warning("Control plane unavailable: %s", exc)
                await asyncio.sleep(10)


if __name__ == "__main__":
    asyncio.run(main())
