"""
Google Auto-Login Service for Flow AI.

This service handles automated Google account login using Playwright.
It manages session creation, validation, and auto-refresh so that
the hosted server never needs manual browser login.
"""

import os
import json
import time
import asyncio
import logging
from playwright.async_api import async_playwright, TimeoutError as PlaywrightTimeoutError
from app.config import settings

logger = logging.getLogger(__name__)

# Lock to prevent multiple simultaneous login attempts
_login_lock = asyncio.Lock()


def is_session_fresh() -> bool:
    """Check if saved session file exists and is not too old."""
    if not os.path.exists(settings.SESSION_PATH):
        return False

    file_age_seconds = time.time() - os.path.getmtime(settings.SESSION_PATH)
    max_age_seconds = settings.SESSION_MAX_AGE_HOURS * 3600

    if file_age_seconds > max_age_seconds:
        logger.info(f"Session file is {file_age_seconds/3600:.1f}h old (max {settings.SESSION_MAX_AGE_HOURS}h). Needs refresh.")
        return False

    # Also verify file is valid JSON
    try:
        with open(settings.SESSION_PATH, "r") as f:
            data = json.load(f)
        if not data.get("cookies"):
            logger.warning("Session file has no cookies. Needs refresh.")
            return False
    except (json.JSONDecodeError, KeyError):
        logger.warning("Session file is corrupted. Needs refresh.")
        return False

    return True


