import time
import logging
from collections import defaultdict
from typing import Dict, List
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse

logger = logging.getLogger("anti_bot_shield")

# -------------------------------------------------------------------
# Whitelist: Major Search Engine & AdSense Crawlers (MUST NEVER BLOCK)
# -------------------------------------------------------------------
ALLOWED_CRAWLERS = [
    "googlebot",
    "bingbot",
    "slurp",
    "duckduckbot",
    "baiduspider",
    "yandexbot",
    "sogou",
    "mediapartners-google",
    "adsbot-google",
    "google-inspectiontool",
    "applebot",
    "twitterbot",
    "facebookexternalhit",
    "linkedinbot",
]

# -------------------------------------------------------------------
# Blacklist: Known Scrapers, Exploit Tools & Headless Automated Bots
# -------------------------------------------------------------------
BLOCKED_USER_AGENTS = [
    "sqlmap",
    "nikto",
    "masscan",
    "scrapy",
    "zgrab",
    "nuclei",
    "dirbuster",
    "petalbot",
    "semrushbot",
    "ahrefsbot",
    "mj12bot",
    "dotbot",
]

# Suspicious raw script agents (blocked if unauthenticated)
SCRIPT_AGENTS = [
    "python-requests",
    "aiohttp",
    "httpx",
    "go-http-client",
    "libwww-perl",
    "wget",
    "curl",
]


class AntiBotMiddleware(BaseHTTPMiddleware):
    def __init__(self, app):
        super().__init__(app)
        # IP -> list of request timestamps in current window
        self.ip_request_history: Dict[str, List[float]] = defaultdict(list)
        # IP -> blocked_until_timestamp
        self.temp_blocked_ips: Dict[str, float] = {}
        # Generation endpoints rate limit: IP -> list of timestamps
        self.gen_request_history: Dict[str, List[float]] = defaultdict(list)

    def _get_client_ip(self, request: Request) -> str:
        """
        Extracts real client IP safely.
        - Supports Azure Front Door / Application Gateway via X-Client-IP or X-Forwarded-For (first entry).
        - Defaults to request.client.host if direct connection or proxy headers absent.
        """
        # Never trust client-supplied forwarding headers here. Uvicorn can
        # normalize request.client only when its proxy is explicitly trusted.
        return request.client.host if request.client else "127.0.0.1"

    async def dispatch(self, request: Request, call_next):
        # 1. Allow health check and root endpoints freely
        path = request.url.path
        if path in ["/", "/docs", "/openapi.json", "/health"]:
            return await call_next(request)

        client_ip = self._get_client_ip(request)
        user_agent = (request.headers.get("user-agent") or "").lower().strip()
        auth_header = request.headers.get("authorization") or request.headers.get("x-admin-token") or ""
        now = time.time()

        # 2. Check if IP is currently under temporary spam block
        if client_ip in self.temp_blocked_ips:
            blocked_until = self.temp_blocked_ips[client_ip]
            if now < blocked_until:
                remaining = int(blocked_until - now)
                logger.warning(f"🚫 Blocked spamming IP rejected: {client_ip} ({remaining}s remaining)")
                return JSONResponse(
                    status_code=429,
                    content={
                        "detail": f"Too Many Requests. Your IP has been temporarily restricted due to excessive rapid requests. Please wait {remaining} seconds."
                    },
                )
            else:
                del self.temp_blocked_ips[client_ip]

        # 3. Always allow verified Search Engine & AdSense Crawlers
        is_crawler = any(crawler in user_agent for crawler in ALLOWED_CRAWLERS)
        if is_crawler:
            return await call_next(request)

        # 4. Check for Malicious Scraper / Attack User-Agents
        if any(bad_ua in user_agent for bad_ua in BLOCKED_USER_AGENTS):
            logger.warning(f"🛡️ Blocked malicious scraper bot: IP={client_ip}, UA={user_agent}")
            return JSONResponse(
                status_code=403,
                content={"detail": "Access forbidden: Automated scraper/bot detected."},
            )

        # 5. Check Script Agents (e.g. curl/requests) without valid Auth
        if not auth_header and any(agent in user_agent for agent in SCRIPT_AGENTS):
            # Allow public API doc explorer, but block automated scraping
            if not path.startswith("/docs") and not path.startswith("/openapi.json"):
                logger.warning(f"🛡️ Blocked unauthorized automated script: IP={client_ip}, UA={user_agent}")
                return JSONResponse(
                    status_code=403,
                    content={"detail": "Access forbidden: Direct script access restricted. Please access via Botock Web App."},
                )

        # 6. Global Sliding Window Rate Limiting (60 requests per 10 seconds per IP)
        window_seconds = 10.0
        max_requests_in_window = 60

        # Clean history older than 10s
        self.ip_request_history[client_ip] = [
            t for t in self.ip_request_history[client_ip] if now - t < window_seconds
        ]

        if len(self.ip_request_history[client_ip]) >= max_requests_in_window:
            # Trigger 5-minute spam block
            self.temp_blocked_ips[client_ip] = now + 300
            logger.warning(f"🚨 Rate limit abuse detected! IP {client_ip} sent > {max_requests_in_window} requests in 10s. Blocked for 5m.")
            return JSONResponse(
                status_code=429,
                content={
                    "detail": "Rate limit exceeded: Rapid burst spamming detected. Your IP is restricted for 5 minutes."
                },
            )

        self.ip_request_history[client_ip].append(now)

        # 7. Heavy AI Generation Endpoints Limiter (Max 6 calls per 60s per IP)
        if path in ["/api/video/generate", "/api/image/generate"]:
            gen_window = 60.0
            max_gens = 6
            self.gen_request_history[client_ip] = [
                t for t in self.gen_request_history[client_ip] if now - t < gen_window
            ]
            if len(self.gen_request_history[client_ip]) >= max_gens:
                logger.warning(f"⚠️ Heavy generation endpoint throttled for IP: {client_ip}")
                return JSONResponse(
                    status_code=429,
                    content={
                        "detail": "Generation rate limit reached: Maximum 6 AI requests per minute. Please wait a moment."
                    },
                )
            self.gen_request_history[client_ip].append(now)

        response: Response = await call_next(request)
        return response
