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

def record_video_generation():
    """Increment video generation counters for today, this month, and all time."""
    now = datetime.utcnow()
    today_key = now.strftime("%Y-%m-%d")
    month_key = now.strftime("%Y-%m")
    
    stats = _read_stats()
    
    stats.setdefault("daily", {})
    stats.setdefault("monthly", {})
    stats.setdefault("all_time", 0)
    
    stats["daily"].setdefault(today_key, 0)
    stats["monthly"].setdefault(month_key, 0)
    
    stats["daily"][today_key] += 1
    stats["monthly"][month_key] += 1
    stats["all_time"] += 1
    
    _write_stats(stats)

def get_video_stats() -> dict:
    """Get video generation statistics."""
    now = datetime.utcnow()
    today_key = now.strftime("%Y-%m-%d")
    month_key = now.strftime("%Y-%m")
    
    stats = _read_stats()
    
    today_total = stats.get("daily", {}).get(today_key, 0)
    month_total = stats.get("monthly", {}).get(month_key, 0)
    all_time = stats.get("all_time", 0)
    
    return {
        "today": today_total,
        "this_month": month_total,
        "all_time": all_time
    }
