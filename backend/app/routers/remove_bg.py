import io
import asyncio
import logging
from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import StreamingResponse
from PIL import Image

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/image", tags=["Image Tools"])

# Concurrency limiter
MAX_CONCURRENT_BG_REMOVAL = 3
_bg_removal_semaphore = asyncio.Semaphore(MAX_CONCURRENT_BG_REMOVAL)

# Lazy model singleton
_rembg_session = None


def _get_rembg_session():
    global _rembg_session
    if _rembg_session is None:
        from rembg import new_session
        _rembg_session = new_session(model_name="isnet-general-use")
        logger.info("rembg model loaded: isnet-general-use")
    return _rembg_session


MAX_DIMENSION = 1920
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp"}


@router.post("/remove-bg")
async def remove_background(file: UploadFile = File(...)):
    # Validate content type
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=400, detail="Unsupported image format. Use JPG, PNG, or WEBP.")
    
    # Read and validate size
    image_bytes = await file.read()
    if len(image_bytes) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="Image too large. Maximum size is 10MB.")
    
    async with _bg_removal_semaphore:
        try:
            result = await asyncio.to_thread(_process_image, image_bytes)
        except Exception as e:
            logger.exception("Background removal failed")
            raise HTTPException(status_code=500, detail="Background removal failed. Please try again.")
    
    return StreamingResponse(io.BytesIO(result), media_type="image/png")


def _process_image(image_bytes: bytes) -> bytes:
    """Resize if needed, run rembg, return PNG bytes."""
    from rembg import remove
    
    img = Image.open(io.BytesIO(image_bytes))
    
    # Auto-resize large images for faster processing
    w, h = img.size
    if max(w, h) > MAX_DIMENSION:
        ratio = MAX_DIMENSION / max(w, h)
        new_w, new_h = int(w * ratio), int(h * ratio)
        img = img.resize((new_w, new_h), Image.LANCZOS)
        # Convert resized image back to bytes
        buf = io.BytesIO()
        img.save(buf, format="PNG")
        image_bytes = buf.getvalue()
    
    session = _get_rembg_session()
    result = remove(image_bytes, session=session)
    return result
