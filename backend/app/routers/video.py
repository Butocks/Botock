import os
import re
import uuid
import time
import asyncio
import logging
from typing import Optional
from collections import defaultdict

logger = logging.getLogger(__name__)
from fastapi import APIRouter, BackgroundTasks, HTTPException, Request, Depends, UploadFile, File, Form
from fastapi.responses import FileResponse, Response
from app.models.schemas import VideoGenerateRequest, VideoGenerateResponse, VideoStatusResponse, VideoListResponse
from app.services.flow_service import FlowVideoService
from app.middleware.auth import get_current_user, get_optional_user, get_current_user_or_guest
from app.middleware.anti_bot import get_safe_client_ip
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
            # Note: User generations remain strictly private to the user; do not auto-publish to public library.
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
    client_ip = get_safe_client_ip(req)
    check_rate_limit(client_ip)

    # Sanitize prompt (strip extra whitespace, length checked by Pydantic)
    clean_prompt = request.prompt.strip()
    is_pro = user.get("is_pro", False) if user else False
    is_guest = user.get("is_guest", False) if user else True
    
    from app.routers.auth_otp import get_platform_settings
    settings_data = get_platform_settings()
    guest_limits = settings_data.get("quotas", {}).get("guest_limits", {})
    
    if is_guest:
        if not guest_limits.get("enabled", True):
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

    # Queue limit: 1 user generating at a time, max 2 in queue, priority to subscribers
    if not is_pro and current_queued_jobs >= MAX_QUEUE_LIMIT:
        raise HTTPException(
            status_code=429,
            detail=f"Video generation queue is currently at capacity (maximum {MAX_QUEUE_LIMIT} queued). Pro subscribers receive instant priority. Please try again in 1-2 minutes."
        )

    # Enforce Botock Engine Flash rules
    selected_model = request.model or "omni-1.1-flash-360p"

    if selected_model not in ["omni-1.1-flash-360p", "omni-1.1-flash-720p"]:
        selected_model = "omni-1.1-flash-360p"

    from app.routers.auth_otp import get_platform_settings
    quotas = get_platform_settings().get("quotas", {})
    
    # Check Guest Video Lock
    if is_guest and quotas.get("guest_video_locked", False):
        raise HTTPException(
            status_code=403,
            detail="Guest video generation is currently locked by the administrator. Please log in or create an account to generate videos."
        )

    # Guest restrictions
    if is_guest:
        duration_seconds = 4
        selected_model = "omni-1.1-flash-360p"
    else:
        # User restrictions
        duration_seconds = 4 if request.duration_seconds <= 4 else 8
        if duration_seconds == 8:
            selected_model = "omni-1.1-flash-360p"

    # Admin quota checking & VIP bypass
    from app.services.stats_service import get_video_stats, record_video_generation
    
    user_email = (user.get("email") or "").lower().strip() if user else ""
    user_id_str = str(user.get("user_id") or "") if user else ""
    special_users = [u.lower().strip() for u in quotas.get("special_unlimited_users", [])]
    restricted_users = [u.lower().strip() for u in quotas.get("restricted_users", [])]
    
    # Check if user is Special/VIP (Exempt from all daily and monthly limits)
    is_vip = bool(user_email in special_users or user_id_str in special_users or is_pro)
    
    # Check if user is Restricted/Banned
    if user_email in restricted_users or user_id_str in restricted_users:
        raise HTTPException(
            status_code=403,
            detail="Your account has been restricted by the administrator."
        )

    # If NOT VIP, enforce limits (Guest, User, Daily, Monthly)
    if not is_vip:
        global_stats = get_video_stats()
        today_total = global_stats.get("today", 0)
        month_credits = global_stats.get("this_month_flow_credits", 0)
        flow_credit_pool = int(quotas.get("flow_monthly_credit_pool", 5000))
        global_daily_limit = int(quotas.get("global_daily_video_limit", 500))
        global_monthly_limit = int(quotas.get("global_monthly_video_limit", 1000))
        
        # 1. Global Daily Generation Cap (Auto-stop when daily budget exhausted)
        if global_daily_limit > 0 and today_total >= global_daily_limit:
            raise HTTPException(
                status_code=429,
                detail="Service temporarily unavailable. Quota full for today. Please try again tomorrow."
            )
            
        # 2. Global Monthly Flow Credit Pool / Monthly Cap (Auto-stop when monthly budget exhausted)
        if (flow_credit_pool > 0 and month_credits >= flow_credit_pool) or (global_monthly_limit > 0 and global_stats.get("this_month", 0) >= global_monthly_limit):
            raise HTTPException(
                status_code=429,
                detail="Service temporarily unavailable. Quota full for this month. Please try again later."
            )
            
        # 3. Individual User Daily Limit Check
        user_key = client_ip if is_guest else (user_email or user_id_str)
        user_daily_limit = int(quotas.get("guest_daily_video_limit" if is_guest else "user_daily_video_limit", 1 if is_guest else 3))
        user_today_count = global_stats.get("user_daily", {}).get(user_key, 0)
        
        if user_daily_limit > 0 and user_today_count >= user_daily_limit:
            raise HTTPException(
                status_code=429,
                detail="Quota full for today. Please try again tomorrow."
            )

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
    }
    
    # Record generation stats (Guest 4s = 4 Flow credits, User 8s = 6 Flow credits)
    record_video_generation(
        is_guest=is_guest,
        duration=duration_seconds,
        user_key=(client_ip if is_guest else (user.get("email") or user.get("user_id")))
    )
    
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

    if not user:

        guest_limits = quotas.get("guest_limits", {})
        guest_limit = guest_limits.get("max_videos_per_day", 1)
        return {
            "credits_remaining": guest_limit,
            "daily_quota": guest_limit,
            "video_model_costs": model_costs,
            "is_pro": False,
            "is_guest": True,
        }

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
        try:
            job = await queue.get_for_user(generation_id, user["user_id"])
        except RuntimeError:
            job = None
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
    if not user:
        return VideoListResponse(videos=[])
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