async def auto_login_google() -> bool:
    """
    Automatically log into Google account and save session for Flow AI.
    Uses GOOGLE_EMAIL and GOOGLE_PASSWORD from environment variables.
    Returns True on success, False on failure.
    """
    async with _login_lock:
        if is_session_fresh():
            logger.info("Session is already fresh and valid. Skipping login.")
            return True

        if not settings.GOOGLE_EMAIL or not settings.GOOGLE_PASSWORD:
            logger.error(
                "GOOGLE_EMAIL and GOOGLE_PASSWORD must be set in .env file. "
                "Cannot auto-login without credentials."
            )
            return False

        email = settings.GOOGLE_EMAIL.strip()
        # Password might contain spaces if it's a 16-char app password (e.g. "abcd efgh ijkl mnop")
        password = settings.GOOGLE_PASSWORD.strip()

        logger.info(f"Starting automated Google login for {email}...")

        try:
            async with async_playwright() as p:
                browser = await p.chromium.launch(
                    headless=True,
                    args=[
                        "--no-sandbox",
                        "--disable-setuid-sandbox",
                        "--disable-blink-features=AutomationControlled",
                        "--disable-dev-shm-usage",
                        "--disable-infobars",
                    ]
                )

                # Create context with realistic browser fingerprint
                context = await browser.new_context(
                    user_agent=(
                        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 "
                        "(KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36"
                    ),
                    viewport={"width": 1920, "height": 1080},
                    locale="en-US",
                    timezone_id="America/New_York",
                )

                # Anti-detection stealth script
                await context.add_init_script("""
                    Object.defineProperty(navigator, 'webdriver', {
                        get: () => undefined
                    });
                    window.navigator.chrome = { runtime: {} };
                """)

                page = await context.new_page()

                # ============================================
                # STEP 1: Go to Google Sign-In
                # ============================================
                logger.info("[AUTO-LOGIN] Step 1: Navigating to Google Sign-In...")
                try:
                    await page.goto(
                        "https://accounts.google.com/ServiceLogin?hl=en",
                        timeout=settings.PAGE_LOAD_TIMEOUT * 1000,
                        wait_until="domcontentloaded"
                    )
                    await asyncio.sleep(2)
                except Exception as e:
                    logger.warning(f"Failed to load ServiceLogin, retrying: {e}")
                    await page.goto("https://accounts.google.com", timeout=30000)

                # ============================================
                # STEP 2: Enter Email
                # ============================================
                logger.info("[AUTO-LOGIN] Step 2: Entering email...")
                email_selectors = [
                    '#identifierId',
                    'input[type="email"]',
                    'input[name="identifier"]',
                    'input[id="Email"]',
                ]
                
                email_input = None
                for selector in email_selectors:
                    try:
                        el = page.locator(selector).first
                        if await el.is_visible(timeout=3000):
                            email_input = el
                            logger.info(f"Found email input with selector: {selector}")
                            break
                    except:
                        continue

                if not email_input:
                    await page.screenshot(path=os.path.join(settings.DEBUG_DIR, "login_step1_no_email_input.png"))
                    logger.error("[AUTO-LOGIN] Email input not found. Saved screenshot to debug folder.")
                    await browser.close()
                    return False

                await email_input.click()
                await email_input.fill(email)
                await asyncio.sleep(0.5)

                # Click "Next"
                next_btn = page.locator('button:has-text("Next"), #identifierNext, input[type="submit"]').first
                await next_btn.click()
                await asyncio.sleep(3)

                # ============================================
                # STEP 3: Enter Password
                # ============================================
                logger.info("[AUTO-LOGIN] Step 3: Entering password...")
                password_selectors = [
                    'input[type="password"]',
                    'input[name="Passwd"]',
                    'input[name="password"]',
                    '#password input',
                ]

                password_input = None
                for selector in password_selectors:
                    try:
                        el = page.locator(selector).first
                        if await el.is_visible(timeout=5000):
                            password_input = el
                            logger.info(f"Found password input with selector: {selector}")
                            break
                    except:
                        continue

                if not password_input:
                    await page.screenshot(path=os.path.join(settings.DEBUG_DIR, "login_step2_no_password.png"))
                    page_text = await page.inner_text("body")
                    if "captcha" in page_text.lower() or "verify" in page_text.lower():
                        logger.error("[AUTO-LOGIN] Google prompted verification/CAPTCHA.")
                    else:
                        logger.error("[AUTO-LOGIN] Password input not found. Check debug screenshot.")
                    await browser.close()
                    return False

                await password_input.click()
                # If password contains spaces and fails, remove spaces
                await password_input.fill(password)
                await asyncio.sleep(0.5)

                # Click "Next" for password
                password_next = page.locator('button:has-text("Next"), #passwordNext, input[type="submit"]').first
                await password_next.click()
                await asyncio.sleep(4)

                # ============================================
                # STEP 4: Handle post-login screens
                # ============================================
                logger.info("[AUTO-LOGIN] Step 4: Checking login result...")
                current_url = page.url
                page_text = await page.inner_text("body")

                if "challenge" in current_url or "signin/v2/challenge" in current_url:
                    await page.screenshot(path=os.path.join(settings.DEBUG_DIR, "login_2fa_challenge.png"))
                    logger.error(
                        "[AUTO-LOGIN] Google 2FA challenge detected. "
                        "Please run 'python scripts/save_session.py --manual' to authenticate once."
                    )
                    await browser.close()
                    return False

                if "wrong password" in page_text.lower() or "couldn't sign you in" in page_text.lower():
                    await page.screenshot(path=os.path.join(settings.DEBUG_DIR, "login_wrong_password.png"))
                    logger.error("[AUTO-LOGIN] Password rejected by Google. Check GOOGLE_PASSWORD in .env")
                    await browser.close()
                    return False

                # ============================================
                # STEP 5: Navigate to Flow AI
                # ============================================
                logger.info("[AUTO-LOGIN] Step 5: Navigating to Flow AI...")
                await page.goto("https://flow.google.com", timeout=settings.PAGE_LOAD_TIMEOUT * 1000)
                await asyncio.sleep(3)

                # Save session
                logger.info("[AUTO-LOGIN] Step 6: Saving session...")
                await context.storage_state(path=settings.SESSION_PATH)

                await page.screenshot(path=os.path.join(settings.DEBUG_DIR, "login_success.png"))
                logger.info(f"[AUTO-LOGIN] ✅ Login successful! Session saved to {settings.SESSION_PATH}")

                await browser.close()
                return True

        except Exception as e:
            logger.error(f"[AUTO-LOGIN] ❌ Login failed: {str(e)}")
            return False


async def ensure_valid_session() -> bool:
    """
    Ensures a valid session exists. If not, triggers auto-login.
    Call this before every video generation request.
    Returns True if session is ready, False if login failed.
    """
    if is_session_fresh():
        logger.debug("Session is fresh, no login needed.")
        return True

    logger.info("Session needs refresh. Starting auto-login...")
    return await auto_login_google()
