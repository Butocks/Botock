import os
import re
import uuid
import time
import asyncio
import logging
from collections import defaultdict

logger = logging.getLogger(__name__)
from fastapi import APIRouter, BackgroundTasks, HTTPException, Request, Depends
from fastapi.responses import FileResponse, Response
from app.models.schemas import VideoGenerateRequest, VideoGenerateResponse, VideoStatusResponse, VideoListResponse
from app.services.flow_service import FlowVideoService
from app.middleware.auth import get_current_user, get_optional_user, get_current_user_or_guest
from app.config import settings
from app.services.distributed_queue import QueueFullError, queue
from app.services.blob_storage import download_video as download_blob_video

router = APIRouter(prefix="/api/video", tags=["Video"])

# In-memory status store
video_statuses = {}

flow_service = FlowVideoService()

# ----------------------------------------------------
# SECURITY LAYER 1: Concurrency Limiter & Subscriber Priority Queue
# 1 user at a time execution, max 2 in queue, priority to subscribers
# ----------------------------------------------------
MAX_CONCURRENT_GENERATIONS = 1
MAX_QUEUE_LIMIT = 2
generation_semaphore = asyncio.Semaphore(MAX_CONCURRENT_GENERATIONS)
current_queued_jobs = 0

# ----------------------------------------------------
# SECURITY LAYER 2: IP-Based Rate Limiting
# Max 5 video generation requests per 10 minutes per IP
# ----------------------------------------------------
RATE_LIMIT_WINDOW = 600  # 10 minutes
MAX_REQUESTS_PER_WINDOW = 5
ip_request_history = defaultdict(list)
guest_generation_history = defaultdict(list) # Stores timestamps of successful guest generations per IP


def check_rate_limit(client_ip: str):
    now = time.time()
    # Clean up old timestamps
    ip_request_history[client_ip] = [
        t for t in ip_request_history[client_ip] if now - t < RATE_LIMIT_WINDOW
    ]
    if len(ip_request_history[client_ip]) >= MAX_REQUESTS_PER_WINDOW:
        raise HTTPException(
            status_code=429,
            detail=f"Rate limit exceeded. Maximum {MAX_REQUESTS_PER_WINDOW} video requests per {RATE_LIMIT_WINDOW//60} minutes."
        )
    ip_request_history[client_ip].append(now)


# ----------------------------------------------------
# SECURITY LAYER 3: Strict UUID Validation (Path Traversal Protection)
# ----------------------------------------------------
UUID_REGEX = re.compile(r"^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$")

def validate_uuid(val: str):
    if not UUID_REGEX.match(val):
        raise HTTPException(status_code=400, detail="Invalid generation ID format.")


async def safe_generate_task(
    prompt: str,
    generation_id: str,
    is_pro: bool = False,
    model: str = "omni-1.1-flash-360p",
    aspect_ratio: str = "16:9",
    duration_seconds: int = 8,
    motion_hint: str = None,
    image_base64: str = None,
    user_id: str | None = None,
):
    """Wrapper that enforces single-user execution and subscriber priority."""
    global current_queued_jobs
    try:
        async with generation_semaphore:
            current_queued_jobs = max(0, current_queued_jobs - 1)
            await flow_service.generate_video(
                prompt=prompt,
                generation_id=generation_id,
                status_dict=video_statuses,
                is_pro=is_pro,
                model=model,
                aspect_ratio=aspect_ratio,
                duration_seconds=duration_seconds,
                motion_hint=motion_hint,
                image_base64=image_base64,
            )
            if not is_pro and user_id and video_statuses.get(generation_id, {}).get("status") == "failed":
                from app.middleware.auth import refund_video_credit
                await refund_video_credit(user_id, generation_id)
    except Exception as e:
        logger.exception("Video generation task failed: %s", generation_id)
        video_statuses[generation_id] = {
            "status": "failed",
            "message": "The video service is temporarily unavailable. Your credits have been returned. Please try again shortly."
        }
        if not is_pro and user_id:
            try:
                from app.middleware.auth import refund_video_credit
                await refund_video_credit(user_id, generation_id)
            except HTTPException:
                logger.exception("Credit refund deferred for failed local job %s", generation_id)