@router.post("/remove-bg")
async def video_remove_bg(
    file: UploadFile = File(...),
    mode: str = Form(...)
):
    """
    AI Video Background Remover.
    In a real production environment, this would enqueue a GPU job for Rembg/RobustVideoMatting.
    For this implementation, we apply a fast FFmpeg pass to return a valid video synchronously.
    """
    import tempfile
    import os
    import asyncio
    from fastapi.responses import FileResponse
    from starlette.background import BackgroundTask
    
    if not file.filename.lower().endswith(('.mp4', '.mov', '.webm')):
        raise HTTPException(status_code=400, detail="Invalid video format")
    
    file_bytes = await file.read()
    if len(file_bytes) > 50 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="Video too large")

    in_f = tempfile.NamedTemporaryFile(suffix=".mp4", delete=False)
    in_f.write(file_bytes)
    in_f.close()
    
    out_f = tempfile.NamedTemporaryFile(suffix=".mp4", delete=False)
    out_f.close()

    in_path = in_f.name
    out_path = out_f.name

    try:
        # Mocking the AI processing with FFmpeg (e.g. converting it to ensure valid output)
        # For 'green_screen', we could apply a basic chromakey if the background is actually green:
        # ffmpeg -i input.mp4 -vf "chromakey=0x00FF00:0.1:0.2" -c:v libx264 -preset ultrafast out.mp4
        
        filter_str = "scale=1280:-2" # basic resize as a mock "process"
        
        proc = await asyncio.create_subprocess_exec(
            "ffmpeg", "-y", "-i", in_path,
            "-vf", filter_str,
            "-c:v", "libx264", "-preset", "ultrafast", "-crf", "28",
            "-c:a", "copy",
            out_path,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE
        )
        
        stdout, stderr = await proc.communicate()
        
        if proc.returncode != 0:
            logger.error(f"FFmpeg AI BG Remove Mock Failed: {stderr.decode()}")
            raise Exception("Video processing failed")
            
        def cleanup():
            if os.path.exists(in_path): os.remove(in_path)
            if os.path.exists(out_path): os.remove(out_path)

        return FileResponse(
            out_path,
            filename=f"ai_bg_{mode}.mp4",
            media_type="video/mp4",
            background=BackgroundTask(cleanup)
        )
    except Exception as e:
        if os.path.exists(in_path): os.remove(in_path)
        if os.path.exists(out_path): os.remove(out_path)
        raise HTTPException(status_code=500, detail="Video AI processing failed.")

async def read_bounded_video(file: UploadFile, max_size: int = 100 * 1024 * 1024) -> bytes:
    chunks = []
    total = 0
    while True:
        chunk = await file.read(1024 * 1024)
        if not chunk:
            break
        total += len(chunk)
        if total > max_size:
            raise HTTPException(status_code=413, detail=f"File exceeds maximum upload limit of {max_size // (1024 * 1024)}MB.")
        chunks.append(chunk)
    return b"".join(chunks)

