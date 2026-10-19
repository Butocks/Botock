-- ============================================================
-- Migration 015: Master Tool Registry & Deep Drop-off Telemetry
-- Safe & Idempotent migration for Botock Platform
-- ============================================================

-- 1. Master Tool Registry Table (All 52+ Tools)
CREATE TABLE IF NOT EXISTS public.tool_configs (
    tool_slug TEXT PRIMARY KEY,
    tool_name TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('video', 'image', 'pdf', 'audio', 'other')),
    is_enabled BOOLEAN NOT NULL DEFAULT true,
    access_mode TEXT NOT NULL DEFAULT 'guest' CHECK (access_mode IN ('guest', 'login_users', 'not_allowed')),
    guest_daily_quota INTEGER NOT NULL DEFAULT 10,
    user_daily_quota INTEGER NOT NULL DEFAULT 50,
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Seed all 52 tools from frontend/app/tools/
INSERT INTO public.tool_configs (tool_slug, tool_name, category, is_enabled, access_mode, guest_daily_quota, user_daily_quota)
VALUES
    ('video-generator', 'AI Video Generator Studio', 'video', true, 'login_users', 0, 3),
    ('image-generator', 'AI Image Generator Studio', 'image', true, 'guest', 2, 10),
    ('video-editor', 'Botock Video Editor', 'video', true, 'guest', 5, 50),
    ('reaction-video-maker', 'Reaction Video Maker', 'video', true, 'guest', 5, 25),
    ('video-remove-bg', 'Video Background Remover', 'video', true, 'login_users', 1, 10),
    ('video-auto-reframe', 'Video Auto Reframe', 'video', true, 'guest', 5, 25),
    ('video-compress', 'Video Compressor', 'video', true, 'guest', 10, 50),
    ('video-convert', 'Video Converter', 'video', true, 'guest', 10, 50),
    ('video-trim', 'Video Trimmer', 'video', true, 'guest', 15, 100),
    ('video-to-mp3', 'Video to MP3', 'video', true, 'guest', 15, 100),
    ('video-to-gif', 'Video to GIF', 'video', true, 'guest', 10, 50),
    ('video-mute', 'Video Mute', 'video', true, 'guest', 15, 100),
    ('video-rotate', 'Video Rotate', 'video', true, 'guest', 15, 100),
    ('subtitles', 'AI Subtitles Generator', 'video', true, 'login_users', 1, 10),
    ('image-remove-bg', 'Image Background Remover', 'image', true, 'guest', 5, 30),
    ('image-upscale', 'AI Image Upscaler', 'image', true, 'guest', 3, 20),
    ('image-compress', 'Image Compressor', 'image', true, 'guest', 20, 100),
    ('image-convert', 'Image Converter', 'image', true, 'guest', 20, 100),
    ('image-crop', 'Image Cropper', 'image', true, 'guest', 25, 100),
    ('image-resize', 'Image Resizer', 'image', true, 'guest', 25, 100),
    ('image-rotate', 'Image Rotator', 'image', true, 'guest', 25, 100),
    ('image-filters', 'Image Filters', 'image', true, 'guest', 25, 100),
    ('image-color-picker', 'Image Color Picker', 'image', true, 'guest', 50, 200),
    ('pdf-ai-summarizer', 'PDF AI Summarizer', 'pdf', true, 'login_users', 2, 15),
    ('translate-pdf', 'Translate PDF', 'pdf', true, 'login_users', 2, 15),
    ('pdf-ocr', 'PDF OCR', 'pdf', true, 'guest', 5, 25),
    ('pdf-merge', 'Merge PDF', 'pdf', true, 'guest', 15, 100),
    ('pdf-split', 'Split PDF', 'pdf', true, 'guest', 15, 100),
    ('pdf-compress', 'Compress PDF', 'pdf', true, 'guest', 15, 100),
    ('pdf-to-word', 'PDF to Word', 'pdf', true, 'guest', 10, 50),
    ('word-to-pdf', 'Word to PDF', 'pdf', true, 'guest', 10, 50),
    ('pdf-to-excel', 'PDF to Excel', 'pdf', true, 'guest', 10, 50),
    ('excel-to-pdf', 'Excel to PDF', 'pdf', true, 'guest', 10, 50),
    ('pdf-to-jpg', 'PDF to JPG', 'pdf', true, 'guest', 15, 100),
    ('jpg-to-pdf', 'JPG to PDF', 'pdf', true, 'guest', 15, 100),
    ('pdf-to-powerpoint', 'PDF to PowerPoint', 'pdf', true, 'guest', 10, 50),
    ('pdf-protect', 'Protect PDF', 'pdf', true, 'guest', 15, 100),
    ('pdf-watermark', 'Watermark PDF', 'pdf', true, 'guest', 15, 100),
    ('pdf-page-delete', 'Delete PDF Pages', 'pdf', true, 'guest', 15, 100),
    ('pdf-page-numbers', 'PDF Page Numbers', 'pdf', true, 'guest', 15, 100),
    ('pdf-rotate', 'Rotate PDF', 'pdf', true, 'guest', 15, 100),
    ('organize-pdf', 'Organize PDF', 'pdf', true, 'guest', 15, 100),
    ('crop-pdf', 'Crop PDF', 'pdf', true, 'guest', 15, 100),
    ('repair-pdf', 'Repair PDF', 'pdf', true, 'guest', 10, 50),
    ('html-to-pdf', 'HTML to PDF', 'pdf', true, 'guest', 10, 50),
    ('pdf-forms', 'PDF Forms Filler', 'pdf', true, 'guest', 10, 50),
    ('pdf-to-book', 'PDF to Book', 'pdf', true, 'guest', 10, 50),
    ('audio-enhance', 'AI Audio Enhancer', 'audio', true, 'guest', 5, 30),
    ('voice-changer', 'AI Voice Changer', 'audio', true, 'guest', 5, 30),
    ('audio-trim', 'Audio Trimmer', 'audio', true, 'guest', 20, 100),
    ('audio-volume', 'Audio Volume Booster', 'audio', true, 'guest', 20, 100),
    ('live-data-extractor', 'Live Data Extractor', 'pdf', true, 'login_users', 2, 20)
