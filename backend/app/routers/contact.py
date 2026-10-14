import logging
from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, EmailStr, Field

router = APIRouter(prefix="/api/core", tags=["Contact"])
logger = logging.getLogger(__name__)

class ContactRequest(BaseModel):
    name: str = Field(..., max_length=100)
    email: EmailStr
    whatsapp: str = Field(..., max_length=50)
    requirements: str = Field(..., max_length=5000)

import os
import json
import time
import fcntl
from app.config import settings

CONTACT_FILE = os.path.join(os.path.dirname(settings.SESSION_PATH) or "session", "contact_messages.json")

def _save_contact_message(data: dict):
    try:
        os.makedirs(os.path.dirname(CONTACT_FILE) or ".", exist_ok=True)
        messages = []
        if os.path.exists(CONTACT_FILE):
            try:
                with open(CONTACT_FILE, "r", encoding="utf-8") as f:
                    fcntl.flock(f, fcntl.LOCK_SH)
                    messages = json.load(f)
                    fcntl.flock(f, fcntl.LOCK_UN)
            except Exception:
                messages = []
        messages.insert(0, data)
        with open(CONTACT_FILE, "w", encoding="utf-8") as f:
            fcntl.flock(f, fcntl.LOCK_EX)
            json.dump(messages, f, indent=2)
            fcntl.flock(f, fcntl.LOCK_UN)
    except Exception as e:
        logger.error(f"Failed to persist contact message to disk: {e}")

@router.post("/contact")
async def submit_contact(req: ContactRequest, request: Request):
    item = {
        "name": req.name,
        "email": req.email,
        "whatsapp": req.whatsapp,
        "requirements": req.requirements,
        "status": "pending",
        "created_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
    }
    
    # 1. Save to JSON persistence
    _save_contact_message(item)

    # 2. If Postgres pool exists on app.state, insert into DB
    pool = getattr(request.app.state, "pool", None)
    if pool is not None:
        try:
            async with pool.acquire() as conn:
                await conn.execute("""
                    INSERT INTO custom_video_orders (name, email, whatsapp, requirements, status, created_at, updated_at)
                    VALUES ($1, $2, $3, $4, 'pending', now(), now())
                """, req.name, req.email, req.whatsapp, req.requirements)
        except Exception as e:
            logger.warning(f"Database insertion failed: {e}. Message persisted to file.")

    return {"success": True, "message": "Your request has been submitted successfully."}

