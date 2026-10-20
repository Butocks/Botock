import os
import json
import time
import logging
import hashlib
import traceback
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
from fastapi import APIRouter, HTTPException, Header, Request, Depends
from pydantic import BaseModel

try:
    import psutil
except ImportError:
    psutil = None

from app.config import settings

logger = logging.getLogger("botock.admin")
router = APIRouter(prefix="/api/admin", tags=["Admin Control Center"])

ADMIN_SECRET_KEY = os.getenv("ADMIN_SECRET_KEY", settings.ADMIN_LOGIN_SECRET or "botock_master_admin_2026")
STATE_FILE = os.path.join(os.path.dirname(__file__), "../../botock_admin_state.json")

ALL_BOTOCK_TOOLS: Dict[str, Dict[str, Any]] = {
    "video-generator": {"name": "AI Video Generator", "category": "video", "enabled": True, "access_mode": "login_users", "guest_daily_quota": 0, "user_daily_quota": 3, "pro_only": False, "maintenance": False, "uses": 0, "errors": 0, "abandons": 0},
    "image-generator": {"name": "AI Image Generator", "category": "image", "enabled": True, "access_mode": "guest", "guest_daily_quota": 2, "user_daily_quota": 10, "pro_only": False, "maintenance": False, "uses": 0, "errors": 0, "abandons": 0},
    "video-editor": {"name": "Botock Video Editor", "category": "video", "enabled": True, "access_mode": "guest", "guest_daily_quota": 5, "user_daily_quota": 50, "pro_only": False, "maintenance": False, "uses": 0, "errors": 0, "abandons": 0},
    "reaction-video-maker": {"name": "Reaction Video Maker", "category": "video", "enabled": True, "access_mode": "guest", "guest_daily_quota": 5, "user_daily_quota": 25, "pro_only": False, "maintenance": False, "uses": 0, "errors": 0, "abandons": 0},
    "video-remove-bg": {"name": "Video Background Remover", "category": "video", "enabled": True, "access_mode": "login_users", "guest_daily_quota": 1, "user_daily_quota": 10, "pro_only": False, "maintenance": False, "uses": 0, "errors": 0, "abandons": 0},
    "video-auto-reframe": {"name": "Video Auto Reframe", "category": "video", "enabled": True, "access_mode": "guest", "guest_daily_quota": 5, "user_daily_quota": 25, "pro_only": False, "maintenance": False, "uses": 0, "errors": 0, "abandons": 0},
    "video-compress": {"name": "Video Compressor", "category": "video", "enabled": True, "access_mode": "guest", "guest_daily_quota": 10, "user_daily_quota": 50, "pro_only": False, "maintenance": False, "uses": 0, "errors": 0, "abandons": 0},
    "video-convert": {"name": "Video Converter", "category": "video", "enabled": True, "access_mode": "guest", "guest_daily_quota": 10, "user_daily_quota": 50, "pro_only": False, "maintenance": False, "uses": 0, "errors": 0, "abandons": 0},
    "video-trim": {"name": "Video Trimmer", "category": "video", "enabled": True, "access_mode": "guest", "guest_daily_quota": 15, "user_daily_quota": 100, "pro_only": False, "maintenance": False, "uses": 0, "errors": 0, "abandons": 0},
    "video-to-mp3": {"name": "Video to MP3", "category": "video", "enabled": True, "access_mode": "guest", "guest_daily_quota": 15, "user_daily_quota": 100, "pro_only": False, "maintenance": False, "uses": 0, "errors": 0, "abandons": 0},
    "video-to-gif": {"name": "Video to GIF", "category": "video", "enabled": True, "access_mode": "guest", "guest_daily_quota": 10, "user_daily_quota": 50, "pro_only": False, "maintenance": False, "uses": 0, "errors": 0, "abandons": 0},
    "video-mute": {"name": "Video Mute", "category": "video", "enabled": True, "access_mode": "guest", "guest_daily_quota": 15, "user_daily_quota": 100, "pro_only": False, "maintenance": False, "uses": 0, "errors": 0, "abandons": 0},
    "video-rotate": {"name": "Video Rotate", "category": "video", "enabled": True, "access_mode": "guest", "guest_daily_quota": 15, "user_daily_quota": 100, "pro_only": False, "maintenance": False, "uses": 0, "errors": 0, "abandons": 0},
    "subtitles": {"name": "AI Subtitles Generator", "category": "video", "enabled": True, "access_mode": "login_users", "guest_daily_quota": 1, "user_daily_quota": 10, "pro_only": False, "maintenance": False, "uses": 0, "errors": 0, "abandons": 0},
    "image-remove-bg": {"name": "Image Background Remover", "category": "image", "enabled": True, "access_mode": "guest", "guest_daily_quota": 5, "user_daily_quota": 30, "pro_only": False, "maintenance": False, "uses": 0, "errors": 0, "abandons": 0},
    "image-upscale": {"name": "AI Image Upscaler", "category": "image", "enabled": True, "access_mode": "guest", "guest_daily_quota": 3, "user_daily_quota": 20, "pro_only": False, "maintenance": False, "uses": 0, "errors": 0, "abandons": 0},
    "image-compress": {"name": "Image Compressor", "category": "image", "enabled": True, "access_mode": "guest", "guest_daily_quota": 20, "user_daily_quota": 100, "pro_only": False, "maintenance": False, "uses": 0, "errors": 0, "abandons": 0},
    "image-convert": {"name": "Image Converter", "category": "image", "enabled": True, "access_mode": "guest", "guest_daily_quota": 20, "user_daily_quota": 100, "pro_only": False, "maintenance": False, "uses": 0, "errors": 0, "abandons": 0},
    "image-crop": {"name": "Image Cropper", "category": "image", "enabled": True, "access_mode": "guest", "guest_daily_quota": 25, "user_daily_quota": 100, "pro_only": False, "maintenance": False, "uses": 0, "errors": 0, "abandons": 0},
    "image-resize": {"name": "Image Resizer", "category": "image", "enabled": True, "access_mode": "guest", "guest_daily_quota": 25, "user_daily_quota": 100, "pro_only": False, "maintenance": False, "uses": 0, "errors": 0, "abandons": 0},
    "image-rotate": {"name": "Image Rotator", "category": "image", "enabled": True, "access_mode": "guest", "guest_daily_quota": 25, "user_daily_quota": 100, "pro_only": False, "maintenance": False, "uses": 0, "errors": 0, "abandons": 0},
    "image-filters": {"name": "Image Filters", "category": "image", "enabled": True, "access_mode": "guest", "guest_daily_quota": 25, "user_daily_quota": 100, "pro_only": False, "maintenance": False, "uses": 0, "errors": 0, "abandons": 0},
    "image-color-picker": {"name": "Image Color Picker", "category": "image", "enabled": True, "access_mode": "guest", "guest_daily_quota": 50, "user_daily_quota": 200, "pro_only": False, "maintenance": False, "uses": 0, "errors": 0, "abandons": 0},
    "pdf-ai-summarizer": {"name": "PDF AI Summarizer", "category": "pdf", "enabled": True, "access_mode": "login_users", "guest_daily_quota": 2, "user_daily_quota": 15, "pro_only": False, "maintenance": False, "uses": 0, "errors": 0, "abandons": 0},
    "translate-pdf": {"name": "Translate PDF", "category": "pdf", "enabled": True, "access_mode": "login_users", "guest_daily_quota": 2, "user_daily_quota": 15, "pro_only": False, "maintenance": False, "uses": 0, "errors": 0, "abandons": 0},
    "pdf-ocr": {"name": "PDF OCR", "category": "pdf", "enabled": True, "access_mode": "guest", "guest_daily_quota": 5, "user_daily_quota": 25, "pro_only": False, "maintenance": False, "uses": 0, "errors": 0, "abandons": 0},
    "pdf-merge": {"name": "Merge PDF", "category": "pdf", "enabled": True, "access_mode": "guest", "guest_daily_quota": 15, "user_daily_quota": 100, "pro_only": False, "maintenance": False, "uses": 0, "errors": 0, "abandons": 0},
    "pdf-split": {"name": "Split PDF", "category": "pdf", "enabled": True, "access_mode": "guest", "guest_daily_quota": 15, "user_daily_quota": 100, "pro_only": False, "maintenance": False, "uses": 0, "errors": 0, "abandons": 0},
    "pdf-compress": {"name": "Compress PDF", "category": "pdf", "enabled": True, "access_mode": "guest", "guest_daily_quota": 15, "user_daily_quota": 100, "pro_only": False, "maintenance": False, "uses": 0, "errors": 0, "abandons": 0},
    "pdf-to-word": {"name": "PDF to Word", "category": "pdf", "enabled": True, "access_mode": "guest", "guest_daily_quota": 10, "user_daily_quota": 50, "pro_only": False, "maintenance": False, "uses": 0, "errors": 0, "abandons": 0},
    "word-to-pdf": {"name": "Word to PDF", "category": "pdf", "enabled": True, "access_mode": "guest", "guest_daily_quota": 10, "user_daily_quota": 50, "pro_only": False, "maintenance": False, "uses": 0, "errors": 0, "abandons": 0},
    "pdf-to-excel": {"name": "PDF to Excel", "category": "pdf", "enabled": True, "access_mode": "guest", "guest_daily_quota": 10, "user_daily_quota": 50, "pro_only": False, "maintenance": False, "uses": 0, "errors": 0, "abandons": 0},
    "excel-to-pdf": {"name": "Excel to PDF", "category": "pdf", "enabled": True, "access_mode": "guest", "guest_daily_quota": 10, "user_daily_quota": 50, "pro_only": False, "maintenance": False, "uses": 0, "errors": 0, "abandons": 0},
    "pdf-to-jpg": {"name": "PDF to JPG", "category": "pdf", "enabled": True, "access_mode": "guest", "guest_daily_quota": 15, "user_daily_quota": 100, "pro_only": False, "maintenance": False, "uses": 0, "errors": 0, "abandons": 0},
    "jpg-to-pdf": {"name": "JPG to PDF", "category": "pdf", "enabled": True, "access_mode": "guest", "guest_daily_quota": 15, "user_daily_quota": 100, "pro_only": False, "maintenance": False, "uses": 0, "errors": 0, "abandons": 0},
    "pdf-to-powerpoint": {"name": "PDF to PowerPoint", "category": "pdf", "enabled": True, "access_mode": "guest", "guest_daily_quota": 10, "user_daily_quota": 50, "pro_only": False, "maintenance": False, "uses": 0, "errors": 0, "abandons": 0},
    "pdf-protect": {"name": "Protect PDF", "category": "pdf", "enabled": True, "access_mode": "guest", "guest_daily_quota": 15, "user_daily_quota": 100, "pro_only": False, "maintenance": False, "uses": 0, "errors": 0, "abandons": 0},
    "pdf-watermark": {"name": "Watermark PDF", "category": "pdf", "enabled": True, "access_mode": "guest", "guest_daily_quota": 15, "user_daily_quota": 100, "pro_only": False, "maintenance": False, "uses": 0, "errors": 0, "abandons": 0},
    "pdf-page-delete": {"name": "Delete PDF Pages", "category": "pdf", "enabled": True, "access_mode": "guest", "guest_daily_quota": 15, "user_daily_quota": 100, "pro_only": False, "maintenance": False, "uses": 0, "errors": 0, "abandons": 0},
    "pdf-page-numbers": {"name": "PDF Page Numbers", "category": "pdf", "enabled": True, "access_mode": "guest", "guest_daily_quota": 15, "user_daily_quota": 100, "pro_only": False, "maintenance": False, "uses": 0, "errors": 0, "abandons": 0},
    "pdf-rotate": {"name": "Rotate PDF", "category": "pdf", "enabled": True, "access_mode": "guest", "guest_daily_quota": 15, "user_daily_quota": 100, "pro_only": False, "maintenance": False, "uses": 0, "errors": 0, "abandons": 0},
    "organize-pdf": {"name": "Organize PDF", "category": "pdf", "enabled": True, "access_mode": "guest", "guest_daily_quota": 15, "user_daily_quota": 100, "pro_only": False, "maintenance": False, "uses": 0, "errors": 0, "abandons": 0},
    "crop-pdf": {"name": "Crop PDF", "category": "pdf", "enabled": True, "access_mode": "guest", "guest_daily_quota": 15, "user_daily_quota": 100, "pro_only": False, "maintenance": False, "uses": 0, "errors": 0, "abandons": 0},
    "repair-pdf": {"name": "Repair PDF", "category": "pdf", "enabled": True, "access_mode": "guest", "guest_daily_quota": 10, "user_daily_quota": 50, "pro_only": False, "maintenance": False, "uses": 0, "errors": 0, "abandons": 0},
    "html-to-pdf": {"name": "HTML to PDF", "category": "pdf", "enabled": True, "access_mode": "guest", "guest_daily_quota": 10, "user_daily_quota": 50, "pro_only": False, "maintenance": False, "uses": 0, "errors": 0, "abandons": 0},
    "pdf-forms": {"name": "PDF Forms Filler", "category": "pdf", "enabled": True, "access_mode": "guest", "guest_daily_quota": 10, "user_daily_quota": 50, "pro_only": False, "maintenance": False, "uses": 0, "errors": 0, "abandons": 0},
    "pdf-to-book": {"name": "PDF to Book", "category": "pdf", "enabled": True, "access_mode": "guest", "guest_daily_quota": 10, "user_daily_quota": 50, "pro_only": False, "maintenance": False, "uses": 0, "errors": 0, "abandons": 0},
    "audio-enhance": {"name": "AI Audio Enhancer", "category": "audio", "enabled": True, "access_mode": "guest", "guest_daily_quota": 5, "user_daily_quota": 30, "pro_only": False, "maintenance": False, "uses": 0, "errors": 0, "abandons": 0},
    "voice-changer": {"name": "AI Voice Changer", "category": "audio", "enabled": True, "access_mode": "guest", "guest_daily_quota": 5, "user_daily_quota": 30, "pro_only": False, "maintenance": False, "uses": 0, "errors": 0, "abandons": 0},
    "audio-trim": {"name": "Audio Trimmer", "category": "audio", "enabled": True, "access_mode": "guest", "guest_daily_quota": 20, "user_daily_quota": 100, "pro_only": False, "maintenance": False, "uses": 0, "errors": 0, "abandons": 0},
    "audio-volume": {"name": "Audio Volume Booster", "category": "audio", "enabled": True, "access_mode": "guest", "guest_daily_quota": 20, "user_daily_quota": 100, "pro_only": False, "maintenance": False, "uses": 0, "errors": 0, "abandons": 0},
    "live-data-extractor": {"name": "Live Data Extractor", "category": "pdf", "enabled": True, "access_mode": "login_users", "guest_daily_quota": 2, "user_daily_quota": 20, "pro_only": False, "maintenance": False, "uses": 0, "errors": 0, "abandons": 0},
}

