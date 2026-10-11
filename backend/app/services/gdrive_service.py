"""
Google Drive & Botock Free AI Library Service.

Handles:
1. Background upload of AI-generated photos and videos to designated Google Drive folders.
2. Direct generation of public view & high-speed download links.
3. Persistent catalog management for 'botock-library' showcase.
4. Autonomous AI-Agent-ready schema exposure.
5. Strict isolation and crash resilience: works seamlessly with or without Google Drive API keys configured.
"""

import os
import json
import time
import asyncio
import logging
from typing import Optional, Dict, Any, List
import httpx
from app.config import settings

logger = logging.getLogger(__name__)

# Lock for thread-safe catalog updates
_catalog_lock = asyncio.Lock()


class GoogleDriveService:
    def __init__(self):
        self.catalog_path = os.path.realpath(
            os.path.join(
                os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))),
                settings.LIBRARY_MANIFEST_FILE
            )
        )
        self._cached_token: Optional[str] = None
        self._token_expiry: float = 0.0

    # =========================================================================
    # GOOGLE CLOUD SERVICE ACCOUNT AUTHENTICATION
    # =========================================================================
    def is_configured(self) -> bool:
        """Checks if Google Drive credentials and folder IDs are configured."""
        has_creds = bool(settings.GDRIVE_SERVICE_ACCOUNT_JSON or (settings.GDRIVE_SERVICE_ACCOUNT_FILE and os.path.exists(settings.GDRIVE_SERVICE_ACCOUNT_FILE)))
        return settings.GDRIVE_ENABLED and has_creds

    def _get_service_account_info(self) -> Optional[Dict[str, Any]]:
        """Loads Service Account credentials from JSON string or file."""
        if settings.GDRIVE_SERVICE_ACCOUNT_JSON:
            try:
                return json.loads(settings.GDRIVE_SERVICE_ACCOUNT_JSON)
            except Exception as e:
                logger.error(f"[GDrive] Failed to parse GDRIVE_SERVICE_ACCOUNT_JSON: {e}")
                return None

        if settings.GDRIVE_SERVICE_ACCOUNT_FILE and os.path.exists(settings.GDRIVE_SERVICE_ACCOUNT_FILE):
            try:
                with open(settings.GDRIVE_SERVICE_ACCOUNT_FILE, "r", encoding="utf-8") as f:
                    return json.load(f)
            except Exception as e:
                logger.error(f"[GDrive] Failed to read GDRIVE_SERVICE_ACCOUNT_FILE: {e}")
                return None

        return None

    async def get_access_token(self) -> Optional[str]:
        """
        Generates OAuth2 access token via RS256 JWT using Google Service Account credentials.
        Requires zero external Google SDKs (uses pyjwt + cryptography).
        """
        now = time.time()
        if self._cached_token and now < self._token_expiry - 120:
            return self._cached_token

        info = self._get_service_account_info()
        if not info:
            return None

        client_email = info.get("client_email")
        private_key = info.get("private_key")
        token_uri = info.get("token_uri", "https://oauth2.googleapis.com/token")

        if not client_email or not private_key:
            logger.error("[GDrive] Missing client_email or private_key in Service Account credentials.")
            return None

        try:
            import jwt
            payload = {
                "iss": client_email,
                "scope": "https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive",
                "aud": token_uri,
                "exp": int(now + 3600),
                "iat": int(now),
            }

            signed_jwt = jwt.encode(payload, private_key, algorithm="RS256")

            async with httpx.AsyncClient(timeout=15.0) as client:
                resp = await client.post(
                    token_uri,
                    data={
                        "grant_type": "urn:ietf:params:oauth:grant-type:jwt-bearer",
                        "assertion": signed_jwt,
                    },
                )
                if resp.status_code == 200:
                    data = resp.json()
                    self._cached_token = data.get("access_token")
                    self._token_expiry = now + int(data.get("expires_in", 3600))
                    logger.info("[GDrive] Obtained fresh Google Drive OAuth2 access token.")
                    return self._cached_token
                else:
                    logger.error(f"[GDrive] Token exchange failed with status {resp.status_code}: {resp.text}")
                    return None
        except Exception as e:
            logger.exception(f"[GDrive] Error generating service account token: {e}")
            return None

    # =========================================================================
    # GOOGLE DRIVE FILE UPLOAD & PERMISSIONS
    # =========================================================================
    async def upload_file_to_drive(
        self,
        file_path: str,
        file_name: str,
        mime_type: str,
        folder_id: Optional[str] = None
    ) -> Optional[Dict[str, Any]]:
        """
        Uploads a local file to Google Drive using multipart upload and makes it publicly readable.
        """
        if not os.path.exists(file_path):
            logger.warning(f"[GDrive] File to upload does not exist: {file_path}")
            return None

        token = await self.get_access_token()
        if not token:
            logger.warning("[GDrive] Skipping Google Drive upload: Service Account not configured or token failed.")
            return None

        try:
            metadata: Dict[str, Any] = {"name": file_name}
            if folder_id:
                metadata["parents"] = [folder_id]

            file_size = os.path.getsize(file_path)
            logger.info(f"[GDrive] Uploading {file_name} ({file_size} bytes) to folder {folder_id}...")

            with open(file_path, "rb") as f:
                file_bytes = f.read()

            boundary = "-------314159265358979323846"
            delimiter = f"\r\n--{boundary}\r\n"
            close_delim = f"\r\n--{boundary}--"

            body = (
                delimiter
                + "Content-Type: application/json; charset=UTF-8\r\n\r\n"
                + json.dumps(metadata)
                + delimiter
                + f"Content-Type: {mime_type}\r\n\r\n"
            ).encode("utf-8") + file_bytes + close_delim.encode("utf-8")

            upload_url = "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink,webContentLink"
            headers = {
                "Authorization": f"Bearer {token}",
                "Content-Type": f"multipart/related; boundary={boundary}",
            }

            async with httpx.AsyncClient(timeout=60.0) as client:
                upload_resp = await client.post(upload_url, headers=headers, content=body)
                if upload_resp.status_code not in (200, 201):
                    logger.error(f"[GDrive] Upload failed ({upload_resp.status_code}): {upload_resp.text}")
                    return None

                file_info = upload_resp.json()
                file_id = file_info.get("id")

                # Grant 'anyone with link can view' permission
                perm_url = f"https://www.googleapis.com/drive/v3/files/{file_id}/permissions"
                perm_headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
                perm_payload = {"role": "reader", "type": "anyone"}
                await client.post(perm_url, headers=perm_headers, json=perm_payload)

                logger.info(f"[GDrive] Uploaded successfully! File ID: {file_id}")
                return {
                    "file_id": file_id,
                    "webViewLink": file_info.get("webViewLink") or f"https://drive.google.com/file/d/{file_id}/view",
                    "downloadLink": f"https://drive.google.com/uc?export=download&id={file_id}",
                }
        except Exception as e:
            logger.exception(f"[GDrive] Exception during file upload: {e}")
            return None

    # =========================================================================
    # BOTOCK LIBRARY CATALOG (Local + Drive Hybrid Manifest)
    # =========================================================================
    def _read_catalog_sync(self) -> List[Dict[str, Any]]:
        """Reads the library catalog file synchronously."""
        if not os.path.exists(self.catalog_path):
            return []
        try:
            with open(self.catalog_path, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            logger.warning(f"[Library] Failed to read catalog file: {e}")
            return []

    def _write_catalog_sync(self, items: List[Dict[str, Any]]):
        """Writes items to the library catalog file."""
        try:
            with open(self.catalog_path, "w", encoding="utf-8") as f:
                json.dump(items, f, indent=2, ensure_ascii=False)
        except Exception as e:
            logger.error(f"[Library] Failed to write catalog file: {e}")

    async def register_item(
        self,
        generation_id: str,
        media_type: str,  # "photo" | "video"
        file_path: str,
        prompt: str,
        aspect_ratio: str = "16:9",
        title: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Registers a newly generated AI photo or video into the Botock Free Library.
        Triggers Google Drive upload if configured, updating links automatically.
        """
        ext = ".png" if media_type == "photo" else ".mp4"
        clean_title = title or (prompt[:50] + "..." if len(prompt) > 50 else prompt)

        local_preview = f"/api/{media_type}/download/{generation_id}"
        local_download = f"/api/{media_type}/download/{generation_id}"

        item: Dict[str, Any] = {
            "id": generation_id,
            "title": clean_title,
            "prompt": prompt,
            "type": media_type,
            "preview_url": local_preview,
            "download_url": local_download,
            "drive_file_id": None,
            "drive_web_url": None,
            "aspect_ratio": aspect_ratio,
            "license": "Free for Personal & Commercial Use (CC0 / Public Domain)",
            "created_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        }

        async with _catalog_lock:
            items = self._read_catalog_sync()
            # Avoid duplicate registration
            items = [i for i in items if i.get("id") != generation_id]
            items.insert(0, item)
            self._write_catalog_sync(items)

        # Trigger background Drive upload if configured
        if self.is_configured():
            asyncio.create_task(
                self._async_upload_and_update(
                    generation_id=generation_id,
                    file_path=file_path,
                    media_type=media_type,
                    file_name=f"botock_{generation_id}{ext}"
                )
            )

        return item

    async def _async_upload_and_update(
        self,
        generation_id: str,
        file_path: str,
        media_type: str,
        file_name: str
    ):
        """Background worker to upload file to Google Drive and update catalog."""
        try:
            folder_id = settings.GDRIVE_PHOTOS_FOLDER_ID if media_type == "photo" else settings.GDRIVE_VIDEOS_FOLDER_ID
            mime = "image/png" if media_type == "photo" else "video/mp4"

            drive_data = await self.upload_file_to_drive(
                file_path=file_path,
                file_name=file_name,
                mime_type=mime,
                folder_id=folder_id
            )

            if drive_data:
                async with _catalog_lock:
                    items = self._read_catalog_sync()
                    for item in items:
                        if item.get("id") == generation_id:
                            item["drive_file_id"] = drive_data.get("file_id")
                            item["drive_web_url"] = drive_data.get("webViewLink")
                            item["download_url"] = drive_data.get("downloadLink") or item["download_url"]
                            break
                    self._write_catalog_sync(items)
                logger.info(f"[Library] Item {generation_id} synced to Google Drive successfully.")
        except Exception as e:
            logger.exception(f"[Library] Failed to upload item {generation_id} to Drive: {e}")

    async def get_items(
        self,
        media_type: str = "all",
        page: int = 1,
        limit: int = 24,
        search: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Retrieves paginated items from the library catalog with optional search & filtering.
        """
        async with _catalog_lock:
            items = self._read_catalog_sync()

        # Filter by media type
        if media_type in ("photo", "video"):
            items = [i for i in items if i.get("type") == media_type]

        # Filter by search prompt
        if search:
            q = search.lower().strip()
            items = [
                i for i in items
                if q in i.get("prompt", "").lower() or q in i.get("title", "").lower()
            ]

        total = len(items)
        start_idx = (page - 1) * limit
        end_idx = start_idx + limit
        paginated_items = items[start_idx:end_idx]

        return {
            "items": paginated_items,
            "total": total,
            "page": page,
            "limit": limit,
            "has_more": end_idx < total,
            "google_drive_connected": self.is_configured(),
        }

    async def get_item_by_id(self, item_id: str) -> Optional[Dict[str, Any]]:
        """Retrieves a single item by generation ID."""
        async with _catalog_lock:
            items = self._read_catalog_sync()
        for i in items:
            if i.get("id") == item_id:
                return i
        return None

    # =========================================================================
    # AI-AGENT-READY TOOL SCHEMA (Guideline Rule 1)
    # =========================================================================
    @staticmethod
    def get_tool_schema() -> Dict[str, Any]:
        """
        Exposes a standardized schema for autonomous AI assistants to search
        and query the Botock Free AI Library.
        """
        return {
            "name": "botock_ai_library_search",
            "description": (
                "Search and retrieve 100% copyright-free AI-generated stock videos and photos "
                "from the Botock library. These assets are safe for commercial use, Instagram Reels, "
                "TikTok, and YouTube Shorts."
            ),
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {
                        "type": "string",
                        "description": "Keywords or visual theme to search for (e.g. 'cyberpunk city', 'nature sunset', 'futuristic car')."
                    },
                    "media_type": {
                        "type": "string",
                        "enum": ["all", "photo", "video"],
                        "default": "all",
                        "description": "Filter by 'photo', 'video', or 'all'."
                    },
                    "page": {
                        "type": "integer",
                        "default": 1,
                        "description": "Pagination page number."
                    },
                    "limit": {
                        "type": "integer",
                        "default": 12,
                        "description": "Number of assets to return."
                    }
                },
                "required": []
            },
            "output": {
                "type": "object",
                "properties": {
                    "items": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                                "id": {"type": "string"},
                                "title": {"type": "string"},
                                "prompt": {"type": "string"},
                                "type": {"type": "string"},
                                "preview_url": {"type": "string"},
                                "download_url": {"type": "string"},
                                "drive_web_url": {"type": "string"},
                                "license": {"type": "string"}
                            }
                        }
                    },
                    "total": {"type": "integer"}
                }
            }
        }


# Singleton instance
library_service = GoogleDriveService()
