import os
import re
import uuid
import time
import asyncio
from collections import defaultdict
from fastapi import APIRouter, BackgroundTasks, HTTPException, Request, Depends
from fastapi.responses import FileResponse
from app.models.schemas import VideoGenerateRequest, VideoGenerateResponse, VideoStatusResponse, VideoListResponse
from app.services.flow_service import FlowVideoService
from app.middleware.auth import check_daily_quota
from app.config import settings

router = APIRouter(prefix="/api/video", tags=["Video"])

# In-memory status store
video_statuses = {}

flow_service = FlowVideoService()

# ----------------------------------------------------
# SECURITY LAYER 1: Concurrency Limiter
# Prevents server crash by limiting concurrent Playwright instances
# ----------------------------------------------------
MAX_CONCURRENT_GENERATIONS = 2
generation_semaphore = asyncio.Semaphore(MAX_CONCURRENT_GENERATIONS)

# ----------------------------------------------------
# SECURITY LAYER 2: IP-Based Rate Limiting
# Max 5 video generation requests per 10 minutes per IP
# ----------------------------------------------------
RATE_LIMIT_WINDOW = 600  # 10 minutes
MAX_REQUESTS_PER_WINDOW = 5
ip_request_history = defaultdict(list)


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
    motion_hint: str = None,
):
    """Wrapper that enforces the concurrency semaphore."""
    async with generation_semaphore:
        await flow_service.generate_video(
            prompt=prompt,
            generation_id=generation_id,
            status_dict=video_statuses,
            is_pro=is_pro,
            model=model,
            motion_hint=motion_hint,
        )


@router.post("/generate", response_model=VideoGenerateResponse)
async def generate_video(
    request: VideoGenerateRequest,
    req: Request,
    background_tasks: BackgroundTasks,
    user: dict = Depends(check_daily_quota),
):
    client_ip = req.client.host if req.client else "unknown"
    check_rate_limit(client_ip)

    # Sanitize prompt (strip extra whitespace, length checked by Pydantic)
    clean_prompt = request.prompt.strip()
    is_pro = user.get("is_pro", False)

    # Free users are strictly locked to Omni 1.1 Flash 360p (Anti-Prompt / Anti-Tier Injection)
    selected_model = request.model or "omni-1.1-flash-360p"
    if not is_pro and selected_model != "omni-1.1-flash-360p":
        selected_model = "omni-1.1-flash-360p"

    generation_id = str(uuid.uuid4())
    
    video_statuses[generation_id] = {
        "status": "queued",
        "message": "Video generation queued in secure pipeline."
    }
    
    # Run the playwright automation inside the concurrency-limited background task
    background_tasks.add_task(
        safe_generate_task,
        clean_prompt,
        generation_id,
        is_pro,
        selected_model,
        request.motion_hint,
    )
    
    return VideoGenerateResponse(
        generation_id=generation_id,
        status="queued",
        message="Video generation started securely."
    )


@router.get("/status/{generation_id}", response_model=VideoStatusResponse)
async def get_status(generation_id: str):
    validate_uuid(generation_id)

    if generation_id not in video_statuses:
        raise HTTPException(status_code=404, detail="Generation ID not found")
        
    data = video_statuses[generation_id]
    return VideoStatusResponse(
        generation_id=generation_id,
        status=data.get("status", "unknown"),
        message=data.get("message"),
        download_url=data.get("download_url")
    )


@router.get("/download/{generation_id}")
async def download_video(generation_id: str):
    validate_uuid(generation_id)

    # Resolve safe absolute path
    safe_filename = f"{generation_id}.mp4"
    file_path = os.path.realpath(os.path.join(settings.VIDEOS_DIR, safe_filename))
    expected_dir = os.path.realpath(settings.VIDEOS_DIR)

    # Ensure path stays strictly inside VIDEOS_DIR
    if not file_path.startswith(expected_dir):
        raise HTTPException(status_code=403, detail="Access denied.")

    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Video file not found or not yet generated.")
        
    return FileResponse(path=file_path, media_type="video/mp4", filename=safe_filename)


@router.get("/list", response_model=VideoListResponse)
async def list_videos():
    videos = []
    for gen_id, data in video_statuses.items():
        videos.append(VideoStatusResponse(
            generation_id=gen_id,
            status=data.get("status", "unknown"),
            message=data.get("message"),
            download_url=data.get("download_url")
        ))
    return VideoListResponse(videos=videos)
