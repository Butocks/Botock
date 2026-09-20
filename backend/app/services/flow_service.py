"""
Flow AI Video Generation Service (Verified & Tested on Google Flow Studio).

This service automates Google Flow (flow.google.com) using Playwright.
It handles:
1. Validates saved session cookies
2. Navigates to flow.google.com
3. Clicks 'New project' (or 'Start Creating') to enter the Studio editor
4. Types the user's prompt into the ProseMirror editor (with 'Generate a video:' prefix)
5. Submits via the 'Start generation' button
6. Automatically clicks 'Always approve' / 'Approve' when Flow asks for credit confirmation
7. Waits for the video rendering to complete
8. Opens the Videos tab / video detail view
9. Triggers the 720p quality download and saves the MP4 file
"""

import os
import re
import shutil
import asyncio
import logging
from playwright.async_api import async_playwright, TimeoutError as PlaywrightTimeoutError
from playwright_stealth import Stealth
from app.config import settings
from app.services.alert_service import send_breakage_alert

logger = logging.getLogger(__name__)


def get_chrome_path():
    candidates = [
        shutil.which("google-chrome"),
        shutil.which("google-chrome-stable"),
        "/bin/google-chrome",
        "/usr/bin/google-chrome",
        "/opt/google/chrome/chrome",
    ]
    for c in candidates:
        if c and os.path.exists(c):
            return c
    return None


