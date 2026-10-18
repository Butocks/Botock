import os
import json
import time
import logging
import hashlib
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

DEFAULT_STATE: Dict[str, Any] = {
    "quotas": {
        "guest_daily_limit": 10,
        "free_user_daily_limit": 30,
        "max_file_size_mb": 60,
        "forced_model": "auto",
        "global_maintenance": False,
        "announcement_banner": "",
    },
    "tool_flags": {
        "voice-changer": {"name": "AI Voice Studio & Cloner", "enabled": True, "pro_only": False, "maintenance": False, "uses": 1420, "errors": 4},
        "pdf-to-docx": {"name": "PDF to Word Converter", "enabled": True, "pro_only": False, "maintenance": False, "uses": 980, "errors": 2},
        "pdf-to-excel": {"name": "PDF to Excel Converter", "enabled": True, "pro_only": False, "maintenance": False, "uses": 610, "errors": 1},
        "ai-video": {"name": "AI Video Generator (Veo/Flow)", "enabled": True, "pro_only": True, "maintenance": False, "uses": 540, "errors": 9},
        "bg-remover": {"name": "AI Background Remover", "enabled": True, "pro_only": False, "maintenance": False, "uses": 2150, "errors": 0},
        "audio-enhance": {"name": "AI Studio Audio Enhancer", "enabled": True, "pro_only": False, "maintenance": False, "uses": 830, "errors": 3},
        "image-upscale": {"name": "AI Image Upscaler 4K/8K", "enabled": True, "pro_only": False, "maintenance": False, "uses": 710, "errors": 1},
        "image-compress": {"name": "Smart Image Compressor", "enabled": True, "pro_only": False, "maintenance": False, "uses": 1890, "errors": 0},
    },
    "users": [
        {"id": "u_1", "email": "creator@gmail.com", "name": "Ali Raza", "vip": True, "banned": False, "generations": 342, "source": "facebook", "joined": "2026-09-12"},
        {"id": "u_2", "email": "sarah.media@outlook.com", "name": "Sarah Khan", "vip": False, "banned": False, "generations": 48, "source": "google_search", "joined": "2026-10-01"},
        {"id": "u_3", "email": "spammer99@temp.io", "name": "Bot User", "vip": False, "banned": True, "generations": 950, "source": "direct", "joined": "2026-10-14"},
    ],
    "coupons": [
        {"code": "LAUNCH50", "discount_percent": 50, "bonus_credits": 250, "used_count": 34, "max_uses": 100, "active": True},
        {"code": "BOTOCKVIP", "discount_percent": 100, "bonus_credits": 1000, "used_count": 5, "max_uses": 20, "active": True},
    ],
    "telemetry": [],
    "blogs": [
        {
            "id": "blog_1",
            "title": "How to Clone Any Voice for Free with Zero-Shot AI in 2026",
            "slug": "how-to-clone-any-voice-free-zero-shot-ai",
            "excerpt": "Complete guide to using F5-TTS, Seed-VC, and Botock AI Voice Studio for podcasting, YouTube automation, and Urdu/Hindi voiceovers.",
            "content": "## Introduction to Zero-Shot Voice Cloning\n\nModern neural voice synthesis no longer requires hours of studio recordings. With zero-shot architectures like F5-TTS, creators can clone a voice using as little as 5 to 10 seconds of clear sample audio.\n\n### Why Botock Voice Studio is Different\n- Zero installation required\n- In-browser noise suppression\n- Full support for Pakistani & Indian accents",
            "category": "AI Audio Tutorials",
            "target_keyword": "free ai voice cloner",
            "meta_title": "Free AI Voice Cloner & Text to Speech Studio (2026 Guide) | Botock AI",
            "meta_description": "Learn how to clone voices from a 10-second audio clip and generate deep podcast or Urdu/Hindi neural voiceovers for free.",
            "cover_image": "https://botock.app/og-image.jpg",
            "author": "Ameer Ali",
            "reading_time": "4 min read",
            "status": "published",
            "featured": True,
            "views": 1240,
            "created_at": "2026-10-15T12:00:00Z",
            "updated_at": "2026-10-15T12:00:00Z",
        }
    ],
}


def load_state() -> Dict[str, Any]:
    if os.path.exists(STATE_FILE):
        try:
            with open(STATE_FILE, "r", encoding="utf-8") as f:
                data = json.load(f)
                # Ensure all default keys exist
                for k, v in DEFAULT_STATE.items():
                    if k not in data:
                        data[k] = v
                return data
        except Exception as e:
            logger.warning("Could not read admin state file: %s", e)
    return DEFAULT_STATE.copy()


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
):
    token = x_admin_token
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
    telemetry_list.insert(0, event)
    # Keep latest 2,000 events in memory/JSON
    state["telemetry"] = telemetry_list[:2000]

    # Auto-increment tool counter if visiting a tool page
    path_str = event["current_path"]
    if path_str.startswith("/tools/"):
        slug = path_str.replace("/tools/", "").strip("/")
        if slug in state.get("tool_flags", {}):
            state["tool_flags"][slug]["uses"] = state["tool_flags"][slug].get("uses", 0) + 1

    save_state(state)
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

    # Server Hardware Health
    cpu_usage = 18.5
    mem_info = 42.0
    if psutil:
        try:
            cpu_usage = psutil.cpu_percent(interval=0.1)
            mem_info = psutil.virtual_memory().percent
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
