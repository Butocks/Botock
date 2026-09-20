from pydantic import BaseModel, Field
from typing import Optional

# ----------------- VIDEO SCHEMAS -----------------
class VideoGenerateRequest(BaseModel):
    prompt: str = Field(..., min_length=3, max_length=1000)
    aspect_ratio: str = Field(default="16:9")
    model: Optional[str] = Field(default="omni-1.1-flash-360p")
    duration_seconds: Optional[int] = Field(default=4)  # 4, 6, 8, 10
    motion_hint: Optional[str] = None
    image_base64: Optional[str] = None

class VideoGenerateResponse(BaseModel):
    generation_id: str
    status: str
    message: str

class VideoStatusResponse(BaseModel):
    generation_id: str
    status: str
    download_url: Optional[str] = None
    message: Optional[str] = None

class VideoListResponse(BaseModel):
    videos: list[VideoStatusResponse]


# ----------------- IMAGE SCHEMAS (Nano Banana) -----------------
class ImageGenerateRequest(BaseModel):
    prompt: str = Field(..., min_length=3, max_length=1000)
    aspect_ratio: str = Field(default="1:1")  # 16:9, 4:3, 1:1, 3:4, 9:16
    model: Optional[str] = Field(default="nano-banana-2")  # nano-banana-lite, nano-banana-2, nano-banana-pro
    style: Optional[str] = None
    image_base64: Optional[str] = None

class ImageGenerateResponse(BaseModel):
    generation_id: str
    status: str
    message: str

class ImageStatusResponse(BaseModel):
    generation_id: str
    status: str
    download_url: Optional[str] = None
    image_url: Optional[str] = None
    message: Optional[str] = None

class ImageListResponse(BaseModel):
    images: list[ImageStatusResponse]
