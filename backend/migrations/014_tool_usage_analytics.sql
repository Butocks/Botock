-- ============================================================
-- Migration 014: Tool Usage Analytics Schema Alignment
-- Run in Supabase SQL Editor (Fail-Safe & Idempotent)
-- ============================================================

-- 1. Ensure tool_usage_log table exists and has all required tracking columns
CREATE TABLE IF NOT EXISTS public.tool_usage_log (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_id       TEXT NOT NULL CHECK (char_length(tool_id) BETWEEN 1 AND 100),
  tool_name     TEXT,
  user_id       UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status        TEXT NOT NULL DEFAULT 'success' CHECK (status IN ('success', 'error', 'started')),
  error_message TEXT,
  used_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add columns if table already existed without them
ALTER TABLE public.tool_usage_log
  ADD COLUMN IF NOT EXISTS tool_name TEXT,
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'success',
  ADD COLUMN IF NOT EXISTS error_message TEXT;

-- 2. Indexes for analytics queries
CREATE INDEX IF NOT EXISTS idx_tool_usage_tool_id
  ON public.tool_usage_log(tool_id, used_at DESC);
CREATE INDEX IF NOT EXISTS idx_tool_usage_status
  ON public.tool_usage_log(status, used_at DESC);
CREATE INDEX IF NOT EXISTS idx_tool_usage_user_id
  ON public.tool_usage_log(user_id, used_at DESC);

-- 3. Row Level Security: Allow client logging, restrict reading to service_role
ALTER TABLE public.tool_usage_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow inserts on tool_usage_log" ON public.tool_usage_log;
CREATE POLICY "Allow inserts on tool_usage_log"
  ON public.tool_usage_log FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow select on tool_usage_log for service_role" ON public.tool_usage_log;
CREATE POLICY "Allow select on tool_usage_log for service_role"
  ON public.tool_usage_log FOR SELECT
  TO service_role
  USING (true);

-- 4. Fail-Safe handling of tool_usage (Table vs View)
-- If tool_usage already exists as a TABLE, preserve its data and add required columns.
-- If not a table, create it as a VIEW pointing to tool_usage_log.
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'public' AND c.relname = 'tool_usage' AND c.relkind = 'r'
    ) THEN
        ALTER TABLE public.tool_usage ADD COLUMN IF NOT EXISTS tool_id TEXT;
        ALTER TABLE public.tool_usage ADD COLUMN IF NOT EXISTS tool_name TEXT;
        ALTER TABLE public.tool_usage ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
        ALTER TABLE public.tool_usage ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'success';
        ALTER TABLE public.tool_usage ADD COLUMN IF NOT EXISTS error_message TEXT;
        ALTER TABLE public.tool_usage ADD COLUMN IF NOT EXISTS used_at TIMESTAMPTZ NOT NULL DEFAULT now();

        ALTER TABLE public.tool_usage ENABLE ROW LEVEL SECURITY;

        DROP POLICY IF EXISTS "Allow inserts on tool_usage" ON public.tool_usage;
        CREATE POLICY "Allow inserts on tool_usage"
            ON public.tool_usage FOR INSERT
            TO anon, authenticated
            WITH CHECK (true);

        DROP POLICY IF EXISTS "Allow select on tool_usage for service_role" ON public.tool_usage;
        CREATE POLICY "Allow select on tool_usage for service_role"
            ON public.tool_usage FOR SELECT
            TO service_role
            USING (true);
    ELSE
        EXECUTE 'CREATE OR REPLACE VIEW public.tool_usage AS SELECT id, tool_id, tool_name, user_id, status, error_message, used_at FROM public.tool_usage_log';
    END IF;
END $$;

-- 5. Updated tool usage summary view (Drop first to allow column list evolution)
DROP VIEW IF EXISTS public.tool_usage_summary CASCADE;
CREATE VIEW public.tool_usage_summary AS
SELECT
  tool_id,
  COALESCE(tool_name, tool_id) AS tool_name,
  COUNT(*) FILTER (WHERE status = 'success') AS success_count,
  COUNT(*) FILTER (WHERE status = 'error') AS error_count,
  COUNT(*) AS total_uses,
  COUNT(DISTINCT user_id) AS unique_users,
  MAX(used_at) AS last_used_at
FROM public.tool_usage_log
GROUP BY tool_id, tool_name
ORDER BY total_uses DESC;

SELECT 'Migration 014 applied successfully' AS result;
