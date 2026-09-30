"""Private Flow worker for one isolated account/browser slot.

Run one process per account/session on Azure, a laptop, or Colab.  It only
pulls jobs from the Azure control plane; it never receives database, Blob, or
another worker's credentials.
"""

import asyncio
import logging
import os
from pathlib import Path

import httpx

from app.config import settings
from app.services.flow_service import FlowVideoService

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("botock.worker")

CONTROL_PLANE_URL = os.getenv("CONTROL_PLANE_URL", "").rstrip("/")
WORKER_ID = os.getenv("WORKER_ID", "")
WORKER_TOKEN = os.getenv("WORKER_TOKEN", "")
FLOW_ACCOUNT_ID = os.getenv("FLOW_ACCOUNT_ID", "")
FLOW_CONCURRENCY = int(os.getenv("FLOW_CONCURRENCY", "1"))
POLL_SECONDS = max(2, int(os.getenv("WORKER_POLL_SECONDS", "5")))


def _validate_config() -> None:
    if not CONTROL_PLANE_URL.startswith("https://"):
        raise RuntimeError("CONTROL_PLANE_URL must use HTTPS")
    if not WORKER_ID or not WORKER_TOKEN or not FLOW_ACCOUNT_ID:
        raise RuntimeError("WORKER_ID, WORKER_TOKEN and FLOW_ACCOUNT_ID are required")
    if FLOW_CONCURRENCY != 1:
        raise RuntimeError("FLOW_CONCURRENCY must remain 1: one Flow account owns one Chromium slot")
    if not settings.SESSION_PATH or not settings.SESSION_ENCRYPTION_KEY:
        raise RuntimeError("Each worker needs its own SESSION_PATH and SESSION_ENCRYPTION_KEY")
    if not Path(settings.SESSION_PATH).is_file():
        raise RuntimeError("Encrypted Flow session is missing; sign in manually on this worker first")


def _headers() -> dict[str, str]:
    return {
        "X-Worker-ID": WORKER_ID,
        "X-Worker-Token": WORKER_TOKEN,
        "User-Agent": "Botock-Private-Worker/1.0",
    }


async def _post(client: httpx.AsyncClient, path: str, **kwargs) -> httpx.Response:
    response = await client.post(f"{CONTROL_PLANE_URL}{path}", headers=_headers(), **kwargs)
    response.raise_for_status()
    return response


async def _heartbeat_loop(client: httpx.AsyncClient, job_id: str, stop: asyncio.Event) -> None:
    while not stop.is_set():
        try:
            await asyncio.wait_for(stop.wait(), timeout=max(10, settings.WORKER_HEARTBEAT_SECONDS))
            return
        except asyncio.TimeoutError:
            try:
                await _post(client, f"/api/worker/heartbeat/{job_id}")
            except httpx.HTTPError:
                # Do not continue work after a lost lease: a different healthy
                # worker may have reclaimed the job and must be the only writer.
                logger.warning("Lease heartbeat failed for %s; stopping local work", job_id)
                stop.set()
                return


async def _run_job(client: httpx.AsyncClient, job: dict) -> None:
    job_id = job["id"]
    payload = job["payload"]
    status: dict = {}
    stop = asyncio.Event()
    heartbeat = asyncio.create_task(_heartbeat_loop(client, job_id, stop))
    service = FlowVideoService()
    try:
        await service.generate_video(
            prompt=payload["prompt"], generation_id=job_id, status_dict=status,
            is_pro=bool(payload.get("is_pro")), model=payload.get("model") or "omni-1.1-flash-360p",
            aspect_ratio=payload.get("aspect_ratio") or "16:9",
            duration_seconds=int(payload.get("duration_seconds") or 8),
            motion_hint=payload.get("motion_hint"), image_base64=payload.get("image_base64"),
        )
        output = Path(settings.VIDEOS_DIR) / f"{job_id}.mp4"
        if stop.is_set():
            return
        if status.get(job_id, {}).get("status") != "completed" or not output.is_file():
            await _post(client, f"/api/worker/fail/{job_id}", params={"error_code": "generation_failed"})
            return
        with output.open("rb") as video:
            await _post(
                client, f"/api/worker/complete/{job_id}",
                files={"video": (f"{job_id}.mp4", video, "video/mp4")},
            )
        # The control plane stores the final object. This local copy is only a
        # short-lived transfer artifact and must not retain user media.
        output.unlink(missing_ok=True)
    except Exception:
        logger.exception("Job %s failed in private worker", job_id)
        if not stop.is_set():
            try:
                await _post(client, f"/api/worker/fail/{job_id}", params={"error_code": "worker_error"})
            except httpx.HTTPError:
                logger.exception("Could not report worker failure for %s", job_id)
    finally:
        stop.set()
        await heartbeat


async def main() -> None:
    _validate_config()
    timeout = httpx.Timeout(connect=10, read=settings.VIDEO_GEN_TIMEOUT + 60, write=120, pool=10)
    async with httpx.AsyncClient(timeout=timeout, follow_redirects=False) as client:
        logger.info("Private worker %s is ready", WORKER_ID)
        while True:
            try:
                response = await _post(client, "/api/worker/claim")
                job = response.json().get("job")
                if job:
                    await _run_job(client, job)
                else:
                    await asyncio.sleep(POLL_SECONDS)
            except httpx.HTTPError:
                logger.exception("Control plane is unavailable; retrying")
                await asyncio.sleep(POLL_SECONDS)


if __name__ == "__main__":
    asyncio.run(main())