DEFAULT_STATE: Dict[str, Any] = {
    "quotas": {
        "video_gen_access": "all",  # "all" (Guest + Login) | "login_only" | "off"
        "video_daily_quota": 5,     # Single unified daily video quota
        "guest_daily_limit": 10,
        "free_user_daily_limit": 30,
        "max_file_size_mb": 60,
        "forced_model": "auto",
        "global_maintenance": False,
        "announcement_banner": "",
    },
    "tool_flags": {k: v.copy() for k, v in ALL_BOTOCK_TOOLS.items()},
    "users": [],
    "coupons": [],
    "tool_events": [],
    "telemetry": [],
    "blogs": [],
}


def load_state() -> Dict[str, Any]:
    if os.path.exists(STATE_FILE):
        try:
            with open(STATE_FILE, "r", encoding="utf-8") as f:
                data = json.load(f)
                # Purge mock tools and mock numbers from tool_flags
                if "tool_flags" in data and isinstance(data["tool_flags"], dict):
                    mock_tools = ["image-compress-legacy", "ai-video"]
                    for mt in mock_tools:
                        data["tool_flags"].pop(mt, None)

                else:
                    data["tool_flags"] = {}

                # Seed any missing tools from ALL_BOTOCK_TOOLS
                for tid, tcfg in ALL_BOTOCK_TOOLS.items():
                    if tid not in data["tool_flags"]:
                        data["tool_flags"][tid] = tcfg.copy()
                    else:
                        for sk, sv in tcfg.items():
                            if sk not in data["tool_flags"][tid]:
                                data["tool_flags"][tid][sk] = sv

                # Ensure all default keys exist
                for k, v in DEFAULT_STATE.items():
                    if k not in data:
                        data[k] = v

                return data
        except Exception as e:
            logger.warning("Could not read admin state file: %s", e)
    return {k: (v.copy() if isinstance(v, dict) else v) for k, v in DEFAULT_STATE.items()}