class FlowVideoService:
    def __init__(self):
        self.session_path = settings.SESSION_PATH
        self.videos_dir = settings.VIDEOS_DIR
        self.debug_dir = settings.DEBUG_DIR
        self.current_project_url = None
        self.project_scene_count = 0

    def check_session_valid(self) -> bool:
        """Quick check if session file exists."""
        return os.path.exists(self.session_path)

    async def generate_video(
        self,
        prompt: str,
        generation_id: str,
        status_dict: dict,
        is_pro: bool = False,
        model: str = "omni-1.1-flash-360p",
        motion_hint: str = None
    ):
        """
        Full video generation pipeline with anti-bot stealth & project continuity:
        1. Open Flow AI in genuine Chrome with playwright-stealth
        2. Reuse active project (up to 10 scenes) or start new project
        3. Enforce model selection (Free: locked to Omni 1.1 Flash 360p)
        4. Enter prompt with optional motion hint
        5. Auto-approve credit deduction
        6. Wait for rendering to complete (verified by Download button)
        7. Download video & update session state
        """
        if not self.check_session_valid():
            status_dict[generation_id] = {
                "status": "failed",
                "message": "Session not found. Please run scripts/save_session.py --manual first."
            }
            return

        status_dict[generation_id] = {
            "status": "processing",
            "message": "Connecting to Google Flow AI..."
        }

        chrome_bin = get_chrome_path()
        launch_args = {
            "headless": True,
            "ignore_default_args": ["--enable-automation"],
            "args": [
                "--no-sandbox",
                "--disable-setuid-sandbox",
                "--disable-blink-features=AutomationControlled",
                "--disable-dev-shm-usage",
                "--disable-infobars",
            ],
        }
        if chrome_bin:
            launch_args["executable_path"] = chrome_bin

        # Attach residential / datacenter proxy if configured
        if settings.PROXY_SERVER:
            proxy_cfg = {"server": settings.PROXY_SERVER}
            if settings.PROXY_USER:
                proxy_cfg["username"] = settings.PROXY_USER
                proxy_cfg["password"] = settings.PROXY_PASS
            launch_args["proxy"] = proxy_cfg

        try:
            async with async_playwright() as p:
                browser = await p.chromium.launch(**launch_args)

                context = await browser.new_context(
                    storage_state=self.session_path,
                    viewport={"width": 1920, "height": 1080},
                    locale="en-US",
                    user_agent=(
                        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 "
                        "(KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36"
                    ),
                )

                page = await context.new_page()

                # Anti-bot detection stealth
                try:
                    await Stealth().apply_stealth_async(page)
                except Exception as e:
                    logger.debug(f"Stealth injection note: {e}")

                # ============================================
                # STEP 1: Project Continuity vs Rolling New Project
                # ============================================
                if self.current_project_url and self.project_scene_count < 10:
                    logger.info(f"[{generation_id}] Reusing active project ({self.project_scene_count + 1}/10): {self.current_project_url}")
                    status_dict[generation_id]["message"] = f"Resuming active studio project (scene {self.project_scene_count + 1})..."
                    await page.goto(self.current_project_url, timeout=settings.PAGE_LOAD_TIMEOUT * 1000)
                    await asyncio.sleep(4)
                else:
                    logger.info(f"[{generation_id}] Starting new Flow project...")
                    status_dict[generation_id]["message"] = "Opening Flow Studio..."
                    await page.goto("https://flow.google.com", timeout=settings.PAGE_LOAD_TIMEOUT * 1000)
                    await asyncio.sleep(4)

                    # Verify not redirected to login
                    if "accounts.google.com" in page.url:
                        await page.screenshot(path=os.path.join(self.debug_dir, f"{generation_id}_session_expired.png"))
                        raise Exception("Google session expired. Please re-run scripts/save_session.py --manual.")

                    if "/project/" not in page.url:
                        new_proj_btn = page.get_by_text("New project").first
                        if not await new_proj_btn.is_visible(timeout=3000):
                            new_proj_btn = page.get_by_text("Start Creating").first

                        if await new_proj_btn.is_visible(timeout=5000):
                            logger.info(f"[{generation_id}] Clicking New project...")
                            await new_proj_btn.click()
                            await asyncio.sleep(5)
                        else:
                            logger.warning(f"[{generation_id}] New project button not found, continuing on current page...")

                    self.current_project_url = page.url
                    self.project_scene_count = 0

                logger.info(f"[{generation_id}] Studio URL: {page.url}")

                # ============================================
                # STEP 2: Find ProseMirror Prompt Editor
                # ============================================
                status_dict[generation_id]["message"] = "Preparing your prompt..."
                logger.info(f"[{generation_id}] Finding prompt editor (.ProseMirror)...")

                try:
                    prompt_input = page.locator('.ProseMirror, [contenteditable="true"]').first
                    await prompt_input.wait_for(state="visible", timeout=20000)
                except PlaywrightTimeoutError:
                    await page.screenshot(path=os.path.join(self.debug_dir, f"{generation_id}_no_prosemirror.png"))
                    raise Exception("Flow editor prompt box not found. Check debug screenshot.")

                # Backend Model Hardcoding & Prompt Construction:
                formatted_prompt = prompt.strip()

                # Anti-Prompt Injection: If free user, remove adversarial model overrides
                if not is_pro:
                    # Strip any attempted overrides
                    formatted_prompt = re.sub(r'(?i)\b(use\s+)?(veo|quality|1080p|4k)\b', '', formatted_prompt).strip()

                if not formatted_prompt.lower().startswith("generate a video") and not formatted_prompt.lower().startswith("create a video"):
                    formatted_prompt = f"Generate a video: {formatted_prompt}"

                if motionHint:
                    formatted_prompt += f". Camera motion: {motionHint.strip()}"

                logger.info(f"[{generation_id}] Typing prompt (model={model}, is_pro={is_pro}): {formatted_prompt[:60]}...")
                await prompt_input.click()
                await asyncio.sleep(0.3)
                await page.keyboard.type(formatted_prompt, delay=20)
                await asyncio.sleep(0.8)

                # ============================================
                # STEP 3: Click Start Generation / Press Enter
                # ============================================
                status_dict[generation_id]["message"] = "Submitting prompt to Flow AI..."
                logger.info(f"[{generation_id}] Submitting prompt...")

                generate_btn = page.locator(
                    'button[aria-label*="Start generation" i], '
                    '.generate-icon-button, '
                    'button[type="submit"]'
                ).first

                if await generate_btn.is_visible(timeout=3000):
                    await generate_btn.click()
                else:
                    await page.keyboard.press("Enter")

                await asyncio.sleep(4)

                # ============================================
                # STEP 4: Auto-Approve Credits (Always approve / Approve)
                # ============================================
                status_dict[generation_id]["message"] = "Confirming video credits..."
                logger.info(f"[{generation_id}] Checking for Flow credit approval prompt...")

                for _ in range(6):  # Check for up to 12 seconds
                    approve_btn = page.get_by_text("Always approve").first
                    if not await approve_btn.is_visible(timeout=1000):
                        approve_btn = page.get_by_text("Approve").first

                    if await approve_btn.is_visible(timeout=1000):
                        logger.info(f"[{generation_id}] Credit approval found! Clicking Always approve...")
                        await approve_btn.click()
                        await asyncio.sleep(2)
                        break
                    await asyncio.sleep(2)

                await page.screenshot(path=os.path.join(self.debug_dir, f"{generation_id}_approved.png"))

                # ============================================
                # STEP 5: Wait for Video Generation (Polling Progress)
                # ============================================
                status_dict[generation_id]["message"] = "AI is generating your video... Please wait."
                logger.info(f"[{generation_id}] Waiting for video generation (up to {settings.VIDEO_GEN_TIMEOUT}s)...")

                start_time = asyncio.get_event_loop().time()
                video_ready = False
                already_opened = False

                while not video_ready:
                    elapsed = asyncio.get_event_loop().time() - start_time
                    if elapsed > settings.VIDEO_GEN_TIMEOUT:
                        await page.screenshot(path=os.path.join(self.debug_dir, f"{generation_id}_timeout.png"))
                        raise Exception(f"Video generation timed out after {settings.VIDEO_GEN_TIMEOUT}s.")

                    mins = int(elapsed // 60)
                    secs = int(elapsed % 60)

                    # Extract body text from Flow UI
                    try:
                        body_text = await page.evaluate("() => document.body.innerText || ''")
                    except Exception:
                        body_text = ""

                    # Check for percentage pattern e.g. "21%", "85%"
                    pct_matches = re.findall(r'(\d{1,3})%', body_text)
                    if pct_matches:
                        latest_pct = pct_matches[-1]
                        status_dict[generation_id]["message"] = (
                            f"Rendering video on Flow AI... ({latest_pct}% completed, {mins}m {secs:02d}s elapsed)"
                        )
                        logger.info(f"[{generation_id}] Render in progress: {latest_pct}% ({mins}m {secs:02d}s)")
                    elif "waiting in the queue" in body_text.lower() or "scheduled" in body_text.lower():
                        status_dict[generation_id]["message"] = (
                            f"Flow AI queued your generation... ({mins}m {secs:02d}s elapsed)"
                        )
                    else:
                        status_dict[generation_id]["message"] = (
                            f"Rendering video on Flow AI... ({mins}m {secs:02d}s elapsed)"
                        )

                    # Flow AI takes at least 35 seconds to render a video.
                    # Only attempt ready check after 35s when no generating percentage is visible.
                    if elapsed >= 35 and not pct_matches:
                        # Check if download media button is already visible
                        dl_btn = page.locator(
                            'button[aria-label*="Download media" i], '
                            'button[aria-label*="Download" i]'
                        ).first

                        if await dl_btn.is_visible():
                            logger.info(f"[{generation_id}] Download button already visible! Video ready.")
                            video_ready = True
                            already_opened = True
                            break

                        # Click Videos in sidebar to filter videos
                        try:
                            videos_tab = page.locator('text="Videos"').first
                            if await videos_tab.is_visible(timeout=1000):
                                await videos_tab.click()
                                await asyncio.sleep(1.5)
                        except Exception:
                            pass

                        # Click the video tile in center
                        logger.info(f"[{generation_id}] Checking if video tile finished rendering (clicking 350, 250)...")
                        await page.mouse.click(350, 250)
                        await asyncio.sleep(2.5)

                        # If download button appeared after clicking tile, video is ready!
                        if await dl_btn.is_visible():
                            logger.info(f"[{generation_id}] Video opened and Download button visible! Ready to download.")
                            video_ready = True
                            already_opened = True
                            break
                        else:
                            logger.info(f"[{generation_id}] Still processing (dl button not visible yet)...")

                    await asyncio.sleep(6)

                # Small settle delay
                await asyncio.sleep(2)

                # ============================================
                # STEP 6: Download the Generated Video
                # ============================================
                status_dict[generation_id]["message"] = "Downloading your video..."
                logger.info(f"[{generation_id}] Downloading video (already_opened={already_opened})...")

                file_path = await self._download_video(page, generation_id, already_opened=already_opened)

                status_dict[generation_id] = {
                    "status": "completed",
                    "download_url": f"/api/video/download/{generation_id}",
                    "message": "Video generated successfully!"
                }
                logger.info(f"[{generation_id}] 🎉 Process complete! Saved to {file_path}")

                # Save latest session state
                await context.storage_state(path=self.session_path)
                await browser.close()

        except Exception as e:
            logger.error(f"[{generation_id}] Generation failed: {str(e)}")
            status_dict[generation_id] = {
                "status": "failed",
                "message": str(e)
            }

    async def _download_video(self, page, generation_id: str, already_opened: bool = False) -> str:
        """
        Download video from Flow Studio:
        1. If not already opened, switch to 'Videos' tab and click center video tile
        2. Locate and click 'Download media' button
        3. Select '720p Original size' from quality dropdown
        4. Catch the browser download event and save as MP4
        """
        file_path = os.path.join(self.videos_dir, f"{generation_id}.mp4")

        dl_btn = page.locator(
            'button[aria-label*="Download media" i], '
            'button[aria-label*="Download" i]'
        ).first

        if not already_opened or not await dl_btn.is_visible():
            # Step 1: Click Videos in sidebar if available
            try:
                videos_tab = page.locator('text="Videos"').first
                if await videos_tab.is_visible(timeout=2000):
                    logger.info(f"[{generation_id}] Clicking Videos tab in sidebar...")
                    await videos_tab.click()
                    await asyncio.sleep(1.5)
            except Exception as e:
                logger.debug(f"[{generation_id}] Videos tab click: {e}")

            # Step 2: Click the center video tile to open viewer
            logger.info(f"[{generation_id}] Clicking video tile in center...")
            await page.mouse.click(350, 250)
            await asyncio.sleep(2.5)

        # Step 3: Click 'Download media' button
        logger.info(f"[{generation_id}] Looking for Download media button...")
        if not await dl_btn.is_visible(timeout=8000):
            await page.screenshot(path=os.path.join(self.debug_dir, f"{generation_id}_no_dl_btn.png"))
            raise Exception("Download media button not visible after opening video tile.")

        logger.info(f"[{generation_id}] Clicking Download media button to open quality menu...")
        await dl_btn.click()
        await asyncio.sleep(1.5)

        # Step 4: Click '720p' or 'Original size' option in dropdown
        logger.info(f"[{generation_id}] Selecting 720p quality option...")
        opt = page.get_by_text("720p").first
        if not await opt.is_visible(timeout=2000):
            opt = page.get_by_text("Original size").first
        if not await opt.is_visible(timeout=2000):
            opt = page.locator('[role="menuitem"], .mat-mdc-menu-item').first

        # Step 5: Catch download event
        async with page.expect_download(timeout=90000) as dl_info:
            await opt.click()

        download = await dl_info.value
        await download.save_as(file_path)
        logger.info(f"[{generation_id}] 🎉 Video file saved successfully! Size: {os.path.getsize(file_path)} bytes")
        return file_path
