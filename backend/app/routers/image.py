import os
import re
import json
import uuid
import asyncio
import logging
from typing import Optional
from fastapi import APIRouter, BackgroundTasks, HTTPException, Request, Depends, UploadFile, File, Form
from fastapi.responses import FileResponse

from app.models.schemas import ImageGenerateRequest, ImageGenerateResponse, ImageStatusResponse, ImageListResponse
from app.services.image_service import NanoBananaImageService
from app.middleware.auth import check_daily_image_quota, get_current_user, get_current_user_or_guest
from app.middleware.anti_bot import get_safe_client_ip
from app.config import settings

logger = logging.getLogger(__name__)


router = APIRouter(prefix="/api/image", tags=["Image"])

image_statuses = {}
image_service = NanoBananaImageService()

UUID_REGEX = re.compile(r"^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$")

def validate_uuid(val: str):
    if not UUID_REGEX.match(val):
        raise HTTPException(status_code=400, detail="Invalid generation ID format.")


# ----------------------------------------------------
# SECURITY LAYER 1: Concurrency Limiter
# Prevents server crash and cross-session race conditions
# ----------------------------------------------------
MAX_CONCURRENT_IMAGE_GENERATIONS = 2
image_generation_semaphore = asyncio.Semaphore(MAX_CONCURRENT_IMAGE_GENERATIONS)


async def safe_image_generate_task(
    prompt: str,
    generation_id: str,
    aspect_ratio: str,
    model: str,
    style: str = None,
    image_base64: str = None,
    is_pro: bool = False,
):
    async with image_generation_semaphore:
        await image_service.generate_image(
            prompt=prompt,
            generation_id=generation_id,
            status_dict=image_statuses,
            aspect_ratio=aspect_ratio,
            model=model,
            image_base64=image_base64,
            style=style,
            is_pro=is_pro,
        )
        # User generated images remain strictly private; do not auto-publish to public library.


@router.post("/generate", response_model=ImageGenerateResponse)
async def generate_image(
    request: ImageGenerateRequest,
    req: Request,
    background_tasks: BackgroundTasks,
    user: dict = Depends(get_current_user_or_guest),
):
    clean_prompt = request.prompt.strip()
    is_pro = user.get("is_pro", False)
    is_guest = user.get("is_guest", False)
    
    from app.middleware.auth import _rpc
    from app.routers.auth_otp import get_platform_settings

    # Verify daily quota
    if not is_pro:
        client_ip = get_safe_client_ip(req)
        try:
            limit_res = await _rpc("check_generation_limit", {
                "p_user_id": None if is_guest else user["user_id"],
                "p_guest_ip": client_ip if is_guest else None,
                "p_type": "image"
            })
            if limit_res and not limit_res.get("allowed", True):
                raise HTTPException(status_code=429, detail=limit_res.get("reason", "Daily image quota reached. Please try again tomorrow."))
        except HTTPException as he:
            if he.status_code == 429:
                raise
            logger.warning(f"Image quota verification check non-fatal error: {he.detail}")
        except Exception as e:
            logger.warning(f"Image quota verification check non-fatal error: {e}")
    
    generation_id = str(uuid.uuid4())
    
    # Model selection from request, defaulting to botockGen
    selected_model = request.model or "botockGen"

    allowed_aspect_ratios = ["16:9", "4:3", "1:1", "3:4", "9:16"]
    selected_ratio = request.aspect_ratio if request.aspect_ratio in allowed_aspect_ratios else "1:1"


    save_ownership(generation_id, user["user_id"])
    image_statuses[generation_id] = {
        "user_id": user["user_id"],
        "status": "queued",
        "message": f"Queued {selected_model.replace('-', ' ').title()} generation ({selected_ratio})...",
    }

    background_tasks.add_task(
        safe_image_generate_task,
        clean_prompt,
        generation_id,
        selected_ratio,
        selected_model,
        request.style,
        request.image_base64,
        is_pro,
    )

    return ImageGenerateResponse(
        generation_id=generation_id,
        status="queued",
        message="Image generation queued successfully.",
    )


@router.get("/status/{generation_id}", response_model=ImageStatusResponse)
async def get_image_status(generation_id: str, user: dict = Depends(get_current_user_or_guest)):
    validate_uuid(generation_id)

    if generation_id not in image_statuses:
        raise HTTPException(status_code=404, detail="Image generation ID not found.")

    data = image_statuses[generation_id]
    if data.get("user_id") and data.get("user_id") != user["user_id"]:
        raise HTTPException(status_code=403, detail="Access denied: You do not own this image generation.")

    return ImageStatusResponse(
        generation_id=generation_id,
        status=data.get("status", "unknown"),
        message=data.get("message"),
        download_url=data.get("download_url"),
        image_url=data.get("image_url"),
    )


import json

def get_meta_path(generation_id: str) -> str:
    return os.path.realpath(os.path.join(settings.IMAGES_DIR, f"{generation_id}.meta.json"))

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
        raise HTTPException(status_code=403, detail="Access denied: You do not own this image generation.")