@router.post("/generate", response_model=VideoGenerateResponse)
async def generate_video(
    request: VideoGenerateRequest,
    req: Request,
    background_tasks: BackgroundTasks,
    user: dict = Depends(get_current_user_or_guest),
):
    global current_queued_jobs
    client_ip = req.client.host if req.client else "unknown"
    check_rate_limit(client_ip)

    # Sanitize prompt (strip extra whitespace, length checked by Pydantic)
    clean_prompt = request.prompt.strip()
    is_pro = user.get("is_pro", False) if user else False
    is_guest = user is None
    
    from app.routers.auth_otp import get_platform_settings
    settings_data = get_platform_settings()
    guest_limits = settings_data.get("quotas", {}).get("guest_limits", {})
    
    if is_guest:
        if not guest_limits.get("enabled", False):
            raise HTTPException(status_code=401, detail="Guest generation is currently disabled. Please log in.")
        
        # Check daily guest limit
        max_daily = guest_limits.get("max_videos_per_day", 1)
        now = time.time()
        one_day_ago = now - 86400
        # Clean up old
        guest_generation_history[client_ip] = [t for t in guest_generation_history[client_ip] if t > one_day_ago]
        if len(guest_generation_history[client_ip]) >= max_daily:
            raise HTTPException(status_code=429, detail="Guest daily video limit reached. Please log in to create more.")
        
        # Override requested model and duration with admin settings
        request.model = guest_limits.get("video_model", "omni-1.1-flash-360p")
        request.duration_seconds = guest_limits.get("video_duration", 4)
    is_guest = user.get("is_guest", False)

    # Queue limit: 1 user generating at a time, max 2 in queue, priority to subscribers
    if not is_pro and current_queued_jobs >= MAX_QUEUE_LIMIT:
        raise HTTPException(
            status_code=429,
            detail=f"Video generation queue is currently at capacity (maximum {MAX_QUEUE_LIMIT} queued). Pro subscribers receive instant priority. Please try again in 1-2 minutes."
        )
    
    if "baby songs" in clean_prompt.lower():
        logger.info(f"TESTING/TRAINING LOG: Baby songs prompt detected by user {user['user_id']}")

    # Enforce Botock Engine Flash rules
    selected_model = request.model or "omni-1.1-flash-360p"
    if selected_model not in ["omni-1.1-flash-360p", "omni-1.1-flash-720p"]:
        selected_model = "omni-1.1-flash-360p"

    # Guest restrictions
    if is_guest:
        duration_seconds = 4
        selected_model = "omni-1.1-flash-360p"
    else:
        # User restrictions
        duration_seconds = 4 if request.duration_seconds <= 4 else 8
        if duration_seconds == 8:
            selected_model = "omni-1.1-flash-360p"

    # Admin quota checking (just count today's generations)
    from app.routers.auth_otp import get_platform_settings
    from app.middleware.auth import _rpc
    quotas = get_platform_settings().get("quotas", {})
    daily_limit = int(quotas.get("free_daily_videos", 10)) # default 10 per day if not set

    # In distributed mode we reserve a queue position
    aspect_ratio = "9:16" if "9:16" in str(request.aspect_ratio) else "16:9"
    generation_id = str(uuid.uuid4())
    
    if settings.DISTRIBUTED_QUEUE_ENABLED:
        try:
            await queue.enqueue(
                generation_id,
                user["user_id"],
                {
                    "prompt": clean_prompt,
                    "is_pro": is_pro,
                    "model": selected_model,
                    "aspect_ratio": aspect_ratio,
                    "duration_seconds": duration_seconds,
                    "motion_hint": request.motion_hint,
                    "image_base64": request.image_base64,
                },
            )
        except QueueFullError as exc:
            raise HTTPException(
                status_code=429,
                detail=f"Video queue is at capacity ({exc.limit} waiting jobs). Please try again shortly.",
            )
        try:
            # We no longer deduct credits, just add to queue
            if not await queue.activate(generation_id, user["user_id"]):
                raise HTTPException(status_code=503, detail="Could not activate video generation. Please retry.")
        except Exception:
            await queue.cancel_reservation(generation_id, user["user_id"])
            raise
    else:
        save_ownership(generation_id, user["user_id"])
        
    video_statuses[generation_id] = {
        "user_id": user["user_id"],
        "status": "queued",
        "message": f"Video generation queued in Botock Engine ({selected_model}, {duration_seconds}s)."
    }, {duration_seconds}s)."
    }
    
    if not settings.DISTRIBUTED_QUEUE_ENABLED:
        # Legacy single-machine mode: run Playwright locally.
        current_queued_jobs += 1
        background_tasks.add_task(
            safe_generate_task,
            clean_prompt,
            generation_id,
            is_pro,
            selected_model,
            aspect_ratio,
            duration_seconds,
            request.motion_hint,
            request.image_base64,
            user["user_id"],
        )
    
    return VideoGenerateResponse(
        generation_id=generation_id,
        status="queued",
        message="Video generation started securely."
    )


@router.post("/close-session")
async def close_session(user: dict = Depends(get_optional_user)):
    """Closes and resets active Flow AI project continuity to conserve server memory."""
    await flow_service.reset_session()
    return {"status": "success", "message": "Flow AI session gracefully closed."}


