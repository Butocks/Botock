from fastapi import APIRouter, Depends, HTTPException
from typing import Optional
from pydantic import BaseModel
from app.config import settings
from app.middleware.auth import get_current_user, _rpc

# ────────────────────────────────────────────────────────────
# Two routers:
#   cms_router   → /api/cms/*  (owner-only CRUD)
#   pub_router   → /api/public/*  (public read, published only)
# ────────────────────────────────────────────────────────────
cms_router = APIRouter(prefix="/api/cms", tags=["BlogCMS"])
pub_router = APIRouter(prefix="/api/public", tags=["PublicBlog"])

# ── backwards-compat alias so main.py can still `from app.routers import blog_cms; app.include_router(blog_cms.router)`
# We'll expose a merged `router` below.

def require_owner(user: dict = Depends(get_current_user)):
    """Verifies that the user is the owner/super-admin."""
    email = user.get("email", "").strip().lower()
    allowed_admins = [e.strip().lower() for e in settings.ADMIN_EMAILS.split(",") if e.strip()]
    app_meta = user.get("payload", {}).get("app_metadata", {})
    role = app_meta.get("role", "")
    is_owner = role in ["owner", "super_admin"] or (email in allowed_admins)
    if not is_owner:
        raise HTTPException(status_code=403, detail="Forbidden. Owner or super-admin access required.")
    return user


# ── Pydantic models ─────────────────────────────────────────

class BlogPostCreate(BaseModel):
    title: str
    slug: str
    content: str
    excerpt: Optional[str] = None
    status: str = "DRAFT"
    h1: Optional[str] = None
    featured_image: Optional[str] = None
    parent_id: Optional[str] = None
    content_cluster: Optional[str] = None
    meta_title: Optional[str] = None
    meta_description: Optional[str] = None
    canonical_url: Optional[str] = None
    og_image: Optional[str] = None
    is_indexable: bool = True
    tool_cta: Optional[str] = None
    primary_keyword: Optional[str] = None
    search_intent: Optional[str] = None


# ── Owner-only CMS endpoints (/api/cms/*) ───────────────────

@cms_router.get("/posts")
async def get_all_posts(status: Optional[str] = None, _owner: dict = Depends(require_owner)):
    posts = await _rpc("get_blog_posts", {"p_status": status})
    return {"posts": posts or []}


@cms_router.post("/posts")
async def create_post(post: BlogPostCreate, _owner: dict = Depends(require_owner)):
    existing = await _rpc("get_blog_posts", {})
    existing = existing or []
    if any(p.get("slug") == post.slug for p in existing):
        raise HTTPException(status_code=400, detail="A post with this slug already exists.")
    new_id = await _rpc("admin_create_blog", {
        "p_slug": post.slug, "p_title": post.title, "p_content": post.content,
        "p_excerpt": post.excerpt, "p_status": post.status, "p_h1": post.h1,
        "p_featured_image": post.featured_image, "p_parent_id": post.parent_id,
        "p_content_cluster": post.content_cluster, "p_meta_title": post.meta_title,
        "p_meta_description": post.meta_description, "p_canonical_url": post.canonical_url,
        "p_og_image": post.og_image, "p_is_indexable": post.is_indexable,
        "p_tool_cta": post.tool_cta, "p_primary_keyword": post.primary_keyword,
        "p_search_intent": post.search_intent
    })
    return {"success": True, "id": new_id}


@cms_router.put("/posts/{post_id}")
async def update_post(post_id: str, post: BlogPostCreate, _owner: dict = Depends(require_owner)):
    success = await _rpc("admin_update_blog", {
        "p_id": post_id, "p_slug": post.slug, "p_title": post.title,
        "p_content": post.content, "p_excerpt": post.excerpt, "p_status": post.status,
        "p_h1": post.h1, "p_featured_image": post.featured_image,
        "p_parent_id": post.parent_id, "p_content_cluster": post.content_cluster,
        "p_meta_title": post.meta_title, "p_meta_description": post.meta_description,
        "p_canonical_url": post.canonical_url, "p_og_image": post.og_image,
        "p_is_indexable": post.is_indexable, "p_tool_cta": post.tool_cta,
        "p_primary_keyword": post.primary_keyword, "p_search_intent": post.search_intent
    })
    if not success:
        raise HTTPException(status_code=404, detail="Post not found")
    return {"success": True}


