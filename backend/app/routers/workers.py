"""Private endpoints used by laptop and Colab workers only."""

import hashlib
import hmac
import json
import logging
import re

from fastapi import APIRouter, Depends, File, Header, HTTPException, UploadFile

from app.config import settings
from app.services.blob_storage import upload_video
from app.services.distributed_queue import queue
from app.middleware.auth import refund_video_credit

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/worker", tags=["Worker"])
_ID = re.compile(r"^[a-z0-9][a-z0-9_-]{2,63}$")


def _worker_identity(
    x_worker_id: str = Header(...), x_worker_token: str = Header(...),
) -> dict:
    if not _ID.fullmatch(x_worker_id):
        raise HTTPException(status_code=401, detail="Invalid worker identity")
    try:
        workers = json.loads(settings.WORKER_TOKENS_JSON)
        expected = workers[x_worker_id]
    except (json.JSONDecodeError, KeyError, TypeError):
        raise HTTPException(status_code=401, detail="Unknown worker")

    actual_hash = hashlib.sha256(x_worker_token.encode()).hexdigest()
    if not hmac.compare_digest(actual_hash, str(expected.get("token_hash", ""))):
        raise HTTPException(status_code=401, detail="Worker authentication failed")
    account_id = str(expected.get("account_id", ""))
    if not _ID.fullmatch(account_id):
        raise HTTPException(status_code=401, detail="Worker account is not configured")
    return {"worker_id": x_worker_id, "account_id": account_id}


def _require_distributed() -> None:
    if not queue.enabled:
        raise HTTPException(status_code=404, detail="Distributed workers are disabled")


@router.post("/claim")
async def claim(worker: dict = Depends(_worker_identity)):
    _require_distributed()
    job = await queue.claim(**worker)
    return {"job": job}


@router.post("/heartbeat/{job_id}")
async def heartbeat(job_id: str, worker: dict = Depends(_worker_identity)):
    _require_distributed()
    if not await queue.heartbeat(job_id, **worker):
        raise HTTPException(status_code=409, detail="Job lease is no longer owned by this worker")
    return {"ok": True}


@router.post("/complete/{job_id}")
async def complete(
    job_id: str,
    video: UploadFile = File(...),
    worker: dict = Depends(_worker_identity),
):
    _require_distributed()
    if video.content_type not in {"video/mp4", "application/octet-stream"}:
        raise HTTPException(status_code=415, detail="Only MP4 video uploads are accepted")
    content = await video.read(settings.MAX_WORKER_UPLOAD_BYTES + 1)
    if not content or len(content) > settings.MAX_WORKER_UPLOAD_BYTES:
        raise HTTPException(status_code=413, detail="Video exceeds worker upload limit")

    object_key = f"videos/{job_id}.mp4"
    # Verify ownership before writing storage. This prevents an expired worker
    # from overwriting a completed job's object.
    if not await queue.heartbeat(job_id, **worker):
        raise HTTPException(status_code=409, detail="Job lease is no longer owned by this worker")
    await upload_video(object_key, content)
    if not await queue.complete(job_id, object_key=object_key, **worker):
        raise HTTPException(status_code=409, detail="Job completion was rejected")
    return {"ok": True}


@router.post("/fail/{job_id}")
async def fail(job_id: str, error_code: str = "worker_error", worker: dict = Depends(_worker_identity)):
    _require_distributed()
    safe_code = re.sub(r"[^a-z0-9_-]", "_", error_code.lower())[:120]
    result = await queue.fail(job_id, error_code=safe_code, **worker)
    if not result:
        raise HTTPException(status_code=409, detail="Job failure was rejected")
    if result["status"] == "failed":
        # Database RPC records one refund per generation, even if this request
        # is retried after a transient network failure.
        try:
            await refund_video_credit(result["user_id"], job_id)
        except HTTPException:
            logger.exception("Credit refund deferred for failed job %s", job_id)
    return {"ok": True}