def save_state(state: Dict[str, Any]):
    try:
        with open(STATE_FILE, "w", encoding="utf-8") as f:
            json.dump(state, f, indent=2)
    except Exception as e:
        logger.error("Failed to save admin state: %s", e)


def verify_admin_token(
    x_admin_token: Optional[str] = Header(None, alias="x-admin-token"),
    x_admin_secret: Optional[str] = Header(None, alias="X-Admin-Secret"),
    admin_api_key: Optional[str] = Header(None, alias="admin-api-key"),
    authorization: Optional[str] = Header(None, alias="Authorization"),
):
    token = x_admin_token
    if not token and authorization and authorization.startswith("Bearer "):
        token = authorization.removeprefix("Bearer ").strip()

    # If someone tries to pass a raw static key directly, reject immediately!
    if not token and (x_admin_secret or admin_api_key):
        logger.warning("Rejected direct static key attempt on admin endpoint.")
        raise HTTPException(
            status_code=403,
            detail="Access Denied: Direct static key access is permanently disabled for data endpoints. You must verify via 2FA Email OTP to receive an active session token.",
        )

    if not token:
        raise HTTPException(
            status_code=401,
            detail="Unauthorized: 2FA Admin session token missing. Please authenticate via Email OTP.",
        )

    clean_token = token.strip()

    # 1. Strictly verify 2FA Session Token from auth_otp
    try:
        from app.routers.auth_otp import SESSION_TOKENS_FILE, _read_json, _write_json
        tokens = _read_json(SESSION_TOKENS_FILE, {})
        hashed = hashlib.sha256(clean_token.encode()).hexdigest()
        exp = tokens.get(hashed)
        if exp:
            if time.time() <= exp:
                # Slide activity window (30-minute auto-expiry)
                tokens[hashed] = time.time() + (30 * 60)
                _write_json(SESSION_TOKENS_FILE, tokens)
                return True
            else:
                raise HTTPException(status_code=401, detail="Admin session has expired. Please re-login.")
    except HTTPException:
        raise
    except Exception as e:
        logger.warning(f"Error checking 2FA session token: {e}")

    # 2. Check if it is a valid Supabase Super-Admin token
    try:
        from app.middleware.auth import get_current_user
        user = get_current_user(authorization=f"Bearer {clean_token}")
        if user:
            email = user.get("email", "").strip().lower()
            allowed_admins = [e.strip().lower() for e in settings.ADMIN_EMAILS.split(",") if e.strip()]
            app_meta = user.get("payload", {}).get("app_metadata", {})
            role = app_meta.get("role", "")
            if role in ("owner", "super_admin", "admin") or (email in allowed_admins):
                return True
    except Exception:
        pass

    logger.warning("Unauthorized admin access attempt with invalid session token.")
    raise HTTPException(status_code=403, detail="Unauthorized: Invalid or expired 2FA Admin session token.")


