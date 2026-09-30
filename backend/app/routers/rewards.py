import time
import logging
from datetime import datetime
from collections import defaultdict
from typing import Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel

from app.middleware.auth import (
    get_current_user,
    add_user_reward,
    get_user_active_rewards,
    get_user_credit_balance,
)
from app.routers.auth_otp import get_platform_settings

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/user", tags=["Rewards"])

# In-memory cooldown tracker: (user_id, tool_id) -> last_awarded_timestamp
# Prevents automated spam/farming of reward credits on tools
user_tool_cooldowns: Dict[str, float] = {}
COOLDOWN_SECONDS = 86400  # 5 minutes per tool per user


class ClaimRewardRequest(BaseModel):
    tool_id: str


@router.post("/claim-tool-reward")
async def claim_tool_reward(
    req: ClaimRewardRequest,
    request: Request,
    user: dict = Depends(get_current_user),
):
    """
    Awards credit points to the user for executing a qualifying creative tool.
    Credits expire exactly 24 hours after being awarded.
    Includes anti-spam cooldown to prevent bot abuse.
    """
    user_id = user["user_id"]
    tool_id = req.tool_id.strip().lower()

    # 1. Check Platform Settings for this tool's reward configuration
    cfg = get_platform_settings()
    tool_rewards = cfg.get("tool_rewards", {})

    tool_cfg = tool_rewards.get(tool_id)
    if not tool_cfg or not tool_cfg.get("enabled", False):
        return {
            "success": False,
            "message": f"Tool '{tool_id}' is not currently configured for usage rewards.",
            "earned_credits": 0,
            "current_balance": await get_user_credit_balance(user_id, int(cfg.get("quotas", {}).get("free_daily_credits", 50))),
        }

    reward_amount = int(tool_cfg.get("credits", 0))
    if reward_amount <= 0:
        return {
            "success": False,
            "message": "No credit reward configured for this tool.",
            "earned_credits": 0,
            "current_balance": await get_user_credit_balance(user_id, int(cfg.get("quotas", {}).get("free_daily_credits", 50))),
        }

    # 2 & 3. Award the credits with persistent 24-hour multi-worker cooldown enforcement
    reward_result = await add_user_reward(
        user_id, tool_id, reward_amount,
        int(cfg.get("quotas", {}).get("free_daily_credits", 50)),
        cooldown_seconds=COOLDOWN_SECONDS,
    )
    
    if reward_result.get("cooldown"):
        return {
            "success": False,
            "cooldown": True,
            "message": reward_result.get("message", f"Reward cooldown active for '{tool_id}'."),
            "earned_credits": 0,
            "current_balance": await get_user_credit_balance(user_id, int(cfg.get("quotas", {}).get("free_daily_credits", 50))),
        }

    logger.info(
        f"🎁 Awarded {reward_amount} credits to user {user_id} for tool '{tool_id}'. "
        f"Expires in 24h. New balance: {reward_result.get('new_balance')}"
    )

    return {
        "success": True,
        "tool_id": tool_id,
        "tool_name": tool_cfg.get("name", tool_id),
        "earned_credits": reward_amount,
        "expires_at": reward_result["expires_at"],
        "expires_in_hours": 24,
        "new_balance": reward_result["new_balance"],
        "message": f"🎉 Earned +{reward_amount} AI Credits for using {tool_cfg.get('name', tool_id)}! Valid for 24h.",
    }


@router.get("/active-rewards")
async def get_active_rewards(user: dict = Depends(get_current_user)):
    """Returns the user's active earned rewards and their remaining 24h expiration countdown."""
    user_id = user["user_id"]
    active = await get_user_active_rewards(user_id)
    now = time.time()

    formatted = []
    total_active_reward_credits = 0
    for r in active:
        expires_at = r.get("expires_at")
        if isinstance(expires_at, str):
            expires_at = datetime.fromisoformat(expires_at.replace("Z", "+00:00")).timestamp()
        remaining_secs = max(0, int((expires_at or 0) - now))
        total_active_reward_credits += r.get("amount", 0)
        formatted.append({
            "tool_id": r.get("tool_id"),
            "amount": r.get("amount"),
            "earned_at": r.get("earned_at"),
            "expires_at": expires_at,
            "seconds_remaining": remaining_secs,
            "hours_remaining": round(remaining_secs / 3600, 1),
        })

    return {
        "total_active_reward_credits": total_active_reward_credits,
        "rewards": formatted,
        "current_total_balance": await get_user_credit_balance(user_id, int(get_platform_settings().get("quotas", {}).get("free_daily_credits", 50))),
    }
