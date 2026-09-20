"""
Flow AI Session Saver (Anti-Detection & Real Chrome).

Opens genuine Google Chrome without automation flags (--enable-automation removed)
so Google does NOT trigger "This browser or app may not be secure".
"""

import asyncio
import os
import sys
import shutil
import json

# Add parent dir to path so we can import app modules
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

SESSION_PATH = os.path.join(os.path.dirname(__file__), "..", "session", "flow_session.json")

AUTH_COOKIE_NAMES = {"SID", "SSID", "HSID", "SAPISID", "APISID", "__Secure-1PSID"}


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


def check_has_auth_cookies(cookies_list) -> bool:
    """Returns True if any critical Google authentication cookie exists."""
    found = {c.get("name") for c in cookies_list if c.get("name") in AUTH_COOKIE_NAMES}
    return len(found) > 0


async def manual_login():
    """Manual login using genuine Google Chrome with anti-bot stealth."""
    from playwright.async_api import async_playwright

    print("=" * 65)
    print("  GOOGLE FLOW AI - SECURE LOGIN VIA GENUINE CHROME")
    print("=" * 65)

    os.makedirs(os.path.dirname(SESSION_PATH), exist_ok=True)
    chrome_path = get_chrome_path()

    launch_kwargs = {
        "headless": False,
        "ignore_default_args": ["--enable-automation"],
        "args": [
            "--disable-blink-features=AutomationControlled",
            "--no-sandbox",
            "--disable-infobars",
            "--disable-dev-shm-usage",
        ],
    }

    if chrome_path:
        print(f"Using genuine Chrome binary: {chrome_path}")
        launch_kwargs["executable_path"] = chrome_path
    else:
        print("Using Playwright Chromium (Chrome binary not found)")

    async with async_playwright() as p:
        browser = await p.chromium.launch(**launch_kwargs)
        context = await browser.new_context(
            viewport={"width": 1280, "height": 800},
            locale="en-US",
            user_agent=(
                "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 "
                "(KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36"
            ),
        )

        # Stealth: make navigator.webdriver undefined
        await context.add_init_script("""
            Object.defineProperty(navigator, 'webdriver', {
                get: () => undefined
            });
            window.navigator.chrome = { runtime: {} };
        """)

        page = await context.new_page()

        print("\nOpening Google Sign-In for Flow AI...")
        await page.goto("https://accounts.google.com/AccountChooser?continue=https://flow.google.com/")

        print("\n" + "*" * 60)
        print("ACTION REQUIRED IN THE BROWSER:")
        print("1. Apne Google Account ka Email aur Password daalein.")
        print("2. 2FA (agar aaye) toh phone/app se approve karein.")
        print("3. Login ke baad jab Google Flow ka studio/interface load ho jaye,")
        print("   tab wapas yahan terminal par aakar ENTER dabayein.")
        print("*" * 60 + "\n")

        while True:
            input("Press ENTER after you have logged in and see Google Flow... ")

            cookies = await context.cookies()
            if check_has_auth_cookies(cookies):
                print("\n✅ Login verified! Google Auth cookies (SID/SSID) detected.")
                break
            else:
                print("\n⚠️ Login abhi complete nahi hua (Google session cookies missing).")
                print("   Browser window mein login poora karein.")
                retry = input("   Dobara check karein? (y/n): ")
                if retry.lower() != 'y':
                    print("Cancelled.")
                    await browser.close()
                    return

        # Save session
        await context.storage_state(path=SESSION_PATH)

        # Restrict permissions: 600 (owner only)
        try:
            os.chmod(SESSION_PATH, 0o600)
        except Exception:
            pass

        print(f"\n🎉 SUCCESS! Session successfully saved to:")
        print(f"   {os.path.abspath(SESSION_PATH)}")
        print("   (Owner-only secure permissions applied)")
        print("\nAb aapka server bina dobara login maange video generate karega!")

        await browser.close()


async def auto_login():
    """Automated login using credentials from .env"""
    from app.services.google_auth import auto_login_google

    print("=" * 60)
    print("  AUTOMATIC Google Login (using .env credentials)")
    print("=" * 60)

    success = await auto_login_google()

    if success:
        print("\n✅ Login successful! Session saved.")
        print(f"   Session file: {os.path.abspath(SESSION_PATH)}")
    else:
        print("\n❌ Automated Login failed (Google bot protection detected).")
        print("   Please use manual mode:")
        print("   ./venv/bin/python scripts/save_session.py --manual")


if __name__ == "__main__":
    if "--manual" in sys.argv:
        asyncio.run(manual_login())
    else:
        asyncio.run(auto_login())
