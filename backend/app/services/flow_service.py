"""
Google Flow Creative Suite Service (Flow AI Studio Automation).

This service automates Google Flow (flow.google.com) using Playwright.
It handles:
1. Validates saved session cookies
2. Navigates cleanly into Flow Studio (handles home page, existing projects, onboarding overlays)
3. Configures settings for Video (Omni 1.1 Flash, 360p, 10s, x1, 16:9 / 9:16)
4. Configures settings for Image (Nano Banana 2, x1, 1:1 / 16:9 / 9:16 / 4:3 / 3:4)
5. Attaches ingredient / reference images via the Flow file upload chooser
6. Types prompt into the ProseMirror editor and submits
7. Auto-approves credit deductions if prompted
8. Polls for video rendering (downloads MP4) or image generation (downloads high-res PNG)
"""

import os
import re
import time
import base64
import shutil
import asyncio
import tempfile
import logging
from playwright.async_api import async_playwright, TimeoutError as PlaywrightTimeoutError
from playwright_stealth import Stealth
from app.config import settings

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


class FlowService:
    def __init__(self):
        self.session_path = settings.SESSION_PATH
        self.videos_dir = settings.VIDEOS_DIR
        self.images_dir = settings.IMAGES_DIR
        self.debug_dir = settings.DEBUG_DIR
        os.makedirs(self.videos_dir, exist_ok=True)
        os.makedirs(self.images_dir, exist_ok=True)
        os.makedirs(self.debug_dir, exist_ok=True)

    def check_session_valid(self) -> bool:
        if os.path.exists(self.session_path):
            return True
        alt_paths = [
            os.path.join(os.path.dirname(__file__), "..", "..", "session", "flow_session.json"),
            os.path.join(os.path.dirname(__file__), "..", "..", "..", "session", "flow_session.json"),
            "backend/session/flow_session.json",
            "session/flow_session.json",
        ]
        for p in alt_paths:
            if os.path.exists(p):
                self.session_path = os.path.abspath(p)
                return True
        return False

    async def _launch_browser(self):
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

        if settings.PROXY_SERVER:
            proxy_cfg = {"server": settings.PROXY_SERVER}
            if settings.PROXY_USER:
                proxy_cfg["username"] = settings.PROXY_USER
                proxy_cfg["password"] = settings.PROXY_PASS
            launch_args["proxy"] = proxy_cfg

        p = await async_playwright().start()
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
        try:
            await Stealth().apply_stealth_async(page)
        except Exception as e:
            logger.debug(f"Stealth note: {e}")

        return p, browser, context, page

    async def _ensure_studio_page(self, page, generation_id: str, status_dict: dict):
        """
        Guarantees that the browser is inside an active fresh Flow Studio project,
        dismisses any explore/onboarding modals, and returns the ProseMirror prompt editor.
        CRITICAL: Never falls back to an existing project — this shared account requires
        strict project isolation to prevent cross-user content or tile leaks.
        """
        logger.info(f"[{generation_id}] Navigating to Flow for fresh isolated project...")
        status_dict[generation_id]["message"] = "Connecting to Flow Studio..."
        await page.goto("https://flow.google.com", timeout=settings.PAGE_LOAD_TIMEOUT * 1000, wait_until="domcontentloaded")
        await asyncio.sleep(3)

        if "accounts.google.com" in page.url:
            await page.screenshot(path=os.path.join(self.debug_dir, f"{generation_id}_session_expired.png"))
            raise Exception("Google Flow session expired. Please re-run authentication.")

        new_btn = page.locator('button:has-text("New project"), button:has-text("Start Creating"), [aria-label*="New project" i]').first
        if not await new_btn.is_visible(timeout=8000):
            # Check for inner span if button tag varies
            new_btn = page.locator('span:has-text("New project")').first

        if not await new_btn.is_visible(timeout=4000):
            await page.screenshot(path=os.path.join(self.debug_dir, f"{generation_id}_no_new_project_btn.png"))
            raise Exception(
                "Could not find 'New project' button — refusing to fall back to an "
                "existing project to guarantee complete generation isolation."
            )

        await new_btn.click()
        await page.wait_for_url("**/project/**", timeout=25000)

        # Dismiss explore tools / onboarding overlay if open
        back_btn = page.locator('button[aria-label*="Back button" i], button:has-text("arrow_back"), [aria-label*="Back" i]').first
        if await back_btn.is_visible(timeout=2000):
            await back_btn.click()
            await asyncio.sleep(1)

        all_media_btn = page.locator('text="All media"').first
        if await all_media_btn.is_visible(timeout=3000):
            await all_media_btn.click()
            await asyncio.sleep(1.5)

        prompt_input = page.locator('.ProseMirror, [contenteditable="true"]').first
        await prompt_input.wait_for(state="visible", timeout=25000)
        return prompt_input

    async def _upload_ingredient(self, page, image_base64: str, generation_id: str):
        """
        Uploads ingredient / reference image into Flow Studio prompt box via the
        prompt-box '+' button (button.add-menu-trigger). Captures a pre-upload baseline
        of the shared media library to explicitly find and click OUR uploaded thumbnail,
        guaranteeing stale/cross-user images are never attached.
        """
        if not image_base64:
            return

        if "," in image_base64:
            image_base64 = image_base64.split(",", 1)[1]

        try:
            img_bytes = base64.b64decode(image_base64)
        except Exception as e:
            logger.warning(f"[{generation_id}] Invalid base64 image ingredient: {e}")
            raise Exception("Invalid image data provided for ingredient.")

        tmp_filename = f"botock_ingr_{generation_id[:8]}.png"
        tmp_path = os.path.join(tempfile.gettempdir(), tmp_filename)
        with open(tmp_path, "wb") as f:
            f.write(img_bytes)

        try:
            logger.info(f"[{generation_id}] Attaching ingredient image ({tmp_filename}) to prompt box...")
            # 1. Click '+' button attached to prompt box
            prompt_add_btn = page.locator('button.add-menu-trigger, button[aria-label*="Add ingredients" i]').first
            if not await prompt_add_btn.is_visible(timeout=5000):
                raise Exception("Prompt ingredients (+) button not found in studio.")

            await prompt_add_btn.click()
            await asyncio.sleep(1)

            # 2. Click 'Upload media'
            upload_media_btn = page.locator('button:has-text("Upload media"), div:has-text("Upload media"), [role="button"]:has-text("Upload media")').last
            if not await upload_media_btn.is_visible(timeout=5000):
                raise Exception("'Upload media' option not visible in assets drawer.")

            # CRITICAL: this Google account's "Recent uploads" media library is
            # SHARED across every past generation — it is NOT reset per-project.
            # We capture a baseline of every thumb currently visible BEFORE upload,
            # so we can explicitly identify and click OUR file after upload.
            baseline_srcs = await page.evaluate("""() => {
                return Array.from(document.querySelectorAll('img'))
                    .map(i => i.src).filter(Boolean);
            }""")

            async with page.expect_file_chooser(timeout=10000) as fc_info:
                await upload_media_btn.click()

            file_chooser = await fc_info.value
            await file_chooser.set_files(tmp_path)
            logger.info(f"[{generation_id}] File uploaded ({tmp_filename}). Waiting for its thumbnail to appear...")

            # 3. Explicitly find and click the thumbnail that was NOT there before —
            # do not trust the picker's own "selected by default" state.
            new_thumb = None
            for _ in range(25):  # ~12s max
                # Try 1: locate by distinct filename in drawer list
                name_el = page.locator(f'text="{tmp_filename}"').first
                if await name_el.is_visible():
                    new_thumb = name_el
                    break

                # Try 2: look for an img element whose src was not in baseline
                for c in await page.locator('.cdk-overlay-pane img, mat-bottom-sheet-container img, img').all():
                    src = await c.get_attribute("src") or ""
                    if src and src not in baseline_srcs:
                        new_thumb = c
                        break
                if new_thumb:
                    break
                await asyncio.sleep(0.5)

            if not new_thumb:
                logger.warning(
                    f"[{generation_id}] Could not distinctly identify newly uploaded "
                    f"thumbnail — aborting to avoid attaching the WRONG image."
                )
                await page.screenshot(path=os.path.join(self.debug_dir, f"{generation_id}_ingredient_ambiguous.png"))
                raise Exception("Could not verify newly uploaded image ingredient in library — aborted to prevent wrong image attachment.")

            await new_thumb.click()
            logger.info(f"[{generation_id}] Explicitly selected our own uploaded thumbnail.")
            await asyncio.sleep(0.8)

            # 4. Wait for 'Add to prompt' button to become enabled
            add_to_prompt_btn = page.locator('button.detail-add-to-prompt-btn, button:has-text("Add to prompt"), div:has-text("Add to prompt")').last
            await add_to_prompt_btn.wait_for(state="visible", timeout=20000)

            for _ in range(25):
                is_disabled = await add_to_prompt_btn.get_attribute("disabled")
                aria_disabled = await add_to_prompt_btn.get_attribute("aria-disabled")
                classes = await add_to_prompt_btn.get_attribute("class") or ""
                if not is_disabled and aria_disabled != "true" and "disabled" not in classes.lower():
                    break
                await asyncio.sleep(1)

            await add_to_prompt_btn.click()
            logger.info(f"[{generation_id}] Clicked 'Add to prompt'. Ingredient attached successfully!")
            await asyncio.sleep(1.5)

        except Exception as e:
            logger.error(f"[{generation_id}] Ingredient upload error: {e}")
            await page.screenshot(path=os.path.join(self.debug_dir, f"{generation_id}_ingredient_error.png"))
            raise e
        finally:
            if os.path.exists(tmp_path):
                os.remove(tmp_path)

    async def _handle_credit_approval(self, page, generation_id: str):
        """Clicks 'Always approve' or 'Approve' if credit confirmation dialog appears."""
        for _ in range(5):
            approve_btn = page.get_by_text("Always approve").first
            if not await approve_btn.is_visible(timeout=1000):
                approve_btn = page.get_by_text("Approve").first

            if await approve_btn.is_visible(timeout=1000):
                logger.info(f"[{generation_id}] Credit approval dialog found! Clicking approve...")
                await approve_btn.click()
                await asyncio.sleep(1.5)
                break
            await asyncio.sleep(1.5)

    # =========================================================================
    # VIDEO GENERATION (Omni 1.1 Flash, 360p, 10s, x1, 16:9 / 9:16)
    # =========================================================================
    async def generate_video(
        self,
        prompt: str,
        generation_id: str,
        status_dict: dict,
        is_pro: bool = False,
        model: str = "omni-1.1-flash-360p",
        aspect_ratio: str = "16:9",
        motion_hint: str = None,
        image_base64: str = None,
        reference_image_path: str = None,
    ):
        if not self.check_session_valid():
            status_dict[generation_id] = {
                "status": "failed",
                "message": "Session not found. Please log in to Google Flow first."
            }
            return

        status_dict[generation_id] = {
            "status": "processing",
            "message": "Connecting to Google Flow AI..."
        }

        p, browser, context, page = await self._launch_browser()

        try:
            prompt_input = await self._ensure_studio_page(page, generation_id, status_dict)

            # Configure Settings Popup for Video
            status_dict[generation_id]["message"] = "Configuring AI video engine..."
            try:
                settings_btn = page.locator('button:has-text("Banana"), button:has-text("Video"), button:has-text("Omni"), button:has-text("Veo")').first
                if await settings_btn.is_visible(timeout=3000):
                    await settings_btn.click()
                    await asyncio.sleep(1)

                    # Video Tab — popup lives in .cdk-overlay-pane NOT [role="dialog"]
                    video_tab = page.locator('.cdk-overlay-pane button').filter(has_text="Video").first
                    if await video_tab.is_visible(timeout=2000):
                        await video_tab.click()
                        await asyncio.sleep(0.8)

                    # Model selection: Omni 1.1 Flash vs Veo 3.1
                    model_str = str(model).lower()
                    if "veo" in model_str:
                        model_dropdown = page.locator('.cdk-overlay-pane button:has-text("Omni"), .cdk-overlay-pane button:has-text("Veo"), .cdk-overlay-pane button:has-text("Flash")').first
                        if await model_dropdown.is_visible(timeout=2000):
                            await model_dropdown.click()
                            await asyncio.sleep(0.6)
                            target_veo = "Veo 3.1 - Fast" if "fast" in model_str else "Veo 3.1 - Quality" if "quality" in model_str else "Veo 3.1 - Lite"
                            veo_opt = page.locator('.cdk-overlay-pane [role="menuitem"], [role="menu"] button, .mat-mdc-menu-item').filter(has_text=target_veo).first
                            if await veo_opt.is_visible(timeout=2000):
                                await veo_opt.click()
                                await asyncio.sleep(0.4)
                    else:
                        model_dropdown = page.locator('.cdk-overlay-pane button:has-text("Veo")').first
                        if await model_dropdown.is_visible(timeout=1500):
                            await model_dropdown.click()
                            await asyncio.sleep(0.6)
                            omni_opt = page.locator('.cdk-overlay-pane [role="menuitem"], [role="menu"] button, .mat-mdc-menu-item').filter(has_text="Omni 1.1 Flash").first
                            if await omni_opt.is_visible(timeout=2000):
                                await omni_opt.click()
                                await asyncio.sleep(0.4)

                    # Aspect Ratio
                    ratio_to_click = "9:16" if "9:16" in str(aspect_ratio) else "16:9"
                    ratio_btn = page.locator('.cdk-overlay-pane button').filter(has_text=ratio_to_click).first
                    if await ratio_btn.is_visible(timeout=2000):
                        await ratio_btn.click()
                        await asyncio.sleep(0.3)

                    # Resolution: 360p vs 720p based on model selection
                    target_res = "720p" if ("720p" in model_str or "hd" in model_str or "quality" in model_str) else "360p"
                    res_btn = page.locator('.cdk-overlay-pane button').filter(has_text=target_res).first
                    if not await res_btn.is_visible(timeout=1500):
                        res_btn = page.locator('.cdk-overlay-pane button').filter(has_text="360p").first
                    if await res_btn.is_visible(timeout=2000):
                        await res_btn.click()
                        await asyncio.sleep(0.3)

                    # Duration: 10s (fallback 8s)
                    dur_btn = page.locator('.cdk-overlay-pane button').filter(has_text="10s").first
                    if not await dur_btn.is_visible(timeout=1500):
                        dur_btn = page.locator('.cdk-overlay-pane button').filter(has_text="8s").first
                    if await dur_btn.is_visible(timeout=2000):
                        await dur_btn.click()
                        await asyncio.sleep(0.3)

                    # Count: x1
                    count_btn = page.locator('.cdk-overlay-pane button').filter(has_text="x1").first
                    if await count_btn.is_visible(timeout=2000):
                        await count_btn.click()
                        await asyncio.sleep(0.3)

                    await page.keyboard.press("Escape")
                    await asyncio.sleep(0.5)
            except Exception as ex:
                logger.warning(f"[{generation_id}] Video settings note: {ex}")

            # Upload ingredient image into prompt box if provided
            if image_base64:
                status_dict[generation_id]["message"] = "Attaching reference image to video prompt..."
                await self._upload_ingredient(page, image_base64, generation_id)

            # Prompt Construction
            formatted_prompt = prompt.strip()
            if not is_pro:
                formatted_prompt = re.sub(r'(?i)(use\s+)?(veo|quality|1080p|4k)', '', formatted_prompt).strip()

            if not formatted_prompt.lower().startswith("generate a video") and not formatted_prompt.lower().startswith("create a video"):
                formatted_prompt = f"Generate a video: {formatted_prompt}"

            if motion_hint:
                formatted_prompt += f". Camera motion: {motion_hint.strip()}"

            status_dict[generation_id]["message"] = "Entering prompt into Flow AI..."
            await prompt_input.click()
            await asyncio.sleep(0.3)
            await page.keyboard.type(formatted_prompt, delay=15)
            await asyncio.sleep(0.8)

            # Baseline: record existing video tiles before submitting this prompt
            existing_video_tiles = await page.evaluate("""() => {
                return Array.from(document.querySelectorAll('img[alt*="video" i], video'))
                    .map(el => el.currentSrc || el.src || '')
                    .filter(Boolean);
            }""")

            # Submit
            status_dict[generation_id]["message"] = "Submitting prompt to Flow AI..."
            generate_btn = page.locator('button[aria-label*="Start generation" i], .generate-icon-button, button[type="submit"]').first
            if await generate_btn.is_visible(timeout=3000):
                await generate_btn.click()
            else:
                await page.keyboard.press("Enter")

            await asyncio.sleep(3)
            await self._handle_credit_approval(page, generation_id)

            # Polling for video completion
            status_dict[generation_id]["message"] = "AI is generating your video... Please wait."
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

                try:
                    body_text = await page.evaluate("() => document.body.innerText || ''")
                except Exception:
                    body_text = ""

                pct_matches = re.findall(r'(\d{1,3})%', body_text)
                if pct_matches:
                    latest_pct = pct_matches[-1]
                    status_dict[generation_id]["message"] = (
                        f"Rendering video on Flow AI... ({latest_pct}% completed, {mins}m {secs:02d}s elapsed)"
                    )
                else:
                    status_dict[generation_id]["message"] = (
                        f"Rendering video on Flow AI... ({mins}m {secs:02d}s elapsed)"
                    )

                pct_100 = pct_matches and int(pct_matches[-1]) >= 100

                if elapsed >= 25 and (not pct_matches or pct_100):
                    dl_btn = page.locator('button[aria-label*="Download media" i], button[aria-label*="Download" i]').first
                    if await dl_btn.is_visible():
                        video_ready = True
                        already_opened = True
                        break

                    # Look specifically for a tile that was NOT in our baseline
                    new_tile = None
                    for tile in await page.locator('img[alt*="video" i], video').all():
                        src = await tile.evaluate("el => el.currentSrc || el.src || ''")
                        if src and src not in existing_video_tiles:
                            new_tile = tile
                            break

                    if new_tile:
                        logger.info(f"[{generation_id}] Found new video tile! Opening viewer...")
                        await new_tile.click()
                        await asyncio.sleep(2)
                    else:
                        # Fallback click
                        await page.mouse.click(350, 250)
                        await asyncio.sleep(2)

                    if await dl_btn.is_visible():
                        video_ready = True
                        already_opened = True
                        break

                await asyncio.sleep(4)

            # Download MP4
            status_dict[generation_id]["message"] = "Downloading your video..."
            file_path = await self._download_video(page, generation_id, already_opened=already_opened, existing_video_tiles=existing_video_tiles)

            status_dict[generation_id].update({
                "status": "completed",
                "download_url": f"/api/video/download/{generation_id}",
                "message": "Video generated successfully!"
            })
            await context.storage_state(path=self.session_path)

        except Exception as e:
            logger.error(f"[{generation_id}] Video generation failed: {e}")
            await page.screenshot(path=os.path.join(self.debug_dir, f"{generation_id}_video_error.png"))
            status_dict[generation_id].update({
                "status": "failed",
                "message": str(e)
            })
        finally:
            await browser.close()
            await p.stop()

    async def _download_video(self, page, generation_id: str, already_opened: bool = False, existing_video_tiles: list = None) -> str:
        file_path = os.path.join(self.videos_dir, f"{generation_id}.mp4")
        dl_btn = page.locator('button[aria-label*="Download media" i], button[aria-label*="Download" i]').first

        if not already_opened or not await dl_btn.is_visible():
            new_tile = None
            if existing_video_tiles is not None:
                for tile in await page.locator('img[alt*="video" i], video').all():
                    src = await tile.evaluate("el => el.currentSrc || el.src || ''")
                    if src and src not in existing_video_tiles:
                        new_tile = tile
                        break

            if new_tile:
                await new_tile.click()
            else:
                await page.mouse.click(350, 250)
            await asyncio.sleep(2.5)

        if not await dl_btn.is_visible(timeout=8000):
            await page.screenshot(path=os.path.join(self.debug_dir, f"{generation_id}_no_dl_btn.png"))
            raise Exception("Download media button not visible after opening video tile.")

        await dl_btn.click()
        await asyncio.sleep(1.5)

        menu = page.locator('.cdk-overlay-pane, [role="menu"], .mat-mdc-menu-panel').last
        opt = menu.locator('button, [role="menuitem"]').filter(has_text="720p").first
        if not await opt.is_visible(timeout=2000):
            opt = menu.locator('button, [role="menuitem"]').filter(has_text="Original").first
        if not await opt.is_visible(timeout=2000):
            opt = menu.locator('button, [role="menuitem"]').first
        if not await opt.is_visible(timeout=2000):
            opt = page.locator('[role="menuitem"], .mat-mdc-menu-item').first

        async with page.expect_download(timeout=90000) as dl_info:
            await opt.click()

        download = await dl_info.value
        await download.save_as(file_path)
        return file_path

    # =========================================================================
    # IMAGE GENERATION (Nano Banana 2, x1, Aspect Ratios)
    # =========================================================================
    async def generate_image(
        self,
        prompt: str,
        generation_id: str,
        status_dict: dict,
        aspect_ratio: str = "1:1",
        model: str = "nano-banana-2",
        image_base64: str = None,
        style: str = None,
        is_pro: bool = False,
    ):
        if not self.check_session_valid():
            status_dict[generation_id] = {
                "status": "failed",
                "message": "Session not found. Please log in to Google Flow first."
            }
            return

        status_dict[generation_id] = {
            "status": "processing",
            "message": "Connecting to Google Flow AI..."
        }

        p, browser, context, page = await self._launch_browser()

        try:
            prompt_input = await self._ensure_studio_page(page, generation_id, status_dict)

            # Configure Settings Popup for Image
            status_dict[generation_id]["message"] = "Configuring Flow AI Nano Banana 2 engine..."
            try:
                settings_btn = page.locator('button:has-text("Banana"), button:has-text("Video"), button:has-text("Omni")').first
                if await settings_btn.is_visible(timeout=3000):
                    await settings_btn.click()
                    await asyncio.sleep(1)

                    # Image Tab — popup lives in .cdk-overlay-pane
                    img_tab = page.locator('.cdk-overlay-pane button').filter(has_text="Image").first
                    if await img_tab.is_visible(timeout=2000):
                        await img_tab.click()
                        await asyncio.sleep(0.5)

                    # Aspect Ratio
                    allowed_ratios = ["1:1", "16:9", "9:16", "4:3", "3:4"]
                    ratio_str = aspect_ratio if aspect_ratio in allowed_ratios else "1:1"
                    ratio_btn = page.locator('.cdk-overlay-pane button').filter(has_text=ratio_str).first
                    if await ratio_btn.is_visible(timeout=2000):
                        await ratio_btn.click()
                        await asyncio.sleep(0.3)

                    # Count: x1
                    count_btn = page.locator('.cdk-overlay-pane button').filter(has_text="x1").first
                    if await count_btn.is_visible(timeout=2000):
                        await count_btn.click()
                        await asyncio.sleep(0.3)

                    await page.keyboard.press("Escape")
                    await asyncio.sleep(0.5)
            except Exception as ex:
                logger.warning(f"[{generation_id}] Image settings note: {ex}")

            # Upload ingredient image if provided
            if image_base64:
                status_dict[generation_id]["message"] = "Uploading image ingredient..."
                await self._upload_ingredient(page, image_base64, generation_id)

            # Baseline: record existing image tiles before submitting
            existing_imgs = await page.evaluate("""() => {
                return Array.from(document.querySelectorAll('img'))
                    .filter(i => (i.alt || '').toLowerCase().includes('image'))
                    .map(i => i.src)
                    .filter(Boolean);
            }""")

            # Enter Prompt
            full_prompt = prompt.strip()
            if style:
                full_prompt += f", {style} style"

            status_dict[generation_id]["message"] = "Entering prompt into Flow AI..."
            await prompt_input.click()
            await asyncio.sleep(0.3)
            await page.keyboard.type(full_prompt, delay=12)
            await asyncio.sleep(0.8)

            # Submit
            status_dict[generation_id]["message"] = "Generating image with Nano Banana 2..."
            generate_btn = page.locator('button[aria-label*="Start generation" i], .generate-icon-button, button[type="submit"]').first
            if await generate_btn.is_visible(timeout=3000):
                await generate_btn.click()
            else:
                await page.keyboard.press("Enter")

            await asyncio.sleep(3)
            await self._handle_credit_approval(page, generation_id)

            # Polling for Image completion
            status_dict[generation_id]["message"] = "Synthesizing Nano Banana 2 image... Please wait."
            found_img_url = None
            save_path = os.path.join(self.images_dir, f"{generation_id}.png")

            start_time = asyncio.get_event_loop().time()
            for attempt in range(45):  # 45 * 2s = 90 seconds max
                await asyncio.sleep(2)
                elapsed = asyncio.get_event_loop().time() - start_time

                try:
                    body_text = await page.evaluate("() => document.body.innerText || ''")
                except Exception:
                    body_text = ""

                pct_matches = re.findall(r'(\d{1,3})%', body_text)
                if pct_matches:
                    latest_pct = pct_matches[-1]
                    status_dict[generation_id]["message"] = f"Rendering with Nano Banana 2... ({latest_pct}%)"
                    logger.info(f"[{generation_id}] Image render in progress: {latest_pct}%")
                    continue
                else:
                    status_dict[generation_id]["message"] = f"Rendering with Nano Banana 2... ({int(elapsed)}s elapsed)"

                # Flow images finish in ~15-35s. After 15s and no percentage, download image
                if elapsed >= 15:
                    logger.info(f"[{generation_id}] Checking if image finished...")
                    dl_btn = page.locator('button[aria-label*="Download" i]').first
                    if not await dl_btn.is_visible():
                        new_tile = None
                        for img_el in await page.locator('img[alt*="image" i]').all():
                            src = await img_el.get_attribute("src") or ""
                            if src and src not in existing_imgs:
                                new_tile = img_el
                                break

                        if new_tile:
                            logger.info(f"[{generation_id}] Found new image tile! Clicking to open viewer...")
                            await new_tile.click()
                        else:
                            logger.info(f"[{generation_id}] Waiting for new image tile to appear on canvas...")
                            await page.mouse.click(250, 200)
                        await asyncio.sleep(2)

                    if await dl_btn.is_visible():
                        logger.info(f"[{generation_id}] Image viewer ready, downloading original resolution...")
                        await dl_btn.click()
                        await asyncio.sleep(1)

                        opt = page.locator('button:has-text("Original size"), [role="menuitem"]:has-text("Original size"), button:has-text("1K")').first
                        if not await opt.is_visible(timeout=3000):
                            opt = page.locator('[role="menuitem"]').first

                        async with page.expect_download(timeout=30000) as dl_info:
                            await opt.click()

                        download = await dl_info.value
                        await download.save_as(save_path)
                        logger.info(f"[{generation_id}] Image saved: {save_path} ({os.path.getsize(save_path)} bytes)")
                        found_img_url = save_path
                        break

            if not found_img_url or not os.path.exists(save_path):
                await page.screenshot(path=os.path.join(self.debug_dir, f"{generation_id}_img_timeout.png"))
                raise Exception("Image generation timed out waiting for image tile.")

            download_url = f"/api/image/download/{generation_id}"
            status_dict[generation_id].update({
                "status": "completed",
                "message": "Image generated successfully!",
                "download_url": download_url,
                "image_url": download_url,
            })
            await context.storage_state(path=self.session_path)

        except Exception as e:
            logger.error(f"[{generation_id}] Image generation failed: {e}")
            await page.screenshot(path=os.path.join(self.debug_dir, f"{generation_id}_image_error.png"))
            status_dict[generation_id].update({
                "status": "failed",
                "message": str(e)
            })
        finally:
            await browser.close()
            await p.stop()

    async def reset_session(self):
        return {"status": "success", "message": "Session reset successfully."}


flow_service = FlowService()
FlowVideoService = FlowService
