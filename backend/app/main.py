import os
import logging
import asyncio
import secrets
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from app.routers import video, image, convert, auth_otp, rewards, workers, remove_bg, admin
from app.middleware.anti_bot import AntiBotMiddleware
from app.config import settings
from app.services.google_auth import ensure_valid_session
from app.services.cleanup_service import purge_expired_videos
from app.services.distributed_queue import queue

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


async def _queue_maintenance() -> None:
    """Reclaim dead workers and retry idempotent refunds without user action."""
    from app.middleware.auth import refund_video_credit
    while True:
        try:
            await queue.reclaim_expired()
            for job in await queue.failed_jobs_for_refund():
                await refund_video_credit(job["user_id"], job["id"])
        except asyncio.CancelledError:
            raise
        except Exception:
            logger.exception("Distributed queue maintenance failed")
        await asyncio.sleep(max(10, settings.QUEUE_MAINTENANCE_SECONDS))


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup: run cleanup sweep & verify Google Flow session."""
    logger.info("=" * 60)
    logger.info(f"Starting {settings.PROJECT_NAME}")
    logger.info("=" * 60)

    if settings.DISTRIBUTED_QUEUE_ENABLED:
        await queue.start()
        maintenance_task = asyncio.create_task(_queue_maintenance())
    else:
        maintenance_task = None

    # 1. Run 24-hour cleanup sweep on startup
    try:
        purged = purge_expired_videos()
        logger.info(f"🧹 Startup sweep: cleaned up {purged} expired files.")
    except Exception as e:
        logger.warning(f"⚠️ Startup cleanup sweep failed: {e}")

    # 2. Check JWT Secret configuration
    if not settings.SUPABASE_JWT_SECRET:
        logger.warning(
            "⚠️ CRITICAL SECURITY WARNING: SUPABASE_JWT_SECRET is not set in environment! "
            "All authenticated routes will fail closed until this secret is configured."
        )

    # 3. Pre-load rembg model for instant background removal
    try:
        from app.routers.remove_bg import _get_rembg_session
        await asyncio.to_thread(_get_rembg_session)
        logger.info("✅ rembg background removal model pre-loaded.")
    except Exception as e:
        logger.warning(f"⚠️ rembg model pre-load failed (will lazy-load on first request): {e}")

    if settings.DISTRIBUTED_QUEUE_ENABLED:
        logger.info("Distributed mode: Flow sessions are loaded only by private workers.")
    elif settings.GOOGLE_EMAIL and settings.GOOGLE_PASSWORD:
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
    if maintenance_task:
        maintenance_task.cancel()
        try:
            await maintenance_task
        except asyncio.CancelledError:
            pass
    await queue.stop()


app = FastAPI(title=settings.PROJECT_NAME, lifespan=lifespan)


from starlette.exceptions import HTTPException as StarletteHTTPException

@app.exception_handler(Exception)
async def internal_error_handler(request: Request, exc: Exception):
    """Keep stack traces and provider details out of browser responses."""
    if isinstance(exc, StarletteHTTPException):
        # Let FastAPI's default exception handler deal with standard HTTPExceptions
        return JSONResponse(status_code=exc.status_code, content={"detail": exc.detail})

    incident_id = secrets.token_hex(8)
    logger.exception("Unhandled request failure [%s] %s %s", incident_id, request.method, request.url.path)
    return JSONResponse(
        status_code=503,
        content={
            "detail": "The service is temporarily unavailable. Please try again shortly.",
            "incident_id": incident_id,
        },
    )

# Anti-Bot & Anti-Spam Shield (protects against scrapers, DDoS, and farming)
app.add_middleware(AntiBotMiddleware)

# Cross-Origin Resource Sharing
default_origins = [
    "http://localhost:3000",
    "https://botock.app",
    "https://www.botock.app",
    "https://botock.vercel.app",
    "https://botock.azurewebsites.net",
]
allowed_origins = os.getenv("ALLOWED_ORIGINS").split(",") if os.getenv("ALLOWED_ORIGINS") else default_origins

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(video.router)
app.include_router(image.router)
app.include_router(convert.router)
app.include_router(auth_otp.router)
app.include_router(rewards.router)
app.include_router(workers.router)
app.include_router(remove_bg.router)
app.include_router(admin.router)


@app.get("/debug-session")
async def debug_session():
    import os
    import json
    from app.config import settings
    from app.services.session_crypto import _fernet
    
    path = settings.SESSION_PATH
    info = {
        "cwd": os.getcwd(),
        "session_path_configured": path,
        "session_path_absolute": os.path.abspath(path),
        "file_exists": os.path.exists(path),
        "env_key_present": bool(settings.SESSION_ENCRYPTION_KEY),
        "secret_key_present": bool(settings.SECRET_KEY),
        "fernet_initialized": bool(_fernet)
    }
    
    if os.path.exists(path):
        info["file_size"] = os.path.getsize(path)
        try:
            with open(path, "rb") as f:
                content = f.read()
            info["content_preview"] = content[:20].decode(errors="ignore")
            
            if _fernet and content.startswith(b"gAAAAA"):
                try:
                    decrypted = _fernet.decrypt(content)
                    data = json.loads(decrypted.decode("utf-8"))
                    info["decryption_success"] = True
                    info["cookies_count"] = len(data.get("cookies", []))
                except Exception as e:
                    info["decryption_success"] = False
                    info["decryption_error"] = str(e)
            else:
                info["is_encrypted"] = False
        except Exception as e:
            info["file_read_error"] = str(e)
            
    return info

@app.get("/")
async def root():
    return {
        "service": settings.PROJECT_NAME,
        "status": "online",
        "docs_url": "/docs",
        "distributed_workers": settings.DISTRIBUTED_QUEUE_ENABLED,
        "session_ready": bool(settings.GOOGLE_EMAIL) if not settings.DISTRIBUTED_QUEUE_ENABLED else None,
    }


@app.get("/health")
async def health():
    """Unauthenticated readiness check used by the frontend failover probe."""
    return {"status": "online"}
