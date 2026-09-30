"""Authentication and database-backed credit accounting.

Credits are security-sensitive money-like state: never keep them in a local
file or in process memory. Every mutation below is one Postgres transaction,
so it remains correct across Azure restarts and multiple replicas.
"""

import base64
import logging
from typing import Any, Optional

import httpx
import jwt
from fastapi import Depends, Header, HTTPException

from app.config import settings

logger = logging.getLogger(__name__)


def get_current_user(authorization: Optional[str] = Header(None)) -> dict:
    """Verify a Supabase access token without ever accepting URL tokens."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Authentication required.")
    token = authorization.removeprefix("Bearer ").strip()
    if not token or " " in token:
        raise HTTPException(status_code=401, detail="Invalid Authorization header.")

    issuer = f"{settings.SUPABASE_URL.rstrip('/')}/auth/v1"
    payload: Optional[dict[str, Any]] = None
    if settings.SUPABASE_JWT_SECRET:
        candidate_keys: list[str | bytes] = [settings.SUPABASE_JWT_SECRET]
        try:
            candidate_keys.append(base64.b64decode(settings.SUPABASE_JWT_SECRET, validate=True))
        except Exception:
            pass
        for key in candidate_keys:
            try:
                payload = jwt.decode(
                    token, key, algorithms=["HS256"], audience="authenticated",
                    issuer=issuer, options={"require": ["exp", "sub"]},
                )
                break
            except jwt.PyJWTError:
                continue

    # Newer Supabase projects use asymmetric keys. Supabase verifies these
    # server-side; this never uses an embedded service key or an unsigned JWT.
    if payload is None and settings.SUPABASE_URL and settings.SUPABASE_ANON_KEY:
        try:
            response = httpx.get(
                f"{settings.SUPABASE_URL.rstrip('/')}/auth/v1/user",
                headers={"Authorization": f"Bearer {token}", "apikey": settings.SUPABASE_ANON_KEY},
                timeout=5.0,
            )
            if response.status_code == 200:
                user_data = response.json()
                payload = {
                    "sub": user_data.get("id"), "email": user_data.get("email", ""),
                    "role": user_data.get("role", "authenticated"),
                    "app_metadata": user_data.get("app_metadata") or {},
                }
        except httpx.HTTPError:
            logger.warning("Supabase token verification request failed")

    if not payload or not payload.get("sub"):
        raise HTTPException(status_code=401, detail="Invalid or expired authentication token.")
    metadata = payload.get("app_metadata") or {}
    is_pro = bool(metadata.get("is_pro") or metadata.get("subscription_status") == "active" or payload.get("role") == "pro")
    return {"user_id": payload["sub"], "email": payload.get("email", ""), "is_pro": is_pro, "payload": payload}


def _service_headers() -> dict[str, str]:
    if not settings.SUPABASE_URL or not settings.SUPABASE_SERVICE_ROLE_KEY:
        logger.error("Supabase credit database is not configured")
        raise HTTPException(status_code=503, detail="Credit service is temporarily unavailable.")
    return {
        "apikey": settings.SUPABASE_SERVICE_ROLE_KEY,
        "Authorization": f"Bearer {settings.SUPABASE_SERVICE_ROLE_KEY}",
        "Content-Type": "application/json",
    }


async def _rpc(name: str, payload: dict[str, Any]) -> Any:
    """Call a private database function and avoid exposing provider errors."""
    try:
        async with httpx.AsyncClient(timeout=8.0) as client:
            response = await client.post(
                f"{settings.SUPABASE_URL.rstrip('/')}/rest/v1/rpc/{name}",
                headers=_service_headers(), json=payload,
            )
    except httpx.HTTPError as exc:
        logger.error("Credit database RPC %s failed: %s", name, type(exc).__name__)
        raise HTTPException(status_code=503, detail="Credit service is temporarily unavailable.") from exc

    if response.status_code >= 400:
        if "insufficient credits" in response.text or "image quota reached" in response.text:
            raise HTTPException(status_code=429, detail="Your daily generation limit has been reached.")
        logger.error("Credit database RPC %s returned %s", name, response.status_code)
        raise HTTPException(status_code=503, detail="Credit service is temporarily unavailable.")
    return response.json()


async def add_user_reward(user_id: str, tool_id: str, amount: int, daily_limit: int, cooldown_seconds: int = 86400) -> dict:
    return await _rpc("claim_tool_reward", {
        "p_user_id": user_id, "p_tool_id": tool_id, "p_amount": amount,
        "p_cooldown_seconds": cooldown_seconds, "p_daily_limit": daily_limit,
    })


async def get_user_active_rewards(user_id: str) -> list[dict]:
    return await _rpc("get_active_user_rewards", {"p_user_id": user_id})


async def get_user_credit_balance(user_id: str, daily_limit: int) -> int:
    return int(await _rpc("get_user_credit_balance", {"p_user_id": user_id, "p_daily_limit": daily_limit}))


async def atomic_deduct_video_credit(user_id: str, cost: int, daily_limit: int) -> int:
    return int(await _rpc("consume_video_credits", {
        "p_user_id": user_id, "p_cost": cost, "p_daily_limit": daily_limit,
    }))


async def reserve_video_credit(user_id: str, generation_id: str, cost: int, daily_limit: int) -> int:
    """Charge a generation exactly once, keyed by its immutable job UUID."""
    return int(await _rpc("reserve_video_credit", {
        "p_user_id": user_id, "p_generation_id": generation_id,
        "p_cost": cost, "p_daily_limit": daily_limit,
    }))


async def refund_video_credit(user_id: str, generation_id: str) -> bool:
    """Refund is idempotent, so retries after a worker/control-plane crash are safe."""
    return bool(await _rpc("refund_video_credit", {
        "p_user_id": user_id, "p_generation_id": generation_id,
    }))


async def check_daily_image_quota(user: dict = Depends(get_current_user)) -> dict:
    if user.get("is_pro"):
        return user
    from app.routers.auth_otp import get_platform_settings
    quotas = get_platform_settings().get("quotas", {})
    limit = int(quotas.get("free_daily_photos", settings.FREE_DAILY_IMAGE_LIMIT))
    await _rpc("consume_image_quota", {
        "p_user_id": user["user_id"], "p_daily_limit": limit,
        "p_cost": int(settings.IMAGE_CREDIT_COST),
    })
    return user