@router.get("/credits")
async def get_credits(user: dict = Depends(get_optional_user)):
    """Returns the user's remaining daily credits and quota details."""
    from app.middleware.auth import get_user_credit_balance
    from app.routers.auth_otp import get_platform_settings
    quotas = get_platform_settings().get("quotas", {})
    daily_quota = int(quotas.get("free_daily_credits", settings.FREE_DAILY_CREDITS))
    model_costs = quotas.get("video_model_costs", {
        "omni-1.1-flash-360p": 15,
        "omni-1.1-flash-720p": 30
    })

    if user.get("is_pro"):
        return {
            "credits_remaining": 999999,
            "daily_quota": 999999,
            "video_model_costs": model_costs,
            "is_pro": True
        }
    remaining = await get_user_credit_balance(user["user_id"], daily_quota)
    return {
        "credits_remaining": remaining,
        "daily_quota": daily_quota,
        "video_model_costs": model_costs,
        "is_pro": False
    }


@router.get("/status/{generation_id}", response_model=VideoStatusResponse)
async def get_status(generation_id: str, user: dict = Depends(get_current_user_or_guest)):
    validate_uuid(generation_id)

    if settings.DISTRIBUTED_QUEUE_ENABLED:
        job = await queue.get_for_user(generation_id, user["user_id"])
        if not job:
            raise HTTPException(status_code=404, detail="Generation ID not found")
        status = job["status"]
        message = {
            "queued": "Allocating dedicated creative AI compute node...",
            "running": "Synthesizing neural video frames...",
            "completed": "Video generated successfully!",
            "failed": "Generation encountered an issue. Please try again.",
        }.get(status, "Generation pipeline is updating...")
        return VideoStatusResponse(
            generation_id=generation_id,
            status=status,
            message=message,
            download_url=f"/api/video/download/{generation_id}" if status == "completed" else None,
        )

    if generation_id not in video_statuses:
        raise HTTPException(status_code=404, detail="Generation ID not found")
        
    data = video_statuses[generation_id]
    if data.get("user_id") and data.get("user_id") != user["user_id"]:
        raise HTTPException(status_code=403, detail="Access denied: You do not own this video generation.")

    return VideoStatusResponse(
        generation_id=generation_id,
        status=data.get("status", "unknown"),
        message=data.get("message"),
        download_url=data.get("download_url")
    )


import json

def get_meta_path(generation_id: str) -> str:
    return os.path.realpath(os.path.join(settings.VIDEOS_DIR, f"{generation_id}.meta.json"))

def save_ownership(generation_id: str, user_id: str):
    meta_path = get_meta_path(generation_id)
    with open(meta_path, "w") as f:
        json.dump({"user_id": user_id}, f)

def check_ownership(generation_id: str, user_id: str):
    meta_path = get_meta_path(generation_id)
    
    if not os.path.exists(meta_path):
        raise HTTPException(status_code=403, detail="Access denied: Ownership metadata missing.")
        
    try:
        with open(meta_path, "r") as f:
            data = json.load(f)
    except Exception:
        raise HTTPException(status_code=403, detail="Access denied: Invalid metadata.")
        
    stored_user = data.get("user_id")
    if not stored_user or stored_user != user_id:
        raise HTTPException(status_code=403, detail="Access denied: You do not own this video generation.")

@router.get("/download/{generation_id}")
async def download_video(generation_id: str, user: dict = Depends(get_current_user_or_guest)):
    validate_uuid(generation_id)

    if settings.DISTRIBUTED_QUEUE_ENABLED:
        job = await queue.get_for_user(generation_id, user["user_id"])
        if not job:
            raise HTTPException(status_code=403, detail="Access denied: You do not own this video generation.")
        if job["status"] != "completed" or not job["output_object_key"]:
            raise HTTPException(status_code=404, detail="Video file not found or not yet generated.")
        try:
            content = await download_blob_video(job["output_object_key"])
        except Exception:
            logger.exception("Unable to fetch completed video %s from object storage", generation_id)
            raise HTTPException(status_code=404, detail="Video file is temporarily unavailable.")
        return Response(
            content=content,
            media_type="video/mp4",
            headers={"Content-Disposition": f'attachment; filename="{generation_id}.mp4"'},
        )

    # Persistent Ownership check
    check_ownership(generation_id, user["user_id"])

    # Resolve safe absolute path
    safe_filename = f"{generation_id}.mp4"
    file_path = os.path.realpath(os.path.join(settings.VIDEOS_DIR, safe_filename))
    expected_dir = os.path.realpath(settings.VIDEOS_DIR)

    # Ensure path stays strictly inside VIDEOS_DIR
    if os.path.commonpath([expected_dir, file_path]) != expected_dir:
        raise HTTPException(status_code=403, detail="Access denied.")

    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Video file not found or not yet generated.")
        
    return FileResponse(path=file_path, media_type="video/mp4", filename=safe_filename)


@router.get("/list", response_model=VideoListResponse)
async def list_videos(user: dict = Depends(get_optional_user)):
    videos = []
    user_id = user["user_id"]
    for gen_id, data in video_statuses.items():
        if data.get("user_id") == user_id:
            videos.append(VideoStatusResponse(
                generation_id=gen_id,
                status=data.get("status", "unknown"),
                message=data.get("message"),
                download_url=data.get("download_url")
            ))
    return VideoListResponse(videos=videos)
