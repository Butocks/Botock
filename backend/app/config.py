import os
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    PROJECT_NAME: str = "Botock AI Creative Suite"
    SESSION_PATH: str = "session/flow_session.json"
    VIDEOS_DIR: str = "generated_videos"
    IMAGES_DIR: str = "generated_images"
    DEBUG_DIR: str = "generated_videos/debug"

    # Google Account Credentials for automated Flow login
    GOOGLE_EMAIL: str = ""
    GOOGLE_PASSWORD: str = ""

    # Groq API Key & Security
    GROQ_API_KEY: str = ""
    SECRET_KEY: str = ""
    SUPABASE_JWT_SECRET: str = ""

    # Concurrency & Operational Limits
    MAX_BROWSER_INSTANCES: int = 2
    MAX_FFMPEG_WORKERS: int = 1
    FREE_DAILY_VIDEO_LIMIT: int = 3
    FREE_DAILY_IMAGE_LIMIT: int = 5
    FREE_RETENTION_HOURS: int = 24
    PRO_RETENTION_DAYS: int = 30

    # Breakage Alert Webhook (Discord / Slack)
    ALERT_WEBHOOK_URL: str = ""

    # Optional Proxy Support (e.g. residential proxy)
    PROXY_SERVER: str = ""
    PROXY_USER: str = ""
    PROXY_PASS: str = ""

    # Session auto-refresh: max age in hours before re-login (30 days)
    SESSION_MAX_AGE_HOURS: int = 720

    # Video generation timeouts (seconds)
    VIDEO_GEN_TIMEOUT: int = 600  # 10 minutes max wait
    PAGE_LOAD_TIMEOUT: int = 60

settings = Settings()

os.makedirs(settings.VIDEOS_DIR, exist_ok=True)
os.makedirs(settings.IMAGES_DIR, exist_ok=True)
os.makedirs(settings.DEBUG_DIR, exist_ok=True)
os.makedirs(os.path.dirname(settings.SESSION_PATH) or "session", exist_ok=True)