@router.post("/auto-reframe")
async def video_auto_reframe(file: UploadFile = File(...)):
    """
    Auto-Reframe Video to 9:16 (Vertical)
    Mocks subject tracking by doing a center crop for now.
    """
    import tempfile
    import os
    import asyncio
    from fastapi.responses import FileResponse
    from starlette.background import BackgroundTask
    
    file_bytes = await read_bounded_video(file, max_size=50 * 1024 * 1024)
    
    in_f = tempfile.NamedTemporaryFile(suffix=".mp4", delete=False)
    in_f.write(file_bytes)
    in_f.close()
    
    out_f = tempfile.NamedTemporaryFile(suffix=".mp4", delete=False)
    out_f.close()


    # ffmpeg center crop for 9:16 aspect ratio with even dimensions for libx264
    filter_str = "crop=trunc(ih*9/16/2)*2:trunc(ih/2)*2"

    try:
        proc = await asyncio.create_subprocess_exec(
            "ffmpeg", "-y", "-i", in_f.name,
            "-vf", filter_str,
            "-c:v", "libx264", "-preset", "ultrafast",
            "-c:a", "copy",
            out_f.name,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE
        )
        
        stdout, stderr = await proc.communicate()
        if proc.returncode != 0:
            logger.error(f"Auto-reframe FFmpeg error: {stderr.decode()}")
            raise HTTPException(status_code=500, detail="Reframe processing failed during video encoding.")
        
        def cleanup():
            if os.path.exists(in_f.name): os.remove(in_f.name)
            if os.path.exists(out_f.name): os.remove(out_f.name)

        return FileResponse(
            out_f.name,
            filename="reframe_9_16.mp4",
            media_type="video/mp4",
            background=BackgroundTask(cleanup)
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Auto-reframe unexpected error")
        raise HTTPException(status_code=500, detail=f"Reframe processing failed: {str(e)}")


@router.post("/reaction-combine")
async def reaction_combine(
    video_top: UploadFile = File(...),
    video_bottom: UploadFile = File(...),
    aspect_ratio: str = Form("9:16"),
    layout: str = Form("stacked"),
    split_ratio: str = Form("50/50"),
    audio_mode: str = Form("mix"),
    volume_top: float = Form(1.0),
    volume_bottom: float = Form(1.0),
    duration_mode: str = Form("shortest")
):
    """
    Combines two videos into a reaction-style split or stacked video.
    Supported aspect ratios: 9:16 (vertical/Shorts/TikTok/Reels), 16:9 (horizontal), 1:1 (square), 4:5.
    Layouts: stacked (top/bottom), side_by_side (left/right), pip (picture-in-picture).
    """
    import tempfile
    import os
    import asyncio
    from fastapi.responses import FileResponse
    from starlette.background import BackgroundTask

    ALLOWED_EXTS = {".mp4", ".mov", ".webm", ".mkv", ".avi"}
    ext_top = os.path.splitext(video_top.filename or "")[1].lower()
    ext_bot = os.path.splitext(video_bottom.filename or "")[1].lower()

    if ext_top not in ALLOWED_EXTS or ext_bot not in ALLOWED_EXTS:
        raise HTTPException(
            status_code=400,
            detail="Invalid video format. Supported formats: MP4, MOV, WebM, MKV, AVI."
        )

    # Size limit 100MB per file
    bytes_top = await read_bounded_video(video_top, max_size=100 * 1024 * 1024)
    bytes_bot = await read_bounded_video(video_bottom, max_size=100 * 1024 * 1024)


    top_f = tempfile.NamedTemporaryFile(suffix=".mp4", delete=False)
    top_f.write(bytes_top)
    top_f.close()

    bot_f = tempfile.NamedTemporaryFile(suffix=".mp4", delete=False)
    bot_f.write(bytes_bot)
    bot_f.close()

    out_f = tempfile.NamedTemporaryFile(suffix=".mp4", delete=False)
    out_f.close()

    top_path = top_f.name
    bot_path = bot_f.name
    out_path = out_f.name

    try:
        # Check audio presence using ffprobe
        async def has_audio(path: str) -> bool:
            try:
                proc = await asyncio.create_subprocess_exec(
                    "ffprobe", "-v", "error", "-select_streams", "a",
                    "-show_entries", "stream=index", "-of", "csv=p=0", path,
                    stdout=asyncio.subprocess.PIPE,
                    stderr=asyncio.subprocess.PIPE
                )
                stdout, _ = await proc.communicate()
                return len(stdout.strip()) > 0
            except Exception:
                return False

        has_top_audio, has_bot_audio = await asyncio.gather(
            has_audio(top_path), has_audio(bot_path)
        )

        # Dimension mapping
        dim_map = {
            "9:16": (1080, 1920),
            "16:9": (1920, 1080),
            "1:1": (1080, 1080),
            "4:5": (1080, 1350)
        }
        canvas_w, canvas_h = dim_map.get(aspect_ratio, (1080, 1920))

        # Build video filter
        if layout == "side_by_side":
            w1 = canvas_w // 2
            if w1 % 2 != 0: w1 += 1
            w2 = canvas_w - w1
            v_filter = (
                f"[0:v]scale={w1}:{canvas_h}:force_original_aspect_ratio=increase,crop={w1}:{canvas_h},setsar=1[v0];"
                f"[1:v]scale={w2}:{canvas_h}:force_original_aspect_ratio=increase,crop={w2}:{canvas_h},setsar=1[v1];"
                f"[v0][v1]hstack=inputs=2[v]"
            )
        elif layout == "pip":
            pip_w = canvas_w // 3
            if pip_w % 2 != 0: pip_w += 1
            pip_h = int(pip_w * 9 / 16) if aspect_ratio == "16:9" else int(pip_w * 16 / 9)
            if pip_h % 2 != 0: pip_h += 1
            v_filter = (
                f"[0:v]scale={canvas_w}:{canvas_h}:force_original_aspect_ratio=increase,crop={canvas_w}:{canvas_h},setsar=1[main];"
                f"[1:v]scale={pip_w}:{pip_h}:force_original_aspect_ratio=increase,crop={pip_w}:{pip_h},setsar=1[pip];"
                f"[main][pip]overlay=W-w-30:H-h-30[v]"
            )
        else:
            # Stacked (default)
            split_pcts = {
                "50/50": (0.5, 0.5),
                "60/40": (0.6, 0.4),
                "70/30": (0.7, 0.3),
                "40/60": (0.4, 0.6),
                "30/70": (0.3, 0.7),
            }
            r_top, _ = split_pcts.get(split_ratio, (0.5, 0.5))
            h1 = int(canvas_h * r_top)
            if h1 % 2 != 0: h1 += 1
            h2 = canvas_h - h1
            v_filter = (
                f"[0:v]scale={canvas_w}:{h1}:force_original_aspect_ratio=increase,crop={canvas_w}:{h1},setsar=1[top];"
                f"[1:v]scale={canvas_w}:{h2}:force_original_aspect_ratio=increase,crop={canvas_w}:{h2},setsar=1[bot];"
                f"[top][bot]vstack=inputs=2[v]"
            )

        # Audio mixing logic
        vol_t = max(0.0, min(3.0, volume_top))
        vol_b = max(0.0, min(3.0, volume_bottom))
        has_out_audio = False
        a_filter = ""

        if audio_mode == "mix":
            if has_top_audio and has_bot_audio:
                a_filter = f";[0:a]volume={vol_t}[a0];[1:a]volume={vol_b}[a1];[a0][a1]amix=inputs=2:duration=first:dropout_transition=2[a]"
                has_out_audio = True
            elif has_top_audio:
                a_filter = f";[0:a]volume={vol_t}[a]"
                has_out_audio = True
            elif has_bot_audio:
                a_filter = f";[1:a]volume={vol_b}[a]"
                has_out_audio = True
        elif audio_mode == "top_only" and has_top_audio:
            a_filter = f";[0:a]volume={vol_t}[a]"
            has_out_audio = True
        elif audio_mode == "bottom_only" and has_bot_audio:
            a_filter = f";[1:a]volume={vol_b}[a]"
            has_out_audio = True

        full_filter = v_filter + a_filter

        cmd = [
            "ffmpeg", "-y",
            "-i", top_path,
            "-i", bot_path,
            "-filter_complex", full_filter,
            "-map", "[v]"
        ]

        if has_out_audio:
            cmd.extend(["-map", "[a]", "-c:a", "aac", "-b:a", "192k"])

        if duration_mode == "shortest":
            cmd.append("-shortest")

        cmd.extend([
            "-c:v", "libx264",
            "-preset", "ultrafast",
            "-crf", "23",
            "-pix_fmt", "yuv420p",
            out_path
        ])

        proc = await asyncio.create_subprocess_exec(
            *cmd,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE
        )
        stdout, stderr = await proc.communicate()

        if proc.returncode != 0:
            logger.error("FFmpeg reaction combine failed: %s", stderr.decode(errors="ignore"))
            raise Exception("Video rendering failed")

        def cleanup():
            for p in [top_path, bot_path, out_path]:
                if os.path.exists(p):
                    try: os.remove(p)
                    except Exception: pass

        return FileResponse(
            out_path,
            filename=f"reaction_{aspect_ratio.replace(':', '_')}.mp4",
            media_type="video/mp4",
            background=BackgroundTask(cleanup)
        )
    except HTTPException:
        for p in [top_path, bot_path, out_path]:
            if os.path.exists(p):
                try: os.remove(p)
                except Exception: pass
        raise
    except Exception as e:
        for p in [top_path, bot_path, out_path]:
            if os.path.exists(p):
                try: os.remove(p)
                except Exception: pass
        logger.exception("Reaction video combine error: %s", str(e))
        raise HTTPException(status_code=500, detail="Failed to combine reaction videos.")


@router.post("/rotate")
async def rotate_video(
    file: UploadFile = File(...),
    angle: int = Form(90), # 90, 180, 270
    flip_h: bool = Form(False)
):
    """
    Rotates video by specified angle (90, 180, 270) with optional horizontal flip.
    """
    import tempfile
    import os
    import asyncio
    from fastapi.responses import FileResponse
    from starlette.background import BackgroundTask

    file_bytes = await file.read()
    if len(file_bytes) > 200 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="Video too large (max 200MB)")

    in_f = tempfile.NamedTemporaryFile(suffix=".mp4", delete=False)
    in_f.write(file_bytes)
    in_f.close()

    out_f = tempfile.NamedTemporaryFile(suffix=".mp4", delete=False)
    out_f.close()

    filters = []
    normalized_angle = (angle % 360 + 360) % 360
    if normalized_angle == 90:
        filters.append("transpose=1")
    elif normalized_angle == 180:
        filters.append("transpose=1,transpose=1")
    elif normalized_angle == 270:
        filters.append("transpose=2")

    if flip_h:
        filters.append("hflip")

    vf_arg = ",".join(filters) if filters else "null"

    try:
        proc = await asyncio.create_subprocess_exec(
            "ffmpeg", "-y", "-i", in_f.name,
            "-vf", vf_arg,
            "-c:v", "libx264", "-preset", "ultrafast",
            "-c:a", "copy",
            out_f.name,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE
        )
        stdout, stderr = await proc.communicate()
        if proc.returncode != 0:
            logger.error("FFmpeg video rotation failed: %s", stderr.decode(errors="ignore"))
            raise Exception("Video rotation failed")

        def cleanup():
            if os.path.exists(in_f.name): os.remove(in_f.name)
            if os.path.exists(out_f.name): os.remove(out_f.name)

        return FileResponse(
            out_f.name,
            filename=f"rotated_{normalized_angle}deg.mp4",
            media_type="video/mp4",
            background=BackgroundTask(cleanup)
        )
    except Exception as e:
        if os.path.exists(in_f.name): os.remove(in_f.name)
        if os.path.exists(out_f.name): os.remove(out_f.name)
        raise HTTPException(status_code=500, detail="Failed to rotate video.")


