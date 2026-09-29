"""Private Azure Blob access. Only the Azure control plane has these credentials."""

import asyncio

from app.config import settings


def _container_client():
    if not settings.AZURE_STORAGE_CONNECTION_STRING:
        raise RuntimeError("AZURE_STORAGE_CONNECTION_STRING is required for distributed workers")
    try:
        from azure.storage.blob import BlobServiceClient
    except ImportError as exc:
        raise RuntimeError("Install backend requirements before enabling Azure Blob storage") from exc
    return BlobServiceClient.from_connection_string(
        settings.AZURE_STORAGE_CONNECTION_STRING
    ).get_container_client(settings.AZURE_VIDEO_CONTAINER)


async def upload_video(object_key: str, content: bytes) -> None:
    def upload() -> None:
        container = _container_client()
        container.create_container(exist_ok=True)
        container.upload_blob(object_key, content, overwrite=True, content_type="video/mp4")
    await asyncio.to_thread(upload)


async def download_video(object_key: str) -> bytes:
    def download() -> bytes:
        return _container_client().get_blob_client(object_key).download_blob().readall()
    return await asyncio.to_thread(download)