# =====================================================================
# 1. PUBLIC TELEMETRY INGESTION (Called silently by Vercel Frontend)
# =====================================================================
@router.post("/telemetry/track")
async def track_user_journey(request: Request):
    """
    Records visitor referrer (Facebook, Google, Instagram, etc.),
    UTM campaign, and exact page-to-page navigation flow.
    """
    try:
        body = await request.json()
    except Exception:
        return {"ok": False}

    state = load_state()
    client_ip = request.headers.get("x-forwarded-for", request.client.host if request.client else "0.0.0.0")

    event = {
        "id": f"evt_{int(time.time() * 1000)}",
        "session_id": str(body.get("session_id", "anon"))[:40],
        "user_email": str(body.get("user_email", "Guest"))[:80],
        "event_type": str(body.get("event_type", "page_view")),
        "current_path": str(body.get("current_path", "/")),
        "previous_path": str(body.get("previous_path", "Entry")),
        "referrer": str(body.get("referrer", "Direct"))[:150],
        "utm_source": str(body.get("utm_source", "direct")).lower(),
        "utm_medium": str(body.get("utm_medium", "organic")).lower(),
        "utm_campaign": str(body.get("utm_campaign", "none")),
        "device_type": str(body.get("device_type", "Desktop")),
        "ip": client_ip.split(",")[0].strip(),
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }

    telemetry_list: List[Dict[str, Any]] = state.get("telemetry", [])

    # Strict server-side deduplication: if exact same session & path logged within 5 seconds, ignore duplicate
    sid = event["session_id"]
    c_path = event["current_path"]
    now_dt = datetime.now(timezone.utc)
    for prev in telemetry_list[:10]:
        if prev.get("session_id") == sid and prev.get("current_path") == c_path:
            try:
                prev_time_str = prev.get("timestamp")
                if prev_time_str:
                    prev_dt = datetime.fromisoformat(prev_time_str.replace("Z", "+00:00"))
                    if (now_dt - prev_dt).total_seconds() < 5.0:
                        return {"ok": True, "deduplicated": True}
            except Exception:
                pass

    telemetry_list.insert(0, event)
    # Keep latest 2,000 events in memory/JSON
    state["telemetry"] = telemetry_list[:2000]

    save_state(state)
    return {"ok": True}


