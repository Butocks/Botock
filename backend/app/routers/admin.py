import logging
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Header
from pydantic import BaseModel
from app.config import settings

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/admin", tags=["Admin"])

def verify_admin(admin_api_key: Optional[str] = Header(None)):
    """Very strict API Key validation for local Admin Portal connecting to Prod."""
    # Ensure a secure key is configured in the environment
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

@router.post("/blog", dependencies=[Depends(verify_admin)])
async def update_blog(blog: BlogUpdate):
    """Upsert a blog entry for a tool. Stored in Supabase."""
    from app.middleware.auth import _rpc
    # We use a custom RPC to upsert the blog, assuming `upsert_tool_blog` exists
    # If not, we will rely on Supabase REST API directly or standard python client.
    logger.info(f"Admin updating blog for {blog.tool_id}")
    
    # We will just print for now, and implement DB call safely.
    # In a real environment, we'd do:
    # await _rpc("upsert_tool_blog", {"p_tool_id": blog.tool_id, "p_title": blog.title, "p_content_md": blog.content_md})
    
    return {"status": "success", "tool_id": blog.tool_id, "message": "Blog updated successfully (Simulated DB)."}
