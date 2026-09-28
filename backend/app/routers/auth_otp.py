import os
import json
import time
import random
import string
import logging
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, HTTPException, Header, Depends, Request
from pydantic import BaseModel, EmailStr
from app.config import settings
from app.services.email_service import send_otp_email

logger = logging.getLogger(__name__)

router = APIRouter(tags=["Auth & Admin Operations"])

# Paths
LOCKOUT_FILE = os.path.join(os.path.dirname(settings.SESSION_PATH) or "session", "admin_lockout.json")
SETTINGS_FILE = os.path.join(os.path.dirname(settings.SESSION_PATH) or "session", "admin_settings.json")
COMPLAINTS_FILE = os.path.join(os.path.dirname(settings.SESSION_PATH) or "session", "complaints.json")
JOBS_FILE = os.path.join(os.path.dirname(settings.SESSION_PATH) or "session", "jobs.json")
BLOGS_FILE = os.path.join(os.path.dirname(settings.SESSION_PATH) or "session", "blogs.json")
SESSION_TOKENS_FILE = os.path.join(os.path.dirname(settings.SESSION_PATH) or "session", "admin_tokens.json")

# In-memory OTP storage: email -> { otp, expires_at, attempts_left, purpose }
otp_store: Dict[str, Dict[str, Any]] = {}

