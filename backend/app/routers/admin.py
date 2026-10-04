import logging
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Header, Body
from pydantic import BaseModel
from app.config import settings
from app.routers.auth_otp import get_platform_settings, _write_json, SETTINGS_FILE

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/admin", tags=["Admin"])

def verify_admin(admin_api_key: Optional[str] = Header(None)):
    """Very strict API Key validation for local Admin Portal connecting to Prod."""
    if not settings.ADMIN_LOGIN_SECRET or len(settings.ADMIN_LOGIN_SECRET) < 10:
        logger.error("ADMIN_LOGIN_SECRET is missing or too weak.")
        raise HTTPException(status_code=500, detail="Admin environment not properly configured.")
        
    if admin_api_key != settings.ADMIN_LOGIN_SECRET:
        logger.warning("Failed admin access attempt with invalid key.")
        raise HTTPException(status_code=403, detail="Invalid Admin API Key")
    return True

class BlogUpdate(BaseModel):
    tool_id: str
    content_md: str
    title: str

@router.get("/stats", dependencies=[Depends(verify_admin)])
async def get_stats():
    """Fetch high-level platform stats."""
    return {
        "status": "success",
        "users": 1337,
        "generations": 42069,
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