@router.post("/telemetry/tool")
async def track_tool_lifecycle(request: Request):
    """
    Records deep tool lifecycle events:
    - status: 'started' | 'completed' | 'success' | 'failed' | 'error' | 'abandoned_midway'
    - stage_reached: 'upload' | 'loading_engine' | 'processing' | 'done', etc.
    - elapsed_ms: time taken or time waited
    - abandon_reason: why user exited/closed tab
    - error_code / error_message: exact failure diagnostics
    """
    try:
        body = await request.json()
    except Exception:
        return {"ok": False}

    state = load_state()
    tool_id = str(body.get("tool_slug") or body.get("tool_id", "unknown")).strip()
    status = str(body.get("status", "view")).strip().lower()
    error_message = body.get("error_message")
    error_code = body.get("error_code")
    stage_reached = str(body.get("stage_reached") or "init")
    elapsed_ms = int(body.get("elapsed_ms") or 0)
    abandon_reason = body.get("abandon_reason")
    file_size_bytes = body.get("file_size_bytes")
    stack_trace = body.get("stack_trace")
    user_email = str(body.get("user_email", "Guest"))[:80]
    session_id = str(body.get("session_id", "anon"))[:60]
    device_type = str(body.get("device_type") or "desktop")
    client_ip = request.headers.get("x-forwarded-for", request.client.host if request.client else "0.0.0.0").split(",")[0].strip()

    event = {
        "id": f"t_{int(time.time() * 1000)}",
        "tool_id": tool_id,
        "status": status,
        "stage_reached": stage_reached,
        "elapsed_ms": elapsed_ms,
        "abandon_reason": str(abandon_reason)[:250] if abandon_reason else None,
        "error_code": str(error_code)[:50] if error_code else None,
        "error_message": str(error_message)[:500] if error_message else None,
        "file_size_bytes": file_size_bytes,
        "stack_trace": str(stack_trace)[:2500] if stack_trace else None,
        "user_email": user_email,
        "session_id": session_id,
        "device_type": device_type,
        "ip": client_ip,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }

    tool_events: List[Dict[str, Any]] = state.get("tool_events", [])
    tool_events.insert(0, event)
    state["tool_events"] = tool_events[:3000]

    # Update tool flags stats
    if tool_id in state.get("tool_flags", {}):
        tcfg = state["tool_flags"][tool_id]
        if status in ("success", "completed"):
            tcfg["uses"] = tcfg.get("uses", 0) + 1
        elif status in ("error", "failed"):
            tcfg["errors"] = tcfg.get("errors", 0) + 1
        elif status == "abandoned_midway":
            tcfg["abandons"] = tcfg.get("abandons", 0) + 1

    save_state(state)

    # Sync to Supabase tool_usage_log if service role key is present
    if settings.SUPABASE_URL and settings.SUPABASE_SERVICE_ROLE_KEY:
        try:
            import httpx
            db_status = "success" if status == "completed" else "error" if status == "failed" else status
            async with httpx.AsyncClient(timeout=2.0) as client:
                await client.post(
                    f"{settings.SUPABASE_URL.rstrip('/')}/rest/v1/tool_usage_log",
                    headers={
                        "apikey": settings.SUPABASE_SERVICE_ROLE_KEY,
                        "Authorization": f"Bearer {settings.SUPABASE_SERVICE_ROLE_KEY}",
                        "Content-Type": "application/json",
                        "Prefer": "return=minimal",
                    },
                    json={
                        "tool_id": tool_id,
                        "tool_name": state.get("tool_flags", {}).get(tool_id, {}).get("name", tool_id),
                        "status": db_status,
                        "stage_reached": stage_reached,
                        "elapsed_ms": elapsed_ms,
                        "abandon_reason": str(abandon_reason)[:200] if abandon_reason else None,
                        "error_code": str(error_code)[:50] if error_code else None,
                        "error_message": str(error_message)[:500] if error_message else None,
                        "file_size_bytes": file_size_bytes,
                        "session_id": session_id,
                        "device_type": device_type,
                    }
                )
        except Exception:
            pass

    return {"ok": True}


# =====================================================================
# 2. PUBLIC CONFIG CHECK (For Vercel Frontend to check Maintenance/Flags)
# =====================================================================
@router.get("/public-config")
async def get_public_config():
    state = load_state()
    return {
        "quotas": state.get("quotas", {}),
        "tool_flags": state.get("tool_flags", {}),
    }