# ----------------------------------------------------
# Persistence Helpers
# ----------------------------------------------------
def _read_json(path: str, default: Any) -> Any:
    if os.path.exists(path):
        try:
            with open(path, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            logger.error(f"Error reading {path}: {e}")
    return default

def _write_json(path: str, data: Any):
    try:
        os.makedirs(os.path.dirname(path) or ".", exist_ok=True)
        # Write atomically and set restrictive permissions
        temp_path = f"{path}.tmp.{os.getpid()}.{time.time()}"
        with open(temp_path, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)
        os.chmod(temp_path, 0o600)
        os.replace(temp_path, path)
    except Exception as e:
        logger.error(f"Error writing {path}: {e}")


# ----------------------------------------------------
# Zero-Backdoor Lockout Engine
# ----------------------------------------------------
def check_lockout(ip: str) -> tuple[bool, int]:
    """Returns (is_locked, seconds_left). If locked, cannot login."""
    lockouts = _read_json(LOCKOUT_FILE, {})
    user_lock = lockouts.get(ip)
    if not user_lock:
        return False, 0
    
    locked_until = user_lock.get("locked_until", 0)
    now = time.time()
    if now < locked_until:
        return True, int(locked_until - now)
    return False, 0

def record_failed_attempt(ip: str) -> tuple[int, bool, int]:
    """
    Tracks failed attempts and cycles per IP.
    3 failed attempts -> 1 failed cycle.
    3 failed cycles -> 24-hour lockout.
    Returns (attempts_left, is_locked, seconds_left).
    """
    lockouts = _read_json(LOCKOUT_FILE, {})
    record = lockouts.get(ip, {"cycles_failed": 0, "locked_until": 0})
    
    # Increment cycle failure
    record["cycles_failed"] = record.get("cycles_failed", 0) + 1
    
    if record["cycles_failed"] >= settings.ADMIN_MAX_OTP_CYCLES:
        # Lockout for 24 hours
        record["locked_until"] = time.time() + (24 * 3600)
        lockouts[ip] = record
        _write_json(LOCKOUT_FILE, lockouts)
        logger.warning(f"🚨 IP LOCKED OUT FOR 24 HOURS: {ip}")
        return 0, True, 24 * 3600
    
    lockouts[ip] = record
    _write_json(LOCKOUT_FILE, lockouts)
    return 0, False, 0


# ----------------------------------------------------
# Default Platform Settings & Data
# ----------------------------------------------------
DEFAULT_SETTINGS = {
    "quotas": {
        "free_daily_credits": 50,
        "free_daily_photos": 5,
        "subscribers_unlimited_photos": True,
        "video_tokens": 1500,
    },
    "promotions": {
        "active": True,
        "title": "⚡ Special Launch Offer: Unlimited Access",
        "badge": "25% OFF",
        "discount_percentage": 25,
        "code": "BOTOCK25",
        "banner_text": "🎁 Limited Time Gift: Get 25% OFF all Pro plans + 1,500 High-Speed Video Tokens!",
    },
    "plans": [
        {
            "id": "free",
            "name": "Free Tier",
            "price": "$0",
            "period": "forever",
            "desc": "Perfect for testing and casual daily content creation.",
            "badge": "Get Started",
            "highlight": False,
            "features": [
                "3 AI Videos / Day",
                "5 AI Photos / Day",
                "24-Hour Media Storage",
                "Access to in-browser Video & Photo Studio",
                "Standard generation queue",
                "Supported by non-intrusive ads",
            ],
            "ctaText": "Start Creating Free",
            "ctaHref": "/tools/video-generator",
        },
        {
            "id": "tools-pro",
            "name": "Tools Unlimited",
            "price": "$5",
            "period": "per month",
            "desc": "For professionals who need fast, ad-free utility tools every day.",
            "badge": "Popular for Utilities",
            "highlight": False,
            "features": [
                "100% Ad-Free Experience across entire site",
                "Unlimited PDF Tools (Merge, Split, OCR, Convert)",
                "Unlimited Image & Video Studio usage",
                "Fast server-side processing",
                "Standard AI Video quota (3 videos/day)",
                "Email support",
            ],
            "ctaText": "Upgrade to Tools Pro",
            "ctaHref": "/signup?plan=tools",
        },
        {
            "id": "creator-pro",
            "name": "AI Creator Pro",
            "price": "$15",
            "period": "per month",
            "desc": "Maximum power for content creators, agencies, and marketers.",
            "badge": "Most Popular",
            "highlight": True,
            "features": [
                "1,500 AI Video Generation Tokens / month",
                "Unlimited AI Photo Generations (Nano Banana 2)",
                "Unlock 720p & 1080p Full HD video generations",
                "Multi-scene Project Continuation",
                "Photo-to-Video & Image Reference inputs",
                "30-Day Video Retention in Library",
                "VIP Priority Queue (Zero waiting time)",
                "100% Ad-Free on all tools & generators",
            ],
            "ctaText": "Get Creator Pro",
            "ctaHref": "/signup?plan=pro",
        },
    ],
    "tool_rules": [
        {"id": "video-generator", "name": "Google Flow AI Video Studio", "isProOnly": False, "isInDevelopment": False, "statusMessage": "Operational"},
        {"id": "image-generator", "name": "Nano Banana AI Image Studio", "isProOnly": False, "isInDevelopment": False, "statusMessage": "Operational"},
        {"id": "pdf-merge", "name": "Merge PDF Documents", "isProOnly": False, "isInDevelopment": False, "statusMessage": "Operational"},
        {"id": "pdf-compress", "name": "Compress PDF Files", "isProOnly": False, "isInDevelopment": False, "statusMessage": "Operational"},
        {"id": "pdf-to-word", "name": "PDF to Word (DOCX)", "isProOnly": True, "isInDevelopment": False, "statusMessage": "Pro Only"},
        {"id": "image-upscale", "name": "AI Image Upscaler 4K", "isProOnly": False, "isInDevelopment": True, "statusMessage": "This tool is temporarily restricted: Currently In Development"},
    ],
    "policies": {
        "privacy_policy": "Botock respects your privacy. Media generated is stored for 24h for free users and 30 days for Pro users. We never sell your personal information.",
        "terms_of_service": "By using Botock, you agree to generate ethical media conforming to community safety standards.",
    }
}

def get_platform_settings() -> Dict[str, Any]:
    current = _read_json(SETTINGS_FILE, DEFAULT_SETTINGS)
    for k, v in DEFAULT_SETTINGS.items():
        if k not in current:
            current[k] = v
    return current


# ----------------------------------------------------
# Pydantic Schemas
# ----------------------------------------------------
class AdminSecretRequest(BaseModel):
    email: str
    secret: str

class AdminOtpVerifyRequest(BaseModel):
    email: str
    otp: str

class UserOtpRequest(BaseModel):
    email: str

class UserOtpVerifyRequest(BaseModel):
    email: str
    otp: str

class ComplaintSubmitRequest(BaseModel):
    email: str
    category: str
    severity: str
    referenceId: Optional[str] = ""
    description: str

class ComplaintUpdateRequest(BaseModel):
    ticket_id: str
    status: str

class JobPosting(BaseModel):
    id: Optional[str] = None
    title: str
    department: str
    location: str
    type: str
    desc: str
    requirements: List[str]

class BlogPostCreate(BaseModel):
    id: Optional[str] = None
    title: str
    excerpt: str
    category: str
    categoryLabel: str
    readTime: str
    author: str
    blocks: List[Dict[str, Any]]  # [{"type": "attachment"|"paragraph", "url": "...", "content": "..."}]


# ----------------------------------------------------
# Admin Auth Dependency
# ----------------------------------------------------
def verify_admin_token(x_admin_token: Optional[str] = Header(None)) -> str:
    if not x_admin_token:
        raise HTTPException(status_code=401, detail="Admin authorization token missing.")
    tokens = _read_json(SESSION_TOKENS_FILE, {})
    exp = tokens.get(x_admin_token)
    if not exp or time.time() > exp:
        raise HTTPException(status_code=401, detail="Admin session expired. Please re-login.")
    return x_admin_token


import secrets

# ----------------------------------------------------
# Admin Authentication Routes
# ----------------------------------------------------
@router.post("/api/admin/auth/verify-secret")
async def verify_admin_secret(req: AdminSecretRequest, request: Request):
    email_clean = req.email.strip().lower()
    client_ip = request.client.host if request.client else "unknown"
    
    # 1. Check 24-hour lockout
    is_locked, seconds_left = check_lockout(client_ip)
    if is_locked:
        hours = seconds_left // 3600
        mins = (seconds_left % 3600) // 60
        raise HTTPException(
            status_code=423,
            detail=f"Security Lockout Active: Too many failed attempts. Try again in {hours}h {mins}m."
        )

    # 2. Check allowed admins from env
    allowed_admins = [e.strip().lower() for e in settings.ADMIN_EMAILS.split(",") if e.strip()]
    if email_clean not in allowed_admins:
        record_failed_attempt(client_ip)
        raise HTTPException(status_code=403, detail="Access denied. Email not listed in authorized administrators.")

    # 3. Check secret code from env
    server_secret = settings.ADMIN_LOGIN_SECRET.strip()
    if not server_secret or req.secret.strip() != server_secret:
        record_failed_attempt(client_ip)
        raise HTTPException(status_code=401, detail="Invalid admin secret authorization code.")

    # 4. Generate 6-digit OTP (valid 10 minutes)
    otp_code = "".join(secrets.choice(string.digits) for _ in range(6))
    expires_at = time.time() + (settings.ADMIN_OTP_EXPIRY_MINUTES * 60)
    
    otp_store[email_clean] = {
        "otp": otp_code,
        "expires_at": expires_at,
        "attempts_left": 3,
        "purpose": "Admin Command Center Login",
    }

    # 5. Dispatch email
    send_otp_email(to_email=email_clean, otp_code=otp_code, purpose="Admin Command Center Login")

    return {
        "success": True,
        "message": f"Verification code dispatched to {email_clean}. Valid for 10 minutes (3 attempts max).",
        "expires_in_seconds": settings.ADMIN_OTP_EXPIRY_MINUTES * 60,
    }


@router.post("/api/admin/auth/verify-otp")
async def verify_admin_otp(req: AdminOtpVerifyRequest, request: Request):
    email_clean = req.email.strip().lower()
    client_ip = request.client.host if request.client else "unknown"

    # Check lockout
    is_locked, seconds_left = check_lockout(client_ip)
    if is_locked:
        raise HTTPException(status_code=423, detail="Account restricted for 24 hours.")

    stored = otp_store.get(email_clean)
    if not stored:
        raise HTTPException(status_code=400, detail="No active OTP found. Please request a new code.")

    # Check expiration (10 min)
    if time.time() > stored["expires_at"]:
        del otp_store[email_clean]
        record_failed_attempt(client_ip)
        raise HTTPException(status_code=400, detail="OTP expired. The 10-minute window has lapsed.")

    # Check OTP match
    if req.otp.strip() != stored["otp"]:
        stored["attempts_left"] -= 1
        if stored["attempts_left"] <= 0:
            del otp_store[email_clean]
            _, locked_now, secs = record_failed_attempt(client_ip)
            if locked_now:
                raise HTTPException(status_code=423, detail="Exceeded 3 failed cycles. Account restricted for 24 hours.")
            raise HTTPException(status_code=400, detail="Code expired after 3 failed attempts. Please request a new OTP.")
        
        raise HTTPException(
            status_code=400,
            detail=f"Invalid verification code. {stored['attempts_left']} attempt(s) remaining."
        )

    # Success: Issue admin session token (valid 24 hours)
    del otp_store[email_clean]
    admin_token = "adm_" + secrets.token_hex(32)
    tokens = _read_json(SESSION_TOKENS_FILE, {})
    tokens[admin_token] = time.time() + (24 * 3600)
    _write_json(SESSION_TOKENS_FILE, tokens)

    return {
        "success": True,
        "admin_token": admin_token,
        "message": "Admin authorization granted.",
    }


# ----------------------------------------------------
# 2-Step Verification for Critical Admin Actions
# ----------------------------------------------------
TWO_STEP_FILE = os.path.join(os.path.dirname(settings.SESSION_PATH) or "session", "2step_tokens.json")

@router.post("/api/admin/auth/request-2step")
async def request_two_step(admin_token: str = Depends(verify_admin_token)):
    """Issues a 2-step action verification OTP to the primary admin."""
    primary_admin = [e.strip().lower() for e in settings.ADMIN_EMAILS.split(",") if e.strip()][0]
    action_otp = "".join("".join(secrets.choice(string.digits) for _ in range(6)))
    
    two_steps = _read_json(TWO_STEP_FILE, {})
    two_steps[admin_token] = {
        "otp": action_otp,
        "expires_at": time.time() + 600,
        "attempts_left": 3,
        "purpose": "2-Step Critical Action Confirmation",
    }
    _write_json(TWO_STEP_FILE, two_steps)
    
    send_otp_email(to_email=primary_admin, otp_code=action_otp, purpose="2-Step Critical Action Confirmation")
    return {"success": True, "message": "2-Step action code sent to admin email."}


def require_2step_verification(two_step_code: Optional[str] = Header(None, alias="X-Admin-2Step-Code"), admin_token: str = Depends(verify_admin_token)):
    """Verifies that the sensitive action has provided the valid 2-step verification code bound to the admin session."""
    if not two_step_code:
        raise HTTPException(status_code=403, detail="2-Step Verification required for this critical modification.")
    
    code = two_step_code.strip()
    two_steps = _read_json(TWO_STEP_FILE, {})
    stored = two_steps.get(admin_token)

    if stored and time.time() <= stored["expires_at"]:
        if code == stored["otp"]:
            del two_steps[admin_token]
            _write_json(TWO_STEP_FILE, two_steps)
            return True
        else:
            stored["attempts_left"] -= 1
            if stored["attempts_left"] <= 0:
                del two_steps[admin_token]
                _write_json(TWO_STEP_FILE, two_steps)
                raise HTTPException(status_code=403, detail="Too many failed attempts. 2-Step code invalidated.")
            
            two_steps[admin_token] = stored
            _write_json(TWO_STEP_FILE, two_steps)
            raise HTTPException(status_code=403, detail=f"Incorrect code. {stored['attempts_left']} attempt(s) remaining.")

    raise HTTPException(status_code=403, detail="Invalid or expired 2-Step verification code.")


# ----------------------------------------------------
# Public & Protected Quota, Plans & Promotions Routes
# ----------------------------------------------------
@router.get("/api/public/platform-config")
async def get_public_config():
    """Returns live quotas, discount promotion, pricing, and tool status for users."""
    cfg = get_platform_settings()
    return {
        "quotas": cfg.get("quotas", {}),
        "promotions": cfg.get("promotions", {}),
        "plans": cfg.get("plans", []),
        "tool_rules": cfg.get("tool_rules", []),
        "policies": cfg.get("policies", {}),
    }


@router.post("/api/admin/quotas")
async def update_quotas(
    data: Dict[str, Any],
    admin_token: str = Depends(verify_admin_token),
    _verified: bool = Depends(require_2step_verification),
):
    """Admin updates daily free credits, photos, and video tokens (Protected by 2-Step)."""
    cfg = get_platform_settings()
    cfg["quotas"].update({
        "free_daily_credits": int(data.get("free_daily_credits", 50)),
        "free_daily_photos": int(data.get("free_daily_photos", 5)),
        "subscribers_unlimited_photos": True,
        "video_tokens": int(data.get("video_tokens", 1500)),
    })
    _write_json(SETTINGS_FILE, cfg)
    return {"success": True, "quotas": cfg["quotas"]}


@router.post("/api/admin/promotions")
async def update_promotions(
    data: Dict[str, Any],
    admin_token: str = Depends(verify_admin_token),
    _verified: bool = Depends(require_2step_verification),
):
    """Admin configures gift / discount offers (Protected by 2-Step)."""
    cfg = get_platform_settings()
    cfg["promotions"] = data
    _write_json(SETTINGS_FILE, cfg)
    return {"success": True, "promotions": cfg["promotions"]}


@router.post("/api/admin/plans")
async def update_plans(
    data: List[Dict[str, Any]],
    admin_token: str = Depends(verify_admin_token),
    _verified: bool = Depends(require_2step_verification),
):
    """Admin edits pricing and plan feature bullets (Protected by 2-Step)."""
    cfg = get_platform_settings()
    cfg["plans"] = data
    _write_json(SETTINGS_FILE, cfg)
    return {"success": True, "plans": cfg["plans"]}


@router.post("/api/admin/tool-rules")
async def update_tool_rules(
    data: List[Dict[str, Any]],
    admin_token: str = Depends(verify_admin_token),
    _verified: bool = Depends(require_2step_verification),
):
    """Admin locks tools for free users or marks 'In Development' (Protected by 2-Step)."""
    cfg = get_platform_settings()
    cfg["tool_rules"] = data
    _write_json(SETTINGS_FILE, cfg)
    return {"success": True, "tool_rules": cfg["tool_rules"]}


@router.post("/api/admin/policies")
async def update_policies(
    data: Dict[str, str],
    admin_token: str = Depends(verify_admin_token),
    _verified: bool = Depends(require_2step_verification),
):
    """Admin updates privacy policy & terms (Protected by 2-Step)."""
    cfg = get_platform_settings()
    cfg["policies"] = data
    _write_json(SETTINGS_FILE, cfg)
    return {"success": True, "policies": cfg["policies"]}


# ----------------------------------------------------
# Complaints System (Public Submit & Admin Track)
# ----------------------------------------------------
@router.post("/api/public/complaints")
async def submit_complaint(req: ComplaintSubmitRequest):
    ticket_id = f"CMP-{random.randint(100000, 999999)}"
    complaints = _read_json(COMPLAINTS_FILE, [])
    item = {
        "id": ticket_id,
        "email": req.email,
        "category": req.category,
        "severity": req.severity,
        "referenceId": req.referenceId,
        "description": req.description,
        "status": "Under Review",
        "stage": "Assigned to Engineering Lead",
        "createdAt": time.strftime("%Y-%m-%d %H:%M:%S"),
    }
    complaints.insert(0, item)
    _write_json(COMPLAINTS_FILE, complaints)
    return {"success": True, "ticket_id": ticket_id, "ticket": item}


@router.get("/api/public/complaints/{ticket_id}")
async def track_complaint(ticket_id: str):
    complaints = _read_json(COMPLAINTS_FILE, [])
    for c in complaints:
        if c["id"].upper() == ticket_id.strip().upper():
            return {"found": True, "complaint": c}
    raise HTTPException(status_code=404, detail="Complaint ticket not found.")


@router.get("/api/admin/complaints")
async def list_complaints(admin_token: str = Depends(verify_admin_token)):
    return _read_json(COMPLAINTS_FILE, [])


@router.post("/api/admin/complaints/update-status")
async def update_complaint_status(
    req: ComplaintUpdateRequest,
    admin_token: str = Depends(verify_admin_token),
    _verified: bool = Depends(require_2step_verification),
):
    complaints = _read_json(COMPLAINTS_FILE, [])
    updated = False
    for c in complaints:
        if c["id"].upper() == req.ticket_id.strip().upper():
            c["status"] = req.status
            updated = True
            break
    if updated:
        _write_json(COMPLAINTS_FILE, complaints)
        return {"success": True}
    raise HTTPException(status_code=404, detail="Ticket not found.")


# ----------------------------------------------------
# Dynamic Careers / Join Us Portal
# ----------------------------------------------------
DEFAULT_JOBS = []

@router.get("/api/public/jobs")
async def list_public_jobs():
    return _read_json(JOBS_FILE, DEFAULT_JOBS)


@router.post("/api/admin/jobs")
async def save_job(
    job: JobPosting,
    admin_token: str = Depends(verify_admin_token),
    _verified: bool = Depends(require_2step_verification),
):
    jobs = _read_json(JOBS_FILE, DEFAULT_JOBS)
    if not job.id:
        job.id = f"job-{int(time.time())}"
        jobs.insert(0, job.dict())
    else:
        for idx, j in enumerate(jobs):
            if j["id"] == job.id:
                jobs[idx] = job.dict()
                break
    _write_json(JOBS_FILE, jobs)
    return {"success": True, "jobs": jobs}


@router.delete("/api/admin/jobs/{job_id}")
async def delete_job(
    job_id: str,
    admin_token: str = Depends(verify_admin_token),
    _verified: bool = Depends(require_2step_verification),
):
    jobs = _read_json(JOBS_FILE, DEFAULT_JOBS)
    jobs = [j for j in jobs if j["id"] != job_id]
    _write_json(JOBS_FILE, jobs)
    return {"success": True, "jobs": jobs}


# ----------------------------------------------------
# Structured Multi-Block Blog Studio
# Title + Attachment + Paragraph + Attachment + Paragraph...
# ----------------------------------------------------
DEFAULT_BLOGS = [
    {
        "id": "mastering-ai-video-prompts",
        "title": "Mastering AI Video Prompts: How to Get Cinematic Motion in Google Flow",
        "excerpt": "Learn the exact prompt structures, camera motion hints, and lighting modifiers that transform basic text descriptions into Hollywood-grade 4-10 second footage.",
        "category": "ai",
        "categoryLabel": "Generative AI",
        "readTime": "5 min read",
        "date": "Sep 18, 2026",
        "author": "Botock VFX Lab",
        "blocks": [
            {"type": "paragraph", "content": "Cinematic AI video generation requires precise motion hints and depth framing."},
            {"type": "attachment", "url": "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&q=80", "caption": "Google Flow Latent Space rendering"},
            {"type": "paragraph", "content": "When crafting scene descriptions, prioritize camera angle, lens mm, and ambient volumetric particles."},
            {"type": "attachment", "url": "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=1200&q=80", "caption": "Color grading benchmark comparison"},
            {"type": "paragraph", "content": "Keep motion modifiers concise to prevent hallucination across temporal frames."}
        ]
    }
]

@router.get("/api/public/blogs")
async def list_public_blogs():
    return _read_json(BLOGS_FILE, DEFAULT_BLOGS)


@router.post("/api/admin/blogs")
async def save_blog(
    blog: BlogPostCreate,
    admin_token: str = Depends(verify_admin_token),
    _verified: bool = Depends(require_2step_verification),
):
    blogs = _read_json(BLOGS_FILE, DEFAULT_BLOGS)
    if not blog.id:
        slug = "-".join("".join(c if c.isalnum() else " " for c in blog.title).lower().split())
        blog.id = slug or f"post-{int(time.time())}"
        new_blog = blog.dict()
        new_blog["date"] = time.strftime("%b %d, %Y")
        blogs.insert(0, new_blog)
    else:
        for idx, b in enumerate(blogs):
            if b["id"] == blog.id:
                blogs[idx] = blog.dict()
                break
    _write_json(BLOGS_FILE, blogs)
    return {"success": True, "blogs": blogs}


@router.delete("/api/admin/blogs/{blog_id}")
async def delete_blog(
    blog_id: str,
    admin_token: str = Depends(verify_admin_token),
    _verified: bool = Depends(require_2step_verification),
):
    blogs = _read_json(BLOGS_FILE, DEFAULT_BLOGS)
    blogs = [b for b in blogs if b["id"] != blog_id]
    _write_json(BLOGS_FILE, blogs)
    return {"success": True, "blogs": blogs}


# ----------------------------------------------------
# Analytics & Countries Breakdown
# ----------------------------------------------------
@router.get("/api/admin/analytics")
async def get_analytics(admin_token: str = Depends(verify_admin_token)):
    return {
        "visitors": {
            "live": 42,
            "daily": 5840,
            "weekly": 38920,
            "monthly": 164500,
        },
        "countries": [
            {"country": "Pakistan", "code": "PK", "percentage": 34, "users": 1985},
            {"country": "United States", "code": "US", "percentage": 28, "users": 1635},
            {"country": "United Kingdom", "code": "GB", "percentage": 14, "users": 817},
            {"country": "United Arab Emirates", "code": "AE", "percentage": 11, "users": 642},
            {"country": "India", "code": "IN", "percentage": 8, "users": 467},
            {"country": "Others", "code": "GL", "percentage": 5, "users": 294},
        ],
        "subscribers_total": 482,
        "mrr": "$6,840",
    }


# ----------------------------------------------------
# User Signup & Forgot Password OTP
# ----------------------------------------------------
@router.post("/api/auth/signup-otp")
async def send_user_signup_otp(req: UserOtpRequest):
    email = req.email.strip().lower()
    otp_code = "".join("".join(secrets.choice(string.digits) for _ in range(6)))
    otp_store[f"user_signup_{email}"] = {
        "otp": otp_code,
        "expires_at": time.time() + 600,
        "attempts_left": 3,
        "purpose": "Account Registration Verification",
    }
    send_otp_email(to_email=email, otp_code=otp_code, purpose="Account Registration Verification")
    return {"success": True, "message": "Verification code dispatched to your email."}


@router.post("/api/auth/verify-signup-otp")
async def verify_user_signup_otp(req: UserOtpVerifyRequest):
    email = req.email.strip().lower()
    stored = otp_store.get(f"user_signup_{email}")
    if not stored:
        raise HTTPException(status_code=400, detail="No active verification code found.")
    if time.time() > stored["expires_at"]:
        del otp_store[f"user_signup_{email}"]
        raise HTTPException(status_code=400, detail="Code expired. Please request a new verification code.")
    if req.otp.strip() != stored["otp"]:
        stored["attempts_left"] -= 1
        if stored["attempts_left"] <= 0:
            del otp_store[f"user_signup_{email}"]
            raise HTTPException(status_code=400, detail="Too many failed attempts. Code invalidated.")
        raise HTTPException(status_code=400, detail=f"Incorrect code. {stored['attempts_left']} attempt(s) remaining.")
    
    del otp_store[f"user_signup_{email}"]
    return {"success": True, "message": "Email verified successfully."}


@router.post("/api/auth/forgot-password-otp")
async def send_user_forgot_otp(req: UserOtpRequest):
    email = req.email.strip().lower()
    otp_code = "".join("".join(secrets.choice(string.digits) for _ in range(6)))
    otp_store[f"user_forgot_{email}"] = {
        "otp": otp_code,
        "expires_at": time.time() + 600,
        "attempts_left": 3,
        "purpose": "Password Recovery",
    }
    send_otp_email(to_email=email, otp_code=otp_code, purpose="Password Recovery")
    return {"success": True, "message": "Password reset code dispatched to your email."}


@router.post("/api/auth/verify-forgot-otp")
async def verify_user_forgot_otp(req: UserOtpVerifyRequest):
    email = req.email.strip().lower()
    stored = otp_store.get(f"user_forgot_{email}")
    if not stored:
        raise HTTPException(status_code=400, detail="No active password reset code found.")
    if time.time() > stored["expires_at"]:
        del otp_store[f"user_forgot_{email}"]
        raise HTTPException(status_code=400, detail="Reset code expired. Please request a new code.")
    if req.otp.strip() != stored["otp"]:
        stored["attempts_left"] -= 1
        if stored["attempts_left"] <= 0:
            del otp_store[f"user_forgot_{email}"]
            raise HTTPException(status_code=400, detail="Too many failed attempts. Code invalidated.")
        raise HTTPException(status_code=400, detail=f"Incorrect code. {stored['attempts_left']} attempt(s) remaining.")
    
    del otp_store[f"user_forgot_{email}"]
    return {"success": True, "message": "Reset code verified. You may now update your password."}
