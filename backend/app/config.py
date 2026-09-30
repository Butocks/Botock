import os
from pydantic_settings import BaseSettings, SettingsConfigDict

_backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
_env_path = os.path.join(_backend_dir, ".env")

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=_env_path, extra="ignore")

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
    SESSION_ENCRYPTION_KEY: str = ""
    SUPABASE_JWT_SECRET: str = ""
    SUPABASE_SERVICE_ROLE_KEY: str = ""
    SUPABASE_ANON_KEY: str = ""
    SUPABASE_URL: str = "https://bumojafxwqukycgahmmd.supabase.co"

    # Admin Security & Auth
    ADMIN_EMAILS: str = ""
    ADMIN_LOGIN_SECRET: str = ""
    ADMIN_OTP_EXPIRY_MINUTES: int = 10
    ADMIN_MAX_OTP_CYCLES: int = 3

    # SMTP / Email Settings (Default: Zoho Mail for info@botock.app)
    SMTP_HOST: str = "smtppro.zoho.com"
    SMTP_PORT: int = 587
    SMTP_USER: str = "info@botock.app"
    SMTP_PASSWORD: str = ""
    SMTP_FROM_EMAIL: str = "Botock <info@botock.app>"
    SMTP_USE_SSL: bool = False  # Set True if using port 465, False for port 587 (STARTTLS)

    # Concurrency & Operational Limits
    MAX_BROWSER_INSTANCES: int = 2
    MAX_FFMPEG_WORKERS: int = 1
    FREE_DAILY_CREDITS: int = 50
    VIDEO_CREDIT_COST: int = 15
    IMAGE_CREDIT_COST: int = 5
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

    # Distributed worker control plane. Keep this disabled until the SQL
    # migration has been applied and Azure Blob Storage is configured.
    DISTRIBUTED_QUEUE_ENABLED: bool = False
    QUEUE_DATABASE_URL: str = ""
    MAX_PENDING_VIDEO_JOBS: int = 50
    WORKER_LEASE_SECONDS: int = 900
    WORKER_HEARTBEAT_SECONDS: int = 30
    MAX_JOB_ATTEMPTS: int = 2
    # JSON mapping: {"worker-id": {"token_hash": "sha256 hex", "account_id": "flow-01"}}
    WORKER_TOKENS_JSON: str = "{}"

    # Azure control plane only. Workers must never receive this value.
    AZURE_STORAGE_CONNECTION_STRING: str = ""
    AZURE_VIDEO_CONTAINER: str = "botock-videos"
    MAX_WORKER_UPLOAD_BYTES: int = 100_000_000
    # Set true only for a platform where Chromium sandboxing is impossible.
    # The secure default is false.
    CHROMIUM_NO_SANDBOX: bool = False

settings = Settings()

os.makedirs(settings.VIDEOS_DIR, exist_ok=True)
os.makedirs(settings.IMAGES_DIR, exist_ok=True)
os.makedirs(settings.DEBUG_DIR, exist_ok=True)
os.makedirs(os.path.dirname(settings.SESSION_PATH) or "session", exist_ok=True)