# =====================================================================
# 3. PROTECTED ADMIN OVERVIEW (Only accessible by Admin Panel)
# =====================================================================
@router.get("/overview", dependencies=[Depends(verify_admin_token)])
async def get_admin_overview():
    state = load_state()
    telemetry = state.get("telemetry", [])

    # Calculate Campaign & Traffic Source Breakdown
    source_counts: Dict[str, int] = {}
    campaign_counts: Dict[str, int] = {}
    active_sessions: Dict[str, List[Dict[str, Any]]] = {}

    for ev in telemetry:
        src = ev.get("utm_source") or "direct"
        source_counts[src] = source_counts.get(src, 0) + 1

        camp = ev.get("utm_campaign") or "none"
        if camp != "none":
            campaign_counts[camp] = campaign_counts.get(camp, 0) + 1

        sid = ev.get("session_id", "unknown")
        if sid not in active_sessions:
            active_sessions[sid] = []
        active_sessions[sid].append(ev)

    # Build User Journey Flows
    user_journeys = []
    for sid, events in list(active_sessions.items())[:50]:
        chronological = list(reversed(events))
        first_ev = chronological[0]
        last_ev = chronological[-1]
        user_journeys.append({
            "session_id": sid,
            "user_email": last_ev.get("user_email", "Guest"),
            "utm_source": first_ev.get("utm_source", "direct"),
            "utm_campaign": first_ev.get("utm_campaign", "none"),
            "referrer": first_ev.get("referrer", "Direct"),
            "device": first_ev.get("device_type", "Desktop"),
            "ip": first_ev.get("ip", ""),
            "last_seen": last_ev.get("timestamp", ""),
            "steps": [e.get("current_path", "/") for e in chronological],
        })

    # Tool Funnel & Error Analytics
    tool_events = state.get("tool_events", [])
    tool_funnel: List[Dict[str, Any]] = []
    recent_errors: List[Dict[str, Any]] = []

    tool_flags = state.get("tool_flags", {})
    for tid, tcfg in tool_flags.items():
        tool_name = tcfg.get("name", tid)
        # Count tool visits from telemetry page views
        t_views = sum(1 for e in telemetry if e.get("current_path", "").startswith(f"/tools/{tid}"))
        t_started = sum(1 for te in tool_events if te.get("tool_id") == tid and te.get("status") == "input_started")
        t_success = max(tcfg.get("uses", 0), sum(1 for te in tool_events if te.get("tool_id") == tid and te.get("status") == "success"))
        t_errors = max(tcfg.get("errors", 0), sum(1 for te in tool_events if te.get("tool_id") == tid and te.get("status") == "error"))
        total_runs = t_success + t_errors
        t_abandoned = max(0, t_views - total_runs)
        s_rate = round((t_success / total_runs * 100), 1) if total_runs > 0 else 100.0

        tool_funnel.append({
            "tool_id": tid,
            "name": tool_name,
            "views": max(t_views, total_runs),
            "started": max(t_started, total_runs),
            "success": t_success,
            "errors": t_errors,
            "abandoned": t_abandoned,
            "success_rate": s_rate,
            "enabled": tcfg.get("enabled", True),
            "maintenance": tcfg.get("maintenance", False),
        })

    for te in tool_events:
        if te.get("status") == "error" and te.get("error_message"):
            if len(recent_errors) < 100:
                tid = te.get("tool_id", "tool")
                recent_errors.append({
                    "id": te.get("id"),
                    "tool_id": tid,
                    "tool_name": tool_flags.get(tid, {}).get("name", tid),
                    "error_message": te.get("error_message"),
                    "stack_trace": te.get("stack_trace"),
                    "timestamp": te.get("timestamp"),
                    "user_email": te.get("user_email", "Guest"),
                    "ip": te.get("ip", ""),
                })

    # Server Hardware Health (Read live metrics without mock fallbacks)
    cpu_usage = 0.0
    mem_info = 0.0
    if psutil:
        try:
            cpu_usage = psutil.cpu_percent(interval=0.1)
            mem_info = psutil.virtual_memory().percent
        except Exception:
            pass
    elif os.path.exists("/proc/meminfo"):
        try:
            with open("/proc/meminfo", "r") as mf:
                m_dict = {}
                for line in mf:
                    parts = line.split(":")
                    if len(parts) == 2:
                        m_dict[parts[0].strip()] = float(parts[1].split()[0].strip())
                total = m_dict.get("MemTotal", 1.0)
                free = m_dict.get("MemAvailable", m_dict.get("MemFree", 0.0))
                mem_info = round(((total - free) / total) * 100, 1)
        except Exception:
            pass

    return {
        "ok": True,
        "server": {
            "cpu_percent": cpu_usage,
            "memory_percent": mem_info,
            "active_sessions_24h": len(active_sessions),
            "total_telemetry_events": len(telemetry),
        },
        "system_health": {
            "cpu_percent": cpu_usage,
            "ram_percent": mem_info,
            "status": "Healthy (Azure Production)",
            "active_visitors": len(active_sessions),
            "total_events_logged": len(telemetry),
        },
        "source_breakdown": source_counts,
        "campaign_breakdown": campaign_counts,
        "user_journeys": user_journeys,
        "tool_funnel": tool_funnel,
        "recent_errors": recent_errors,
        "quotas": state.get("quotas", {}),
        "tool_flags": state.get("tool_flags", {}),
        "users": state.get("users", []),
        "coupons": state.get("coupons", []),
        "blogs": state.get("blogs", []),
    }


@router.post("/quotas", dependencies=[Depends(verify_admin_token)])
async def update_quotas(request: Request):
    body = await request.json()
    state = load_state()
    state["quotas"] = {**state.get("quotas", {}), **body}
    save_state(state)
    return {"ok": True, "quotas": state["quotas"]}


@router.post("/tool-flags", dependencies=[Depends(verify_admin_token)])
async def update_tool_flag(request: Request):
    body = await request.json()
    tool_id = body.get("tool_id")
    updates = body.get("updates", {})
    state = load_state()
    if tool_id in state.get("tool_flags", {}):
        state["tool_flags"][tool_id] = {**state["tool_flags"][tool_id], **updates}
    else:
        state["tool_flags"][tool_id] = updates
    save_state(state)
    return {"ok": True, "tool_flags": state["tool_flags"]}


@router.post("/users/update", dependencies=[Depends(verify_admin_token)])
async def update_user_status(request: Request):
    body = await request.json()
    user_id = body.get("id")
    state = load_state()
    for u in state.get("users", []):
        if u["id"] == user_id:
            if "vip" in body:
                u["vip"] = bool(body["vip"])
            if "banned" in body:
                u["banned"] = bool(body["banned"])
    save_state(state)
    return {"ok": True, "users": state["users"]}


