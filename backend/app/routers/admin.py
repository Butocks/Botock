import logging
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Header, Body
from pydantic import BaseModel
from app.config import settings
from app.routers.auth_otp import get_platform_settings, _write_json, SETTINGS_FILE

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/admin", tags=["Admin"])

import hmac
import hashlib
import time

def verify_admin(
    admin_api_key: Optional[str] = Header(None, alias="admin-api-key"),
    x_admin_token: Optional[str] = Header(None, alias="x-admin-token"),
):
    """Validates either the master ADMIN_LOGIN_SECRET or a verified 2FA OTP admin token."""
    key = admin_api_key or x_admin_token
    if not key:
        raise HTTPException(status_code=401, detail="Admin authorization required.")
        
    # 1. Direct Master Secret Match
    if settings.ADMIN_LOGIN_SECRET and hmac.compare_digest(key.strip(), settings.ADMIN_LOGIN_SECRET.strip()):
        return True
        
    # 2. OTP Session Token Match
    from app.routers.auth_otp import SESSION_TOKENS_FILE, _read_json
    tokens = _read_json(SESSION_TOKENS_FILE, {})
    hashed = hashlib.sha256(key.strip().encode()).hexdigest()
    exp = tokens.get(hashed)
    if exp and time.time() <= exp:
        return True
        
    logger.warning("Failed admin access attempt with invalid or expired key/token.")
    raise HTTPException(status_code=403, detail="Invalid or expired admin authorization.")

class BlogUpdate(BaseModel):
    tool_id: str
    content_md: str
    title: str

@router.get("/stats", dependencies=[Depends(verify_admin)])
async def get_stats():
    """Fetch high-level platform stats."""
    from app.services.stats_service import get_video_stats
    video_stats = get_video_stats()
    return {
        "status": "success",
        "users": 1337,
        "generations": video_stats.get("all_time", 0),
        "video_stats": video_stats,
        "message": "Admin API connected successfully!"
    }

@router.get("/settings", dependencies=[Depends(verify_admin)])
async def fetch_settings():
    """Fetch current platform settings."""
    return get_platform_settings()

@router.post("/settings", dependencies=[Depends(verify_admin)])
async def update_settings(updates: Dict[str, Any] = Body(...)):
    """Update platform settings (e.g. guest limits)."""
    current = get_platform_settings()
    # Simple deep merge for quotas
    if "quotas" in updates:
        if "quotas" not in current:
            current["quotas"] = {}
        for k, v in updates["quotas"].items():
            if isinstance(v, dict) and k in current["quotas"] and isinstance(current["quotas"][k], dict):
                current["quotas"][k].update(v)
            else:
                current["quotas"][k] = v
                
    _write_json(SETTINGS_FILE, current)
    return {"status": "success", "settings": get_platform_settings()}

@router.post("/blog", dependencies=[Depends(verify_admin)])
async def update_blog(blog: BlogUpdate):
    """Upsert a blog entry for a tool."""
    logger.info(f"Admin updating blog for {blog.tool_id}")
    return {"status": "success", "tool_id": blog.tool_id, "message": "Blog updated successfully (Simulated DB)."}
