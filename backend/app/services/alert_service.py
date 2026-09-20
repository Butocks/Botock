import logging
import aiohttp
from app.config import settings

logger = logging.getLogger(__name__)

async def send_breakage_alert(error_msg: str, screenshot_path: str = ""):
    """
    Sends an instant webhook alert (Discord/Slack) when Google Flow DOM changes
    or Playwright automation fails.
    """
    webhook_url = settings.ALERT_WEBHOOK_URL
    if not webhook_url:
        logger.warning(f"[UI BREAKAGE DETECTED] {error_msg} (No ALERT_WEBHOOK_URL configured)")
        return

    payload = {
        "content": f"🚨 **[Botock Alert] Flow AI UI Breakage Detected!**\n"
                   f"**Error**: `{error_msg}`\n"
                   f"**Screenshot**: `{screenshot_path}`\n"
                   f"Immediate attention required to update Playwright selectors."
    }

    try:
        async with aiohttp.ClientSession() as session:
            async with session.post(webhook_url, json=payload, timeout=5) as resp:
                if resp.status in (200, 204):
                    logger.info("Successfully dispatched breakage alert webhook.")
                else:
                    logger.error(f"Webhook responded with status {resp.status}")
    except Exception as e:
        logger.error(f"Failed to dispatch breakage alert webhook: {e}")
