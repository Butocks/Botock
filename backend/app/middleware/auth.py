import time
import logging
from typing import Optional
from collections import defaultdict
from fastapi import Header, Query, HTTPException, Depends
import jwt
from app.config import settings

logger = logging.getLogger(__name__)

# In-memory daily quota store: user_id -> [timestamps of generations today]
user_daily_generations = defaultdict(list)

def get_current_user(
    authorization: Optional[str] = Header(None),
    token: Optional[str] = Query(None, alias="token"),
) -> dict:
    """
    FastAPI dependency to verify Supabase JWT token.
    Enforces strict signature verification — unauthenticated or forged tokens receive 401.
    Accepts token via 'Authorization: Bearer <token>' header or '?token=<token>' query parameter.
    """
    jwt_token = None
    if authorization:
        if not authorization.startswith("Bearer "):
            logger.warning("Auth failed: header does not start with Bearer. (Token hidden)")
            raise HTTPException(
                status_code=401,
                detail="Invalid Authorization header format. Expected 'Bearer <token>'."
            )
        jwt_token = authorization.split(" ")[1].strip()
    elif token:
        jwt_token = token.strip()

    if not jwt_token:
        logger.warning("Auth failed: no jwt_token found. (Headers hidden)")
        raise HTTPException(
            status_code=401,
            detail="Authentication required. Please sign in to Botock to access this resource."
        )

    if not settings.SUPABASE_JWT_SECRET:
        logger.error("CRITICAL: SUPABASE_JWT_SECRET is not configured on the server.")
        raise HTTPException(
            status_code=500,
            detail="Authentication failed: SUPABASE_JWT_SECRET is not configured on the server."
        )

    payload = None
    decode_errors = []

    expected_issuer = f"{settings.SUPABASE_URL.rstrip('/')}/auth/v1"
    
    # Try 1: Decode with raw secret string
    try:
        payload = jwt.decode(
            jwt_token,
            settings.SUPABASE_JWT_SECRET,
            algorithms=["HS256"],
            audience="authenticated",
            issuer=expected_issuer,
            options={"verify_exp": True, "verify_iss": True}
        )
    except Exception as e:
        decode_errors.append(f"Raw secret error: {str(e)}")

    # Try 2: Decode with base64 decoded secret (common in Supabase dashboards)
    if not payload:
        try:
            import base64
            b64_secret = base64.b64decode(settings.SUPABASE_JWT_SECRET)
            payload = jwt.decode(
                jwt_token,
                b64_secret,
                algorithms=["HS256"],
                audience="authenticated",
                issuer=expected_issuer,
                options={"verify_exp": True, "verify_iss": True}
            )
        except Exception as e:
            decode_errors.append(f"Base64 secret error: {str(e)}")

    # If both Try 1 and Try 2 failed, the token is invalid
    if not payload:
        logger.warning(f"JWT signature/issuer verification failed: {decode_errors}")
        raise HTTPException(
            status_code=401,
            detail="Invalid or forged authentication token. Please sign out and sign in again to refresh your session."
        )

    user_id = payload.get("sub") or payload.get("id")
    email = payload.get("email", "")
    role = payload.get("role", "authenticated")
    app_metadata = payload.get("app_metadata", {})
    is_pro = bool(app_metadata.get("is_pro") == True or role == "pro" or app_metadata.get("subscription_status") == "active")

    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token: missing user ID.")

    return {
        "user_id": user_id,
        "email": email,
        "is_pro": is_pro,
        "payload": payload
    }


def get_user_credit_balance(user_id: str) -> int:
    """Calculates remaining free daily credits out of 50 based on operations in the last 24h."""
    now = time.time()
    day_seconds = 86400
    user_daily_generations[user_id] = [
        t for t in user_daily_generations[user_id] if now - t < day_seconds
    ]
    user_daily_image_generations[user_id] = [
        t for t in user_daily_image_generations[user_id] if now - t < day_seconds
    ]
    used_video_credits = len(user_daily_generations[user_id]) * settings.VIDEO_CREDIT_COST
    used_image_credits = len(user_daily_image_generations[user_id]) * settings.IMAGE_CREDIT_COST
    remaining = max(0, settings.FREE_DAILY_CREDITS - (used_video_credits + used_image_credits))
    return remaining

def check_daily_quota(user: dict = Depends(get_current_user)):
    """
    Enforces the Free Tier quota: 50 daily credits, 15 credits per video.
    Pro users bypass this limit.
    """
    if user.get("is_pro"):
        return user

    user_id = user["user_id"]
    remaining = get_user_credit_balance(user_id)
    if remaining < settings.VIDEO_CREDIT_COST:
        raise HTTPException(
            status_code=429,
            detail=f"Insufficient daily credits. A video generation costs {settings.VIDEO_CREDIT_COST} credits, but you have {remaining} remaining out of {settings.FREE_DAILY_CREDITS} daily credits. Please wait for the 24h reset or upgrade to Botock Pro."
        )

    # Record this generation attempt timestamp
    user_daily_generations[user_id].append(time.time())
    return user


user_daily_image_generations = defaultdict(list)

def check_daily_image_quota(user: dict = Depends(get_current_user)):
    """
    Enforces the Free Tier photo quota.
    Subscribers / Pro users get UNLIMITED photo generations without any quota deduction!
    """
    if user.get("is_pro"):
        # Subscribers have UNLIMITED photo generations!
        return user

    from app.routers.auth_otp import get_platform_settings
    dynamic_quotas = get_platform_settings().get("quotas", {})
    daily_limit = int(dynamic_quotas.get("free_daily_photos", settings.FREE_DAILY_IMAGE_LIMIT))

    user_id = user["user_id"]
    now = time.time()
    day_seconds = 86400

    user_daily_image_generations[user_id] = [
        t for t in user_daily_image_generations[user_id] if now - t < day_seconds
    ]

    used_count = len(user_daily_image_generations[user_id])
    if used_count >= daily_limit:
        raise HTTPException(
            status_code=429,
            detail=f"Daily free image limit reached ({daily_limit} images/day). Please upgrade to Botock Pro for unlimited generations."
        )

    user_daily_image_generations[user_id].append(now)
    return user
