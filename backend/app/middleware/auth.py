import asyncio
import time
import logging
from typing import Optional
from collections import defaultdict
from fastapi import Header, HTTPException, Depends
import jwt
from app.config import settings

logger = logging.getLogger(__name__)

# In-memory daily quota store: user_id -> [timestamps of generations today]
user_daily_generations = defaultdict(list)

def get_current_user(
    authorization: Optional[str] = Header(None),
) -> dict:
    """
    FastAPI dependency to verify Supabase JWT token.
    Enforces strict signature verification — unauthenticated or forged tokens receive 401.
    Only accepts an Authorization: Bearer token header. Query-string tokens are
    deliberately rejected because URLs are routinely retained in browser,
    proxy, and analytics logs.
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
    expected_issuer = f"{settings.SUPABASE_URL.rstrip('/')}/auth/v1"

    # Try 1: Fast Local Decode with HS256 (raw secret)
    try:
        payload = jwt.decode(
            jwt_token,
            settings.SUPABASE_JWT_SECRET,
            algorithms=["HS256"],
            options={"verify_exp": True, "verify_aud": False, "verify_iss": False}
        )
    except Exception as e1:
        pass

    # Try 2: Fast Local Decode with base64 decoded secret
    if not payload:
        try:
            import base64
            b64_secret = base64.b64decode(settings.SUPABASE_JWT_SECRET)
            payload = jwt.decode(
                jwt_token,
                b64_secret,
                algorithms=["HS256"],
                options={"verify_exp": True, "verify_aud": False, "verify_iss": False}
            )
        except Exception as e2:
            pass

    # Try 3: Supabase new JWT Signing Keys (Verify directly with Supabase Auth API)
    if not payload and settings.SUPABASE_URL:
        try:
            import urllib.request
            req = urllib.request.Request(
                f"{settings.SUPABASE_URL.rstrip('/')}/auth/v1/user",
                headers={
                    "Authorization": f"Bearer {jwt_token}",
                    "apikey": settings.SUPABASE_JWT_SECRET or settings.SECRET_KEY or "",
                },
            )
            # If service role key is present in settings, use it for apikey header
            service_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_KEY")
            if service_key:
                req.headers["apikey"] = service_key

            with urllib.request.urlopen(req, timeout=5) as resp:
                if resp.status == 200:
                    import json
                    user_data = json.loads(resp.read().decode())
                    payload = {
                        "sub": user_data.get("id"),
                        "id": user_data.get("id"),
                        "email": user_data.get("email"),
                        "role": user_data.get("role", "authenticated"),
                        "app_metadata": user_data.get("app_metadata", {}),
                        "user_metadata": user_data.get("user_metadata", {}),
                    }
        except Exception as e3:
            logger.warning(f"Supabase auth/v1/user check failed: {e3}")

    # If all 3 failed, token is truly invalid
    if not payload:
        logger.warning("JWT verification failed against both local secrets and Supabase auth endpoint.")
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
import fcntl

LEDGER_FILE = os.path.join(os.path.dirname(settings.SESSION_PATH) or "session", "user_credits_ledger.json")

def _with_ledger_lock():
    """Context manager providing OS-level atomic file locking across multiple uvicorn workers and processes."""
    os.makedirs(os.path.dirname(LEDGER_FILE) or "session", exist_ok=True)
    lock_path = LEDGER_FILE + ".lock"
    lock_fd = os.open(lock_path, os.O_CREAT | os.O_RDWR, 0o600)
    fcntl.flock(lock_fd, fcntl.LOCK_EX)
    try:
        data = {}
        if os.path.exists(LEDGER_FILE):
            try:
                with open(LEDGER_FILE, "r") as f:
                    data = json.load(f)
            except Exception:
                data = {}
        return data, lock_fd
    except Exception:
        fcntl.flock(lock_fd, fcntl.LOCK_UN)
        os.close(lock_fd)
        raise

def _save_and_unlock_ledger(data: dict, lock_fd: int):
    try:
        temp_file = LEDGER_FILE + ".tmp"
        with open(temp_file, "w") as f:
            json.dump(data, f)
        os.replace(temp_file, LEDGER_FILE)
    finally:
        fcntl.flock(lock_fd, fcntl.LOCK_UN)
        os.close(lock_fd)

def add_user_reward(user_id: str, tool_id: str, amount: int, cooldown_seconds: int = 86400) -> dict:
    """Awards credit points to user with 24-hour expiration atomically, enforcing persistent multi-worker cooldown."""
    now = time.time()
    expires_at = now + 86400  # 24 hours
    
    data, lock_fd = _with_ledger_lock()
    try:
        user_data = data.setdefault(user_id, {"rewards": [], "video_gens": [], "image_gens": [], "tool_claims": {}})
        tool_claims = user_data.setdefault("tool_claims", {})
        
        last_claimed = tool_claims.get(tool_id, 0)
        elapsed = now - last_claimed
        if elapsed < cooldown_seconds:
            remaining_wait = int(cooldown_seconds - elapsed)
            _save_and_unlock_ledger(data, lock_fd)
            return {
                "success": False,
                "cooldown": True,
                "remaining_seconds": remaining_wait,
                "message": f"Reward cooldown active. Try again in {remaining_wait}s.",
            }

        valid_rewards = [r for r in user_data.get("rewards", []) if r.get("expires_at", 0) > now]
        reward_item = {
            "tool_id": tool_id,
            "amount": amount,
            "earned_at": now,
            "expires_at": expires_at,
        }
        valid_rewards.append(reward_item)
        user_data["rewards"] = valid_rewards
        tool_claims[tool_id] = now
        _save_and_unlock_ledger(data, lock_fd)
    except Exception:
        fcntl.flock(lock_fd, fcntl.LOCK_UN)
        os.close(lock_fd)
        raise
    
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
    data, lock_fd = _with_ledger_lock()
    try:
        user_data = data.get(user_id, {})
        rewards = [r for r in user_data.get("rewards", []) if r.get("expires_at", 0) > now]
        return rewards
    finally:
        fcntl.flock(lock_fd, fcntl.LOCK_UN)
        os.close(lock_fd)

def get_user_credit_balance(user_id: str) -> int:
    """Calculates remaining daily credits safely across processes."""
    from app.routers.auth_otp import get_platform_settings
    quotas = get_platform_settings().get("quotas", {})
    daily_credits = int(quotas.get("free_daily_credits", settings.FREE_DAILY_CREDITS))
    
    now = time.time()
    day_seconds = 86400

    data, lock_fd = _with_ledger_lock()
    try:
        user_data = data.setdefault(user_id, {"rewards": [], "video_gens": [], "image_gens": []})
        valid_rewards = [r for r in user_data.get("rewards", []) if r.get("expires_at", 0) > now]
        user_data["rewards"] = valid_rewards
        total_reward_credits = sum(r.get("amount", 0) for r in valid_rewards)

        valid_video_gens = [g for g in user_data.get("video_gens", []) if now - g.get("time", 0) < day_seconds]
        user_data["video_gens"] = valid_video_gens
        used_video_credits = sum(g.get("cost", settings.VIDEO_CREDIT_COST) for g in valid_video_gens)

        valid_image_gens = [t for t in user_data.get("image_gens", []) if now - t < day_seconds]
        user_data["image_gens"] = valid_image_gens
        used_image_credits = len(valid_image_gens) * settings.IMAGE_CREDIT_COST

        remaining = max(0, (daily_credits + total_reward_credits) - (used_video_credits + used_image_credits))
        _save_and_unlock_ledger(data, lock_fd)
        return remaining
    except Exception:
        fcntl.flock(lock_fd, fcntl.LOCK_UN)
        os.close(lock_fd)
        raise

def atomic_deduct_video_credit(user_id: str, cost: int) -> int:
    """
    CRITICAL SECURITY FIX:
    Performs true ATOMIC check-and-deduct protected by an OS-level file lock.
    Safe against parallel race conditions across multiple Uvicorn workers and replicas.
    Raises HTTPException(429) if balance is insufficient.
    Returns the new balance.
    """
    from app.routers.auth_otp import get_platform_settings
    quotas = get_platform_settings().get("quotas", {})
    daily_credits = int(quotas.get("free_daily_credits", settings.FREE_DAILY_CREDITS))
    
    now = time.time()
    day_seconds = 86400

    data, lock_fd = _with_ledger_lock()
    try:
        user_data = data.setdefault(user_id, {"rewards": [], "video_gens": [], "image_gens": []})
        valid_rewards = [r for r in user_data.get("rewards", []) if r.get("expires_at", 0) > now]
        user_data["rewards"] = valid_rewards
        total_reward_credits = sum(r.get("amount", 0) for r in valid_rewards)

        valid_video_gens = [g for g in user_data.get("video_gens", []) if now - g.get("time", 0) < day_seconds]
        user_data["video_gens"] = valid_video_gens
        used_video_credits = sum(g.get("cost", settings.VIDEO_CREDIT_COST) for g in valid_video_gens)

        valid_image_gens = [t for t in user_data.get("image_gens", []) if now - t < day_seconds]
        user_data["image_gens"] = valid_image_gens
        used_image_credits = len(valid_image_gens) * settings.IMAGE_CREDIT_COST

        current_balance = max(0, (daily_credits + total_reward_credits) - (used_video_credits + used_image_credits))
        
        if current_balance < cost:
            _save_and_unlock_ledger(data, lock_fd)
            raise HTTPException(
                status_code=429,
                detail=f"Insufficient daily credits. Generating costs {cost} credits, but you have {current_balance} remaining. Please wait for the 24h reset or upgrade to Botock Pro."
            )

        # Atomic commit deduction
        user_data["video_gens"].append({"time": now, "cost": cost})
        new_balance = current_balance - cost
        _save_and_unlock_ledger(data, lock_fd)
        return new_balance
    except HTTPException:
        raise
    except Exception as e:
        fcntl.flock(lock_fd, fcntl.LOCK_UN)
        os.close(lock_fd)
        raise HTTPException(status_code=500, detail=f"Credit deduction failed: {e}")

def deduct_video_credit(user_id: str, cost: int):
    """Backward compatibility wrapper."""
    atomic_deduct_video_credit(user_id, cost)

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

    data, lock_fd = _with_ledger_lock()
    try:
        user_data = data.setdefault(user_id, {"rewards": [], "video_gens": [], "image_gens": [], "tool_claims": {}})
        image_gens = [t for t in user_data.get("image_gens", []) if now - t < day_seconds]
        if len(image_gens) >= daily_limit:
            _save_and_unlock_ledger(data, lock_fd)
            raise HTTPException(
                status_code=429,
                detail=f"Daily free image limit reached ({daily_limit} images/day). Please upgrade to Botock Pro for unlimited generations."
            )
        # Persist the consumption in the same ledger used by the credit balance.
        # This prevents restarts and multiple workers from resetting image quota.
        image_gens.append(now)
        user_data["image_gens"] = image_gens
        _save_and_unlock_ledger(data, lock_fd)
    except HTTPException:
        raise
    except Exception:
        fcntl.flock(lock_fd, fcntl.LOCK_UN)
        os.close(lock_fd)
        raise HTTPException(status_code=500, detail="Image quota check failed.")
    return user

_user_locks = defaultdict(asyncio.Lock)
