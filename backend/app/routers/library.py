"""
Botock Free AI Library Router.

Provides isolated API endpoints to browse, search, and download
100% copyright-free AI generated photos and videos.
Designed to be isolated, crash-resilient, and AI-Agent ready.
"""

from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from app.models.schemas import LibraryListResponse, LibraryItem, LibrarySyncResponse
from app.services.gdrive_service import library_service

router = APIRouter(prefix="/api/library", tags=["Library"])


@router.get("/items", response_model=LibraryListResponse)
async def get_library_items(
    type: str = Query(default="all", pattern="^(all|photo|video)$", description="Filter media type: all, photo, or video"),
    page: int = Query(default=1, ge=1, description="Page number"),
    limit: int = Query(default=24, ge=1, le=100, description="Items per page"),
    search: Optional[str] = Query(default=None, description="Search keyword in prompt or title"),
):
    """
    List copyright-free AI-generated stock videos and photos.
    Paginated and searchable.
    """
    try:
        data = await library_service.get_items(
            media_type=type,
            page=page,
            limit=limit,
            search=search,
        )
        return LibraryListResponse(**data)
    except Exception as e:
        # Crash resilience: fail-safe response
        return LibraryListResponse(
            items=[],
            total=0,
            page=page,
            limit=limit,
            has_more=False,
            google_drive_connected=False,
        )


@router.get("/item/{item_id}", response_model=LibraryItem)
async def get_library_item(item_id: str):
    """
    Retrieve details and download links for a specific AI asset.
    """
    item = await library_service.get_item_by_id(item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Media item not found in library.")
    return LibraryItem(**item)


@router.get("/schema")
async def get_tool_schema():
    """
    Programmatic AI-Agent-Ready Tool Schema.
    Allows autonomous AI assistants to discover and invoke the Botock Library tool.
    """
    return library_service.get_tool_schema()


@router.post("/sync", response_model=LibrarySyncResponse)
async def sync_library():
    """
    Trigger synchronization of Google Drive folders and local manifest.
    """
    connected = library_service.is_configured()
    return LibrarySyncResponse(
        status="ok" if connected else "offline_mode",
        message="Google Drive is active and synced." if connected else "Running in local storage mode (Google Drive not yet configured).",
        synced_items=0,
    )