@router.post("/coupons/create", dependencies=[Depends(verify_admin_token)])
async def create_coupon(request: Request):
    body = await request.json()
    state = load_state()
    new_coupon = {
        "code": str(body.get("code", "")).upper().strip(),
        "discount_percent": int(body.get("discount_percent", 20)),
        "bonus_credits": int(body.get("bonus_credits", 100)),
        "max_uses": int(body.get("max_uses", 100)),
        "used_count": 0,
        "active": True,
    }
    state.setdefault("coupons", []).insert(0, new_coupon)
    save_state(state)
    return {"ok": True, "coupons": state["coupons"]}


@router.post("/errors/clear", dependencies=[Depends(verify_admin_token)])
async def clear_admin_errors():
    """
    Clears all recorded tool error events and resets error counters on all tools.
    """
    state = load_state()
    state["tool_events"] = [e for e in state.get("tool_events", []) if e.get("status") != "error"]
    for tid, tcfg in state.get("tool_flags", {}).items():
        if isinstance(tcfg, dict):
            tcfg["errors"] = 0
    save_state(state)
    return {"ok": True, "message": "All error logs cleared"}


def log_tool_error(tool_id: str, tool_name: str, err: Exception, client_ip: str = "", user_email: str = "Guest"):
    """
    Direct helper to log tool exceptions into admin error console.
    """
    try:
        state = load_state()
        event = {
            "id": f"err_{int(time.time() * 1000)}",
            "tool_id": tool_id,
            "status": "error",
            "error_message": str(err)[:500],
            "stack_trace": traceback.format_exc()[:2500],
            "user_email": user_email,
            "session_id": "sys_err",
            "ip": client_ip,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }
        tool_events = state.setdefault("tool_events", [])
        tool_events.insert(0, event)
        state["tool_events"] = tool_events[:3000]
        if tool_id in state.get("tool_flags", {}):
            state["tool_flags"][tool_id]["errors"] = state["tool_flags"][tool_id].get("errors", 0) + 1
        save_state(state)
    except Exception as e:
        logger.error(f"Failed to log tool error for {tool_id}: {e}")


# =====================================================================
# 4. ENTERPRISE BLOG CMS ENDPOINTS (Public Vercel Feed + Admin CRUD)
# =====================================================================
@router.get("/public-blogs")
async def get_public_blogs(category: Optional[str] = None):
    """
    Called by Vercel frontend (botock.app/blog) to render published SEO articles.
    """
    state = load_state()
    published = [
        b for b in state.get("blogs", []) if b.get("status") == "published"
    ]
    if category and category != "all":
        published = [b for b in published if b.get("category") == category]
    return {"blogs": published}


@router.get("/public-blogs/{slug}")
async def get_single_public_blog(slug: str):
    """
    Fetches a single blog post by slug and increments its view counter.
    """
    state = load_state()
    for b in state.get("blogs", []):
        if b.get("slug") == slug and b.get("status") == "published":
            b["views"] = b.get("views", 0) + 1
            save_state(state)
            return b
    raise HTTPException(status_code=404, detail="Article not found.")


@router.post("/blogs/save", dependencies=[Depends(verify_admin_token)])
async def save_or_update_blog(request: Request):
    """
    Creates a new SEO blog post or updates an existing one from Azure Admin Portal.
    """
    body = await request.json()
    state = load_state()
    blogs: List[Dict[str, Any]] = state.setdefault("blogs", [])

    blog_id = body.get("id") or f"blog_{int(time.time() * 1000)}"
    now_iso = datetime.now(timezone.utc).isoformat()

    word_count = len(str(body.get("content", "")).split())
    reading_mins = max(1, round(word_count / 200))

    article_data = {
        "id": blog_id,
        "title": str(body.get("title", "")).strip(),
        "slug": str(body.get("slug", "")).strip().lower(),
        "excerpt": str(body.get("excerpt", "")).strip(),
        "content": str(body.get("content", "")),
        "category": str(body.get("category", "AI Tutorials")),
        "target_keyword": str(body.get("target_keyword", "")).strip(),
        "meta_title": str(body.get("meta_title", "")).strip() or str(body.get("title", "")).strip(),
        "meta_description": str(body.get("meta_description", "")).strip() or str(body.get("excerpt", "")).strip(),
        "cover_image": str(body.get("cover_image", "https://botock.app/og-image.jpg")).strip(),
        "author": str(body.get("author", "Botock Editorial Team")).strip(),
        "reading_time": f"{reading_mins} min read",
        "status": str(body.get("status", "published")),
        "featured": bool(body.get("featured", False)),
        "updated_at": now_iso,
    }

    existing_idx = next((i for i, b in enumerate(blogs) if b.get("id") == blog_id), -1)
    if existing_idx >= 0:
        article_data["views"] = blogs[existing_idx].get("views", 0)
        article_data["created_at"] = blogs[existing_idx].get("created_at", now_iso)
        blogs[existing_idx] = article_data
    else:
        article_data["views"] = 0
        article_data["created_at"] = now_iso
        blogs.insert(0, article_data)

    save_state(state)
    return {"ok": True, "blogs": blogs, "saved": article_data}


@router.post("/blogs/delete", dependencies=[Depends(verify_admin_token)])
async def delete_blog(request: Request):
    body = await request.json()
    blog_id = body.get("id")
    state = load_state()
    state["blogs"] = [b for b in state.get("blogs", []) if b.get("id") != blog_id]
    save_state(state)
    return {"ok": True, "blogs": state["blogs"]}


# =====================================================================
# 6. MASTER TOOLS CONTROL & ADVANCED TELEMETRY (50+ Tools)
# =====================================================================

class ToolConfigUpdatePayload(BaseModel):
    is_enabled: bool = True
    access_mode: str = "guest"  # guest | login_users | not_allowed
    guest_daily_quota: int = 10
    user_daily_quota: int = 50
    tool_name: Optional[str] = None
    category: Optional[str] = None


