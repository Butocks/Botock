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


import os
import json

REWARDS_FILE = os.path.join(os.path.dirname(settings.SESSION_PATH) or "session", "user_rewards.json")

def _load_rewards() -> dict:
    if os.path.exists(REWARDS_FILE):
        try:
            with open(REWARDS_FILE, "r") as f:
                return json.load(f)
        except Exception:
            return {}
    return {}

def _save_rewards(data: dict):
    try:
        os.makedirs(os.path.dirname(REWARDS_FILE), exist_ok=True)
        with open(REWARDS_FILE, "w") as f:
            json.dump(data, f)
    except Exception as e:
        logger.error(f"Failed to persist rewards: {e}")

def add_user_reward(user_id: str, tool_id: str, amount: int) -> dict:
    """Awards credit points to user with 24-hour expiration."""
    now = time.time()
    expires_at = now + 86400  # 24 hours
    rewards_db = _load_rewards()
    if user_id not in rewards_db:
        rewards_db[user_id] = []
    
    # Filter expired
    rewards_db[user_id] = [r for r in rewards_db[user_id] if r.get("expires_at", 0) > now]
    
    reward_item = {
        "tool_id": tool_id,
        "amount": amount,
        "earned_at": now,
        "expires_at": expires_at,
    }
    rewards_db[user_id].append(reward_item)
    _save_rewards(rewards_db)
    
    balance = get_user_credit_balance(user_id)
    return {
        "amount": amount,
        "tool_id": tool_id,
        "expires_at": expires_at,
        "expires_in_hours": 24,
        "new_balance": balance,
    }

def get_user_active_rewards(user_id: str) -> list:
    """Returns active, unexpired rewards for a user."""
    now = time.time()
    rewards_db = _load_rewards()
    user_rewards = rewards_db.get(user_id, [])
    return [r for r in user_rewards if r.get("expires_at", 0) > now]

def get_user_credit_balance(user_id: str) -> int:
    """Calculates remaining free daily credits based on operations in the last 24h + active reward credits earned in last 24h."""
    from app.routers.auth_otp import get_platform_settings
    quotas = get_platform_settings().get("quotas", {})
    daily_credits = int(quotas.get("free_daily_credits", settings.FREE_DAILY_CREDITS))
    
    now = time.time()
    day_seconds = 86400
    
    # Calculate active rewards (earned in last 24h)
    rewards_db = _load_rewards()
    user_rewards = rewards_db.get(user_id, [])
    valid_rewards = [r for r in user_rewards if r.get("expires_at", 0) > now]
    if len(valid_rewards) != len(user_rewards):
        rewards_db[user_id] = valid_rewards
        _save_rewards(rewards_db)
    
    total_reward_credits = sum(r.get("amount", 0) for r in valid_rewards)
    
    # user_daily_generations[user_id] now stores dicts: {"time": t, "cost": c}
    # For backward compatibility, handle if it's just a float (timestamp)
    valid_video_gens = []
    used_video_credits = 0
    for gen in user_daily_generations[user_id]:
        if isinstance(gen, dict):
            if now - gen["time"] < day_seconds:
                valid_video_gens.append(gen)
                used_video_credits += gen.get("cost", settings.VIDEO_CREDIT_COST)
        else:
            if now - gen < day_seconds:
                valid_video_gens.append({"time": gen, "cost": settings.VIDEO_CREDIT_COST})
                used_video_credits += settings.VIDEO_CREDIT_COST
                
    user_daily_generations[user_id] = valid_video_gens

    user_daily_image_generations[user_id] = [
        t for t in user_daily_image_generations[user_id] if now - t < day_seconds
    ]
    used_image_credits = len(user_daily_image_generations[user_id]) * settings.IMAGE_CREDIT_COST
    
    remaining = max(0, (daily_credits + total_reward_credits) - (used_video_credits + used_image_credits))
    return remaining

def deduct_video_credit(user_id: str, cost: int):
    """Manually deduct credits after checking if balance is sufficient."""
    user_daily_generations[user_id].append({"time": time.time(), "cost": cost})

def check_daily_quota(user: dict = Depends(get_current_user)):
    """
    Legacy dependency. Do not use for new dynamic routes. Use deduct_video_credit manually.
    """
    if user.get("is_pro"):
        return user

    user_id = user["user_id"]
    remaining = get_user_credit_balance(user_id)
    if remaining < settings.VIDEO_CREDIT_COST:
        raise HTTPException(
            status_code=429,
            detail=f"Insufficient daily credits. A video generation costs {settings.VIDEO_CREDIT_COST} credits, but you have {remaining} remaining. Please wait for the 24h reset or upgrade to Botock Pro."
        )

    # Record this generation attempt timestamp
    deduct_video_credit(user_id, settings.VIDEO_CREDIT_COST)
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
