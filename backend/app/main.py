import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.routers import video, image
from app.config import settings
from app.services.google_auth import ensure_valid_session
from app.services.cleanup_service import purge_expired_videos

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup: run cleanup sweep & verify Google Flow session."""
    logger.info("=" * 60)
    logger.info(f"Starting {settings.PROJECT_NAME}")
    logger.info("=" * 60)

    # 1. Run 24-hour cleanup sweep on startup
    try:
        purged = purge_expired_videos()
        logger.info(f"🧹 Startup sweep: cleaned up {purged} expired files.")
    except Exception as e:
        logger.warning(f"⚠️ Startup cleanup sweep failed: {e}")

    if settings.GOOGLE_EMAIL and settings.GOOGLE_PASSWORD:
        logger.info(f"Google credentials found for: {settings.GOOGLE_EMAIL}")
        logger.info("Attempting auto-login to Google Flow on startup...")
        success = await ensure_valid_session()
        if success:
            logger.info("✅ Google Flow session is ready!")
        else:
            logger.warning(
                "⚠️ Auto-login failed on startup. "
                "Will retry on first video generation request. "
                "Check GOOGLE_EMAIL, GOOGLE_PASSWORD in .env"
            )
    else:
        logger.warning(
            "⚠️ GOOGLE_EMAIL and/or GOOGLE_PASSWORD not set in .env! "
            "Video generation will not work without Google credentials."
        )

    yield  # App runs

    logger.info("Shutting down...")


app = FastAPI(title=settings.PROJECT_NAME, lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(video.router)
app.include_router(image.router)

# Serve generated videos and images as static files
app.mount("/videos", StaticFiles(directory=settings.VIDEOS_DIR), name="videos")
app.mount("/images", StaticFiles(directory=settings.IMAGES_DIR), name="images")


@app.get("/")
async def root():
    return {
        "service": settings.PROJECT_NAME,
        "status": "online",
        "docs_url": "/docs",
        "session_ready": bool(settings.GOOGLE_EMAIL),
    }