@router.get("/tools", dependencies=[Depends(verify_admin_token)])
async def get_all_tools_admin():
    """
    Returns full master tool registry of all 52+ Botock tools.
    """
    state = load_state()
    flags = state.get("tool_flags", {})
    tools_list = []
    for slug, cfg in flags.items():
        tools_list.append({
            "tool_slug": slug,
            "tool_name": cfg.get("name", slug),
            "category": cfg.get("category", "other"),
            "is_enabled": bool(cfg.get("enabled", True)),
            "access_mode": cfg.get("access_mode", "guest"),
            "guest_daily_quota": int(cfg.get("guest_daily_quota", 10)),
            "user_daily_quota": int(cfg.get("user_daily_quota", 50)),
            "uses": int(cfg.get("uses", 0)),
            "errors": int(cfg.get("errors", 0)),
            "abandons": int(cfg.get("abandons", 0)),
        })
    # Sort by category then name
    tools_list.sort(key=lambda x: (x["category"], x["tool_name"]))
    return {"tools": tools_list}


@router.put("/tools/{tool_slug}", dependencies=[Depends(verify_admin_token)])
async def update_tool_admin(tool_slug: str, payload: ToolConfigUpdatePayload):
    """
    Updates a tool's On/Off status, Access Mode (guest/login/off), and Daily Quotas.
    """
    state = load_state()
    flags = state.setdefault("tool_flags", {})
    if tool_slug not in flags:
        flags[tool_slug] = {"name": payload.tool_name or tool_slug, "category": payload.category or "other"}

    flags[tool_slug]["enabled"] = payload.is_enabled
    flags[tool_slug]["access_mode"] = payload.access_mode
    flags[tool_slug]["guest_daily_quota"] = payload.guest_daily_quota
    flags[tool_slug]["user_daily_quota"] = payload.user_daily_quota
    if payload.tool_name:
        flags[tool_slug]["name"] = payload.tool_name
    if payload.category:
        flags[tool_slug]["category"] = payload.category

    save_state(state)

    # Sync to Supabase tool_configs table if configured
    if settings.SUPABASE_URL and settings.SUPABASE_SERVICE_ROLE_KEY:
        try:
            import httpx
            async with httpx.AsyncClient(timeout=3.0) as client:
                await client.post(
                    f"{settings.SUPABASE_URL.rstrip('/')}/rest/v1/tool_configs",
                    headers={
                        "apikey": settings.SUPABASE_SERVICE_ROLE_KEY,
                        "Authorization": f"Bearer {settings.SUPABASE_SERVICE_ROLE_KEY}",
                        "Content-Type": "application/json",
                        "Prefer": "resolution=merge-duplicates"
                    },
                    json={
                        "tool_slug": tool_slug,
                        "tool_name": flags[tool_slug].get("name", tool_slug),
                        "category": flags[tool_slug].get("category", "other"),
                        "is_enabled": payload.is_enabled,
                        "access_mode": payload.access_mode,
                        "guest_daily_quota": payload.guest_daily_quota,
                        "user_daily_quota": payload.user_daily_quota,
                    }
                )
        except Exception as e:
            logger.warning(f"Failed to sync tool config to Supabase: {e}")

    return {"status": "updated", "tool": flags[tool_slug]}


@router.get("/telemetry-summary", dependencies=[Depends(verify_admin_token)])
async def get_telemetry_summary_admin():
    """
    Returns aggregated analytics on:
    - Recent Failures (exact stage, error code, error message, time taken)
    - Recent Mid-way Abandons (where user stopped, reason, seconds waited)
    - Per-tool usage, completion, error, and drop-off counts.
    """
    state = load_state()
    events = state.get("tool_events", [])

    tool_stats: Dict[str, Any] = {}
    recent_failures: List[Dict[str, Any]] = []
    recent_abandons: List[Dict[str, Any]] = []

    for ev in events:
        tid = ev.get("tool_id", "unknown")
        status = ev.get("status", "view")
        elapsed = ev.get("elapsed_ms", 0)

        if tid not in tool_stats:
            tool_stats[tid] = {"uses": 0, "completed": 0, "failed": 0, "abandoned": 0, "total_ms": 0, "avg_ms": 0}

        tool_stats[tid]["uses"] += 1
        tool_stats[tid]["total_ms"] += elapsed
        tool_stats[tid]["avg_ms"] = round(tool_stats[tid]["total_ms"] / tool_stats[tid]["uses"])

        if status in ("success", "completed"):
            tool_stats[tid]["completed"] += 1
        elif status in ("error", "failed"):
            tool_stats[tid]["failed"] += 1
            if len(recent_failures) < 35:
                recent_failures.append({
                    "tool": tid,
                    "stage": ev.get("stage_reached", "processing"),
                    "error_code": ev.get("error_code", "PROCESS_ERR"),
                    "error_message": ev.get("error_message") or "Unknown execution error",
                    "elapsed_sec": round(elapsed / 1000, 1),
                    "created_at": ev.get("timestamp"),
                })
        elif status == "abandoned_midway":
            tool_stats[tid]["abandoned"] += 1
            if len(recent_abandons) < 35:
                recent_abandons.append({
                    "tool": tid,
                    "stage_stopped": ev.get("stage_reached", "init"),
                    "why_stopped": ev.get("abandon_reason") or "User exited mid-way",
                    "waited_sec": round(elapsed / 1000, 1),
                    "created_at": ev.get("timestamp"),
                })

    return {
        "tool_stats": tool_stats,
        "recent_failures": recent_failures,
        "recent_abandons": recent_abandons,
        "total_events": len(events),
    }

