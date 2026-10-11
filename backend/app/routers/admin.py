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

@router.get("/users", dependencies=[Depends(verify_admin)])
async def get_admin_users():
    """Fetch all registered users with generation metrics and VIP/Restricted flags."""
    from app.routers.auth_otp import USER_STATUS_FILE, _read_json
    from app.services.stats_service import get_video_stats
    
    settings_data = get_platform_settings()
    quotas = settings_data.get("quotas", {})
    special_users = set(u.lower().strip() for u in quotas.get("special_unlimited_users", []))
    restricted_users = set(u.lower().strip() for u in quotas.get("restricted_users", []))
    
    statuses = _read_json(USER_STATUS_FILE, {})
    stats = get_video_stats()
    user_daily = stats.get("user_daily", {})
    user_monthly = stats.get("user_monthly", {})
    user_totals = stats.get("user_totals", {})
    
    all_emails = set(statuses.keys())
    all_emails.update(user_totals.keys())
    all_emails.update(special_users)
    all_emails.update(restricted_users)
    
    user_list = []
    for email in sorted(all_emails):
        if not email or "@" not in email:
            continue
        user_list.append({
            "email": email,
            "status": statuses.get(email, "active"),
            "is_vip": email.lower() in special_users,
            "is_restricted": email.lower() in restricted_users,
            "videos_today": user_daily.get(email, 0),
            "videos_month": user_monthly.get(email, 0),
            "total_videos": user_totals.get(email, 0),
        })
        
    return {
        "status": "success",
        "total_users": len(user_list),
        "users": user_list
    }

class UserActionRequest(BaseModel):
    email: str

@router.post("/users/toggle-vip", dependencies=[Depends(verify_admin)])
async def toggle_user_vip(req: UserActionRequest):
    """Toggle a user's Special/VIP Unlimited status (exempt from all limits)."""
    current = get_platform_settings()
    quotas = current.setdefault("quotas", {})
    specials = set(u.lower().strip() for u in quotas.get("special_unlimited_users", []))
    email = req.email.lower().strip()
    
    if email in specials:
        specials.remove(email)
        is_vip = False
    else:
        specials.add(email)
        is_vip = True
        
    quotas["special_unlimited_users"] = list(specials)
    _write_json(SETTINGS_FILE, current)
    return {"status": "success", "email": email, "is_vip": is_vip}

@router.post("/users/toggle-restrict", dependencies=[Depends(verify_admin)])
async def toggle_user_restrict(req: UserActionRequest):
    """Toggle a user's Restricted/Banned status."""
    current = get_platform_settings()
    quotas = current.setdefault("quotas", {})
    restricted = set(u.lower().strip() for u in quotas.get("restricted_users", []))
    email = req.email.lower().strip()
    
    if email in restricted:
        restricted.remove(email)
        is_restricted = False
    else:
        restricted.add(email)
        is_restricted = True
        
    quotas["restricted_users"] = list(restricted)
    _write_json(SETTINGS_FILE, current)
    return {"status": "success", "email": email, "is_restricted": is_restricted}