@cms_router.delete("/posts/{post_id}")
async def delete_post(post_id: str, _owner: dict = Depends(require_owner)):
    success = await _rpc("admin_delete_blog", {"p_id": post_id})
    if not success:
        raise HTTPException(status_code=404, detail="Post not found")
    return {"success": True}


# ── Public read-only endpoints (/api/public/blogs/*) ────────
# Replaces the old flat-file based endpoints that were in auth_otp.py

@pub_router.get("/blogs")
async def get_public_blogs():
    """Returns all PUBLISHED blog posts for public display."""
    posts = await _rpc("get_blog_posts", {"p_status": "PUBLISHED"})
    return posts or []


@pub_router.get("/blogs/{slug}")
async def get_public_blog(slug: str):
    """Returns a single PUBLISHED blog post by slug with parent/children context."""
    posts = await _rpc("get_blog_posts", {})
    posts = posts or []
    
    target_post = None
    for p in posts:
        if p.get("slug") == slug:
            if p.get("status") != "PUBLISHED":
                raise HTTPException(status_code=404, detail="Blog post not found")
            target_post = p
            break
            
    if not target_post:
        raise HTTPException(status_code=404, detail="Blog post not found")

    # Map fields
    target_post["id"] = target_post["slug"]
    target_post["date"] = (target_post.get("published_at") or target_post.get("created_at") or "").split("T")[0]
    target_post["author"] = "Botock Editorial"
    
    # 1. Parent/Breadcrumb logic
    parent_post = None
    if target_post.get("parent_id"):
        parent_post = next((p for p in posts if p["id"] == target_post["parent_id"] and p.get("status") == "PUBLISHED"), None)
        if parent_post:
            target_post["parent"] = {"title": parent_post["title"], "slug": parent_post["slug"]}
            
    # 2. Children (sub-pages)
    children = [
        {"title": p["title"], "slug": p["slug"], "excerpt": p.get("excerpt")} 
        for p in posts 
        if p.get("parent_id") == target_post["id"] and p.get("status") == "PUBLISHED"
    ]
    target_post["children"] = children
    
    # 3. Related (same cluster or sibling)
    cluster = target_post.get("content_cluster")
    related = []
    if cluster:
        related = [
            {"title": p["title"], "slug": p["slug"]} 
            for p in posts 
            if p.get("content_cluster") == cluster and p["id"] != target_post["id"] and p.get("status") == "PUBLISHED"
        ][:5]
    elif parent_post:
        related = [
            {"title": p["title"], "slug": p["slug"]} 
            for p in posts 
            if p.get("parent_id") == parent_post["id"] and p["id"] != target_post["id"] and p.get("status") == "PUBLISHED"
        ][:5]
        
    target_post["related"] = related

    return target_post


@pub_router.get("/blog-redirects/{old_slug}")
async def check_blog_redirect(old_slug: str):
    """Check if a slug has been redirected. Returns new_slug or 404."""
    try:
        import httpx
        from app.middleware.auth import _service_headers
        async with httpx.AsyncClient(timeout=5.0) as client:
            resp = await client.get(
                f"{settings.SUPABASE_URL.rstrip('/')}/rest/v1/blog_redirects",
                headers=_service_headers(),
                params={"old_slug": f"eq.{old_slug}", "select": "new_slug"}
            )
        if resp.status_code == 200:
            rows = resp.json()
            if rows:
                return {"new_slug": rows[0]["new_slug"]}
    except Exception:
        pass
    raise HTTPException(status_code=404, detail="No redirect found")