@router.get("/download/{generation_id}")
async def download_image(generation_id: str, user: dict = Depends(get_current_user_or_guest)):
    validate_uuid(generation_id)

    # Persistent Ownership check
    check_ownership(generation_id, user["user_id"])

    safe_filename = f"{generation_id}.png"
    file_path = os.path.realpath(os.path.join(settings.IMAGES_DIR, safe_filename))
    expected_dir = os.path.realpath(settings.IMAGES_DIR)

    if os.path.commonpath([expected_dir, file_path]) != expected_dir:
        raise HTTPException(status_code=403, detail="Access denied.")

    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Image file not found or not yet generated.")

    return FileResponse(path=file_path, media_type="image/png", filename=f"botock-image-{safe_filename}")


@router.post("/process/{tool_slug}")
@router.post("/{tool_slug}")
async def handle_fast_image_tool(
    tool_slug: str,
    request: Request,
    file: UploadFile = File(...),
    options: Optional[str] = Form(None)
):
    """
    Ultra-Fast C-accelerated PIL Image Processing Pipeline.
    Prevents browser canvas freezes on high-res images and processes conversions,
    upscaling, filters, and resizing in under 100ms.
    """
    if tool_slug in ("generate", "status", "download") and "/process/" not in request.url.path:
        raise HTTPException(status_code=404, detail="Endpoint not found")

    import io
    from PIL import Image, ImageOps, ImageFilter
    from fastapi.responses import Response

    opts = {}
    if options:
        try:
            opts = json.loads(options) if isinstance(options, str) else options
        except Exception:
            opts = {}

    form_data = await request.form()
    for k, v in form_data.items():
        if k not in ("file", "options", "tool") and k not in opts:
            opts[k] = v

    image_bytes = await file.read()
    if len(image_bytes) > 25 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="Image exceeds 25MB limit")

    if tool_slug in ("image-remove-bg", "remove-bg"):
        try:
            from app.routers.remove_bg import _process_image
            result_bytes = await asyncio.to_thread(_process_image, image_bytes)
            return Response(content=result_bytes, media_type="image/png")
        except Exception as e:
            logger.exception("Image remove-bg failed: %s", e)
            raise HTTPException(status_code=500, detail="Background removal failed")

    def _process_pil():
        img = Image.open(io.BytesIO(image_bytes))
        out_format = opts.get("format", "PNG").upper()
        if out_format in ("JPG", "JPEG"):
            out_format = "JPEG"
            if img.mode in ("RGBA", "P"):
                img = img.convert("RGB")
        elif out_format == "WEBP":
            pass
        else:
            out_format = "PNG"

        if tool_slug == "image-upscale":
            scale = float(opts.get("scale", opts.get("scaleFactor", 2)))
            scale = max(1.0, min(8.0, scale))
            new_w = int(img.width * scale)
            new_h = int(img.height * scale)
            img = img.resize((new_w, new_h), Image.Resampling.LANCZOS)

        elif tool_slug == "image-resize":
            w = int(opts.get("width", img.width))
            h = int(opts.get("height", img.height))
            if w > 0 and h > 0:
                img = img.resize((w, h), Image.Resampling.LANCZOS)

        elif tool_slug == "image-rotate":
            angle = float(opts.get("angle", 90))
            img = img.rotate(-angle, expand=True)

        elif tool_slug == "image-filters":
            filter_type = str(opts.get("filter", "grayscale")).lower()
            if "gray" in filter_type:
                img = ImageOps.grayscale(img)
            elif "invert" in filter_type:
                if img.mode in ("RGBA", "LA"):
                    r, g, b, a = img.split()
                    rgb = Image.merge("RGB", (r, g, b))
                    inv = ImageOps.invert(rgb)
                    ir, ig, ib = inv.split()
                    img = Image.merge("RGBA", (ir, ig, ib, a))
                else:
                    img = ImageOps.invert(img.convert("RGB"))
            elif "blur" in filter_type:
                img = img.filter(ImageFilter.GaussianBlur(radius=float(opts.get("radius", 3))))
            elif "sharpen" in filter_type:
                img = img.filter(ImageFilter.SHARPEN)

        quality = int(float(opts.get("quality", 85)))
        buf = io.BytesIO()
        if out_format == "JPEG":
            img.save(buf, format="JPEG", quality=quality, optimize=True)
        elif out_format == "WEBP":
            img.save(buf, format="WEBP", quality=quality)
        else:
            img.save(buf, format="PNG", optimize=True)

        return buf.getvalue(), out_format

    try:
        processed_data, fmt = await asyncio.to_thread(_process_pil)
        media_type = f"image/{fmt.lower()}"
        return Response(content=processed_data, media_type=media_type)
    except Exception as e:
        logger.exception("PIL processing failed (%s): %s", tool_slug, e)
        raise HTTPException(status_code=500, detail=f"Image processing failed: {str(e)}")

