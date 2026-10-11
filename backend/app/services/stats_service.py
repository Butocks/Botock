import os
import json
import time
import fcntl
import logging
from datetime import datetime
from app.config import settings

logger = logging.getLogger(__name__)

STATS_FILE = os.path.join(os.path.dirname(settings.SESSION_PATH) or "session", "video_stats.json")

def _read_stats() -> dict:
    if not os.path.exists(STATS_FILE):
        return {}
    try:
        with open(STATS_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        logger.error(f"Failed to read stats file: {e}")
        return {}

def _write_stats(data: dict):
    try:
        os.makedirs(os.path.dirname(STATS_FILE) or ".", exist_ok=True)
        temp_path = f"{STATS_FILE}.tmp"
        with open(temp_path, "w", encoding="utf-8") as f:
            fcntl.flock(f, fcntl.LOCK_EX)
            json.dump(data, f)
            f.flush()
            os.fsync(f.fileno())
            fcntl.flock(f, fcntl.LOCK_UN)
        os.replace(temp_path, STATS_FILE)
    except Exception as e:
        logger.error(f"Failed to write stats file: {e}")

def record_video_generation(is_guest: bool = False, duration: int = 4, user_key: str = None):
    """
    Increment video and Google Flow credit counters:
    - Guest (4s) = 4 Flow credits
    - User (8s)  = 6 Flow credits
    """
    now = datetime.utcnow()
    today_key = now.strftime("%Y-%m-%d")
    month_key = now.strftime("%Y-%m")
    
    # Calculation rule: Guest 4s = 4 credits, User 8s = 6 credits
    credits_cost = 4 if is_guest else (6 if duration >= 8 else 4)
    
    stats = _read_stats()
    
    stats.setdefault("daily", {})
    stats.setdefault("monthly", {})
    stats.setdefault("daily_flow_credits", {})
    stats.setdefault("monthly_flow_credits", {})
    stats.setdefault("user_daily_videos", {})
    stats.setdefault("user_monthly_videos", {})
    stats.setdefault("user_totals", {})
    stats.setdefault("all_time", 0)
    stats.setdefault("all_time_flow_credits", 0)
    
    stats["daily"][today_key] = stats["daily"].get(today_key, 0) + 1
    stats["monthly"][month_key] = stats["monthly"].get(month_key, 0) + 1
    stats["all_time"] = stats.get("all_time", 0) + 1
    
    stats["daily_flow_credits"][today_key] = stats["daily_flow_credits"].get(today_key, 0) + credits_cost
    stats["monthly_flow_credits"][month_key] = stats["monthly_flow_credits"].get(month_key, 0) + credits_cost
    stats["all_time_flow_credits"] = stats.get("all_time_flow_credits", 0) + credits_cost
    
    if user_key:
        stats["user_daily_videos"].setdefault(today_key, {})
        stats["user_daily_videos"][today_key][user_key] = stats["user_daily_videos"][today_key].get(user_key, 0) + 1
        
        stats["user_monthly_videos"].setdefault(month_key, {})
        stats["user_monthly_videos"][month_key][user_key] = stats["user_monthly_videos"][month_key].get(user_key, 0) + 1
        
        stats["user_totals"][user_key] = stats["user_totals"].get(user_key, 0) + 1
        
    _write_stats(stats)

def get_video_stats() -> dict:
    """Get video and Flow credit statistics."""
    now = datetime.utcnow()
    today_key = now.strftime("%Y-%m-%d")
    month_key = now.strftime("%Y-%m")
    
    stats = _read_stats()
    
    today_total = stats.get("daily", {}).get(today_key, 0)
    month_total = stats.get("monthly", {}).get(month_key, 0)
    all_time = stats.get("all_time", 0)
    
    today_credits = stats.get("daily_flow_credits", {}).get(today_key, 0)
    month_credits = stats.get("monthly_flow_credits", {}).get(month_key, 0)
    all_time_credits = stats.get("all_time_flow_credits", 0)
    
    return {
        "today": today_total,
        "this_month": month_total,
        "all_time": all_time,
        "today_flow_credits": today_credits,
        "this_month_flow_credits": month_credits,
        "all_time_flow_credits": all_time_credits,
        "user_daily": stats.get("user_daily_videos", {}).get(today_key, {}),
        "user_monthly": stats.get("user_monthly_videos", {}).get(month_key, {}),
        "user_totals": stats.get("user_totals", {})
    }
