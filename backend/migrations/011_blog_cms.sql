-- Migration: 011_blog_cms.sql
-- Create robust blog CMS architecture

-- 1. Create table for Blog Posts
CREATE TABLE IF NOT EXISTS public.blog_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(255) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    h1 VARCHAR(255),
    content TEXT NOT NULL,
    excerpt TEXT,
    featured_image TEXT,
    parent_id UUID REFERENCES public.blog_posts(id) ON DELETE SET NULL,
    content_cluster VARCHAR(100),
    meta_title VARCHAR(255),
    meta_description TEXT,
    canonical_url VARCHAR(500),
    og_image TEXT,
    is_indexable BOOLEAN DEFAULT true,
    tool_cta VARCHAR(100),
    depth_level INT DEFAULT 0,
    primary_keyword VARCHAR(255),
    search_intent VARCHAR(100),
    status VARCHAR(50) DEFAULT 'DRAFT', -- PLANNED, DRAFTING, REVIEW, READY, PUBLISHED, NEEDS_UPDATE
    author_id UUID, -- If we want to link to users table, but owner is fine for now
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Create Indexes
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON public.blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON public.blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_parent ON public.blog_posts(parent_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_cluster ON public.blog_posts(content_cluster);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON public.blog_posts(published_at);

-- 3. Create table for Redirects (to handle slug changes)
CREATE TABLE IF NOT EXISTS public.blog_redirects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    old_slug VARCHAR(255) UNIQUE NOT NULL,
    new_slug VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_blog_redirects_old ON public.blog_redirects(old_slug);

-- 4. RPCs for Blog CMS (Owner restricted in API, but let's make it secure definer anyway)

CREATE OR REPLACE FUNCTION admin_create_blog(
    p_slug VARCHAR, p_title VARCHAR, p_content TEXT, p_excerpt TEXT, p_status VARCHAR,
    p_h1 VARCHAR DEFAULT NULL, p_featured_image TEXT DEFAULT NULL, p_parent_id UUID DEFAULT NULL,
    p_content_cluster VARCHAR DEFAULT NULL, p_meta_title VARCHAR DEFAULT NULL, p_meta_description TEXT DEFAULT NULL,
    p_canonical_url VARCHAR DEFAULT NULL, p_og_image TEXT DEFAULT NULL, p_is_indexable BOOLEAN DEFAULT true,
    p_tool_cta VARCHAR DEFAULT NULL, p_primary_keyword VARCHAR DEFAULT NULL, p_search_intent VARCHAR DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    new_id UUID;
    actual_parent_depth INT := 0;
BEGIN
    IF p_parent_id IS NOT NULL THEN
        SELECT depth_level INTO actual_parent_depth FROM public.blog_posts WHERE id = p_parent_id;
    END IF;

    INSERT INTO public.blog_posts (
        slug, title, h1, content, excerpt, featured_image, parent_id, content_cluster, meta_title,
        meta_description, canonical_url, og_image, is_indexable, tool_cta, primary_keyword, search_intent,
        status, published_at, depth_level
    ) VALUES (
        p_slug, p_title, p_h1, p_content, p_excerpt, p_featured_image, p_parent_id, p_content_cluster, p_meta_title,
        p_meta_description, p_canonical_url, p_og_image, p_is_indexable, p_tool_cta, p_primary_keyword, p_search_intent,
        p_status, CASE WHEN p_status = 'PUBLISHED' THEN now() ELSE NULL END,
        CASE WHEN p_parent_id IS NULL THEN 0 ELSE actual_parent_depth + 1 END
    ) RETURNING id INTO new_id;

    RETURN new_id;
END;
$$;


CREATE OR REPLACE FUNCTION admin_update_blog(
    p_id UUID, p_slug VARCHAR, p_title VARCHAR, p_content TEXT, p_excerpt TEXT, p_status VARCHAR,
    p_h1 VARCHAR DEFAULT NULL, p_featured_image TEXT DEFAULT NULL, p_parent_id UUID DEFAULT NULL,
    p_content_cluster VARCHAR DEFAULT NULL, p_meta_title VARCHAR DEFAULT NULL, p_meta_description TEXT DEFAULT NULL,
    p_canonical_url VARCHAR DEFAULT NULL, p_og_image TEXT DEFAULT NULL, p_is_indexable BOOLEAN DEFAULT true,
    p_tool_cta VARCHAR DEFAULT NULL, p_primary_keyword VARCHAR DEFAULT NULL, p_search_intent VARCHAR DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    old_slug VARCHAR;
    actual_parent_depth INT := 0;
BEGIN
    SELECT slug INTO old_slug FROM public.blog_posts WHERE id = p_id;
    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;

    IF p_parent_id IS NOT NULL THEN
        SELECT depth_level INTO actual_parent_depth FROM public.blog_posts WHERE id = p_parent_id;
    END IF;

    -- If slug changed, record redirect
    IF old_slug != p_slug THEN
        INSERT INTO public.blog_redirects (old_slug, new_slug) VALUES (old_slug, p_slug)
        ON CONFLICT (old_slug) DO UPDATE SET new_slug = EXCLUDED.new_slug, created_at = now();
    END IF;

    UPDATE public.blog_posts SET
        slug = p_slug,
        title = p_title,
        h1 = p_h1,
        content = p_content,
        excerpt = p_excerpt,
        featured_image = p_featured_image,
        parent_id = p_parent_id,
        content_cluster = p_content_cluster,
        meta_title = p_meta_title,
        meta_description = p_meta_description,
        canonical_url = p_canonical_url,
        og_image = p_og_image,
        is_indexable = p_is_indexable,
        tool_cta = p_tool_cta,
        primary_keyword = p_primary_keyword,
        search_intent = p_search_intent,
        status = p_status,
        published_at = CASE WHEN p_status = 'PUBLISHED' AND published_at IS NULL THEN now() ELSE published_at END,
        depth_level = CASE WHEN p_parent_id IS NULL THEN 0 ELSE actual_parent_depth + 1 END,
        updated_at = now()
    WHERE id = p_id;

    RETURN TRUE;
END;
$$;

CREATE OR REPLACE FUNCTION admin_delete_blog(p_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    DELETE FROM public.blog_posts WHERE id = p_id;
    RETURN FOUND;
END;
$$;

-- View function
CREATE OR REPLACE FUNCTION get_blog_posts(p_status VARCHAR DEFAULT NULL)
RETURNS SETOF public.blog_posts
LANGUAGE sql
SECURITY DEFINER
AS $$
    SELECT * FROM public.blog_posts
    WHERE (p_status IS NULL OR status = p_status)
    ORDER BY created_at DESC;
$$;
