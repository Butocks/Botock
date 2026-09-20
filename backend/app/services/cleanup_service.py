import os
import time
import logging
from app.config import settings

logger = logging.getLogger(__name__)

def purge_expired_videos(max_age_hours: int = None) -> int:
    """
    Purges local video/debug files older than the retention threshold.
    Default: 24 hours for free users.
    Returns the number of deleted files.
    """
    if max_age_hours is None:
        max_age_hours = settings.FREE_RETENTION_HOURS

    now = time.time()
    max_age_seconds = max_age_hours * 3600
    deleted_count = 0

    target_dirs = [settings.VIDEOS_DIR, settings.IMAGES_DIR, settings.DEBUG_DIR]

    for d in target_dirs:
        if not os.path.exists(d):
            continue

        for filename in os.listdir(d):
            file_path = os.path.join(d, filename)
            if not os.path.isfile(file_path):
                continue

            try:
                mtime = os.path.getmtime(file_path)
                age = now - mtime
                if age > max_age_seconds:
                    os.remove(file_path)
                    deleted_count += 1
                    logger.info(f"[CLEANUP] Deleted expired file ({age/3600:.1f}h old): {filename}")
            except Exception as e:
                logger.error(f"[CLEANUP] Could not delete {filename}: {e}")

    logger.info(f"[CLEANUP] Sweep complete. Purged {deleted_count} expired files.")
    return deleted_count

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    print("Running Botock 24-hour cleanup sweep...")
    count = purge_expired_videos()
    print(f"Purged {count} expired files.")
