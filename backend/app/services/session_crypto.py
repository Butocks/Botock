import os
import json
import base64
import hashlib
import logging
from cryptography.fernet import Fernet
from app.config import settings

logger = logging.getLogger(__name__)

def _get_fernet_instance():
    """
    Derives a cryptographically strong 32-byte Fernet key from environment secrets.
    CRITICAL SECURITY IMPROVEMENT:
    - Never writes the encryption key to a plaintext file on disk.
    - Uses explicit SESSION_ENCRYPTION_KEY from env / Azure Key Vault if provided.
    - Fallback: Deterministically derives from SUPABASE_JWT_SECRET or SECRET_KEY via SHA256 KDF.
    """
    explicit_key = (settings.SESSION_ENCRYPTION_KEY or os.getenv("SESSION_ENCRYPTION_KEY", "")).strip()
    if explicit_key:
        try:
            return Fernet(explicit_key.encode())
        except Exception as e:
            logger.warning(f"Invalid SESSION_ENCRYPTION_KEY format, falling back to derived key: {e}")

    # Fallback KDF using environment secret
    base_secret = settings.SUPABASE_JWT_SECRET or settings.SECRET_KEY or settings.ADMIN_LOGIN_SECRET
    if not base_secret:
        raise RuntimeError("SESSION_ENCRYPTION_KEY or an application secret is required to protect Flow sessions")
    derived_32_bytes = hashlib.sha256(base_secret.encode()).digest()
    fernet_key = base64.urlsafe_b64encode(derived_32_bytes)
    return Fernet(fernet_key)

try:
    _fernet = _get_fernet_instance()
except Exception as e:
    logger.error(f"Failed to initialize Fernet crypto: {e}")
    _fernet = None

def save_encrypted_session(state_dict: dict, path: str):
    """Encrypts Playwright browser storage state (cookies/tokens) before writing to disk."""
    directory = os.path.dirname(path) or "session"
    os.makedirs(directory, mode=0o700, exist_ok=True)
    try:
        os.chmod(directory, 0o700)
    except OSError:
        logger.warning("Could not restrict session directory permissions: %s", directory)
    if _fernet:
        try:
            payload = json.dumps(state_dict).encode("utf-8")
            encrypted = _fernet.encrypt(payload)
            with open(path, "wb") as f:
                f.write(encrypted)
            os.chmod(path, 0o600)
            logger.info(f"🔒 Playwright session safely encrypted and saved to {path}")
            return
        except Exception as e:
            logger.error(f"Failed to encrypt session: {e}")

    raise RuntimeError("Refusing to write an unencrypted Flow session")

def load_encrypted_session(path: str) -> dict:
    """Reads and decrypts storage state from disk; supports backward-compatible plain JSON."""
    if not os.path.exists(path):
        return None
    try:
        with open(path, "rb") as f:
            content = f.read()

        # Fernet ciphertexts start with b"gAAAAA".
        if _fernet and content.startswith(b"gAAAAA"):
            decrypted = _fernet.decrypt(content)
            return json.loads(decrypted.decode("utf-8"))

        # If it is plain JSON, parse it and auto-migrate to encrypted format!
        if content.strip().startswith(b"{"):
            try:
                data = json.loads(content.decode("utf-8"))
                if data.get("cookies"):
                    logger.info("Migrating plain JSON Flow session to encrypted format...")
                    save_encrypted_session(data, path)
                    return data
            except Exception as e_json:
                logger.warning(f"Failed to parse plain JSON session: {e_json}")

        logger.error("Refusing to load an unencrypted or unsupported Flow session: %s", path)
        return None
    except Exception as e:
        logger.error(f"Error loading session from {path}: {e}")
        return None