ON CONFLICT (tool_slug) DO UPDATE SET
    tool_name = EXCLUDED.tool_name,
    category = EXCLUDED.category;

-- 2. Extend Existing tool_usage_log with Drop-off & Deep Telemetry Columns
ALTER TABLE public.tool_usage_log
    ADD COLUMN IF NOT EXISTS session_id TEXT,
    ADD COLUMN IF NOT EXISTS stage_reached TEXT DEFAULT 'init',
    ADD COLUMN IF NOT EXISTS elapsed_ms INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS abandon_reason TEXT,
    ADD COLUMN IF NOT EXISTS error_code TEXT,
    ADD COLUMN IF NOT EXISTS file_size_bytes BIGINT,
    ADD COLUMN IF NOT EXISTS device_type TEXT DEFAULT 'desktop',
    ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'Unknown';

-- Safely drop old status constraint and recreate with extended statuses
DO $$
BEGIN
    ALTER TABLE public.tool_usage_log DROP CONSTRAINT IF EXISTS tool_usage_log_status_check;
    ALTER TABLE public.tool_usage_log ADD CONSTRAINT tool_usage_log_status_check
        CHECK (status IN ('success', 'error', 'started', 'completed', 'failed', 'abandoned_midway'));
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

-- 3. Dedicated Telemetry Logs View or Compatibility Layer
CREATE INDEX IF NOT EXISTS idx_tool_usage_stage ON public.tool_usage_log(stage_reached);
CREATE INDEX IF NOT EXISTS idx_tool_usage_abandon ON public.tool_usage_log(abandon_reason);

-- 4. Row Level Security for tool_configs
ALTER TABLE public.tool_configs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read tool_configs" ON public.tool_configs;
CREATE POLICY "Public can read tool_configs"
    ON public.tool_configs FOR SELECT
    TO anon, authenticated
    USING (true);

DROP POLICY IF EXISTS "Admins can update tool_configs" ON public.tool_configs;
CREATE POLICY "Admins can update tool_configs"
    ON public.tool_configs FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);