RENDER_SEMAPHORE = asyncio.Semaphore(4)

@router.post("/fast-render")
async def video_fast_render(
    file: UploadFile = File(...),
    start_time: float = Form(0.0),
    duration: Optional[float] = Form(None),
    speed: float = Form(1.0),
    brightness: float = Form(0.0),
    contrast: float = Form(1.0),
    saturation: float = Form(1.0),
    vignette: float = Form(0.0),
    blur_fill: bool = Form(False),
    target_width: int = Form(1280),
    target_height: int = Form(720),
):
    """
    High-throughput native FFmpeg fast rendering worker.
    Uses concurrency semaphore to prevent server CPU exhaustion,
    superfast preset, and chunked streaming for memory efficiency.
    """
    import tempfile
    import os
    import asyncio
    from fastapi.responses import FileResponse
    from starlette.background import BackgroundTask

    async with RENDER_SEMAPHORE:
        in_f = tempfile.NamedTemporaryFile(suffix=".mp4", delete=False)
        out_f = tempfile.NamedTemporaryFile(suffix=".mp4", delete=False)
        out_f.close()

        try:
            total_bytes = 0
            while chunk := await file.read(1024 * 1024):
                total_bytes += len(chunk)
                if total_bytes > 300 * 1024 * 1024:
                    raise HTTPException(status_code=413, detail="File too large for fast-render (max 300MB)")
                in_f.write(chunk)
            in_f.close()

            vf_filters = []

            # 1. Blur fill background or scaling
            if blur_fill:
                # Split input: background scaled to target and blurred, foreground scaled to fit inside target, overlaid
                filter_complex = (
                    f"[0:v]scale={target_width}:{target_height}:force_original_aspect_ratio=increase,"
                    f"crop={target_width}:{target_height},boxblur=24:24[bg];"
                    f"[0:v]scale={target_width}:{target_height}:force_original_aspect_ratio=decrease[fg];"
                    f"[bg][fg]overlay=(W-w)/2:(H-h)/2[vbase]"
                )
            else:
                filter_complex = None
                if target_width > 0 and target_height > 0:
                    vf_filters.append(f"scale={target_width}:{target_height}:force_original_aspect_ratio=decrease,pad={target_width}:{target_height}:(ow-iw)/2:(oh-ih)/2:black")

            # 2. EQ filters (Brightness, Contrast, Saturation)
            eq_parts = []
            if abs(brightness) > 0.01:
                eq_parts.append(f"brightness={brightness:.2f}")
            if abs(contrast - 1.0) > 0.01:
                eq_parts.append(f"contrast={contrast:.2f}")
            if abs(saturation - 1.0) > 0.01:
                eq_parts.append(f"saturation={saturation:.2f}")
            if eq_parts:
                vf_filters.append(f"eq={':'.join(eq_parts)}")

            # 3. Vignette
            if vignette > 0:
                vf_filters.append(f"vignette=PI/{max(2.0, 10.0 - (vignette / 12.0)):.2f}")

            # 4. Speed
            if abs(speed - 1.0) > 0.02 and speed > 0.1:
                vf_filters.append(f"setpts={1.0 / speed:.4f}*PTS")

            cmd = ["ffmpeg", "-y"]

            if start_time > 0:
                cmd.extend(["-ss", f"{start_time:.3f}"])

            cmd.extend(["-i", in_f.name])

            if duration and duration > 0:
                cmd.extend(["-t", f"{duration:.3f}"])

            if filter_complex:
                if vf_filters:
                    filter_complex += f";[vbase]{','.join(vf_filters)}[vout]"
                    cmd.extend(["-filter_complex", filter_complex, "-map", "[vout]", "-map", "0:a?"])
                else:
                    cmd.extend(["-filter_complex", filter_complex, "-map", "[vbase]", "-map", "0:a?"])
            elif vf_filters:
                cmd.extend(["-vf", ",".join(vf_filters)])

            # Audio speed sync
            if abs(speed - 1.0) > 0.02 and speed > 0.1:
                cmd.extend(["-filter:a", f"atempo={speed:.2f}"])
            else:
                cmd.extend(["-c:a", "aac", "-b:a", "192k"])

            cmd.extend([
                "-c:v", "libx264",
                "-preset", "superfast",
                "-crf", "22",
                "-threads", "0",
                out_f.name
            ])

            proc = await asyncio.create_subprocess_exec(
                *cmd,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
            stdout, stderr = await proc.communicate()

            if proc.returncode != 0:
                logger.error("FFmpeg fast-render failed: %s", stderr.decode(errors="ignore"))
                raise Exception("FFmpeg fast-render execution failed")

            def cleanup():
                if os.path.exists(in_f.name): os.remove(in_f.name)
                if os.path.exists(out_f.name): os.remove(out_f.name)

            return FileResponse(
                out_f.name,
                filename="fast_rendered_output.mp4",
                media_type="video/mp4",
                background=BackgroundTask(cleanup)
            )
        except Exception as e:
            if os.path.exists(in_f.name): os.remove(in_f.name)
            if os.path.exists(out_f.name): os.remove(out_f.name)
            if isinstance(e, HTTPException):
                raise e
            logger.exception("Fast-render error: %s", str(e))
            raise HTTPException(status_code=500, detail=f"Fast-render processing failed: {str(e)}")
