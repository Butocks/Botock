-- =========================================================================
-- MIGRATION 012: FLOW CREDITS POOL, VIP ACCESS & GENERATION LIMITS
-- Execute this script in the Supabase SQL Editor.
-- =========================================================================

-- =========================================================================
-- 1. PURANE VIEWS, TABLES AUR FUNCTIONS KO SAFELY DROP KAREIN
-- =========================================================================
DROP VIEW IF EXISTS public.admin_user_overview CASCADE;
DROP TABLE IF EXISTS public.user_subscriptions CASCADE;
DROP TABLE IF EXISTS public.service_plans CASCADE;
DROP TABLE IF EXISTS public.user_tool_rewards CASCADE;
DROP TABLE IF EXISTS public.user_credits CASCADE;
DROP FUNCTION IF EXISTS public.consume_video_credits CASCADE;
DROP FUNCTION IF EXISTS public.get_user_credit_balance CASCADE;
DROP FUNCTION IF EXISTS public.claim_tool_reward CASCADE;

-- =========================================================================
-- 2. USER_PROFILES TABLE (COLUMNS AUR INDEXES)
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.user_profiles (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT
);

-- Zaroori columns add karein agar pehle se nahi hain
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user';
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS is_restricted BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS is_unlimited BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS custom_daily_video_limit INT DEFAULT NULL;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS custom_monthly_video_limit INT DEFAULT NULL;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS custom_daily_image_limit INT DEFAULT NULL;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS custom_monthly_image_limit INT DEFAULT NULL;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now();
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ DEFAULT now();

CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON public.user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON public.user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_unlimited ON public.user_profiles(is_unlimited);

-- Auto-create profile trigger on new auth user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, email, full_name, avatar_url, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''),
    COALESCE(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture', ''),
    COALESCE(new.raw_app_meta_data->>'role', 'user')
  )
  ON CONFLICT (user_id) DO UPDATE SET
    email = EXCLUDED.email,
    last_login_at = now();
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Backfill auth.users into user_profiles
INSERT INTO public.user_profiles (user_id, email, full_name, avatar_url, role)
SELECT
  id,
  email,
  COALESCE(raw_user_meta_data->>'full_name', raw_user_meta_data->>'name', ''),
  COALESCE(raw_user_meta_data->>'avatar_url', raw_user_meta_data->>'picture', ''),
  COALESCE(raw_app_meta_data->>'role', 'user')
FROM auth.users
ON CONFLICT (user_id) DO NOTHING;


-- =========================================================================
-- 3. GENERATION LOGS (TRACK EVERY VIDEO & IMAGE GENERATION)
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.generation_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    guest_ip TEXT,
    generation_type TEXT NOT NULL CHECK (generation_type IN ('video', 'image')),
    model TEXT NOT NULL,
    prompt TEXT,
    status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('queued', 'running', 'completed', 'failed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_generation_logs_user_date ON public.generation_logs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_generation_logs_guest_date ON public.generation_logs(guest_ip, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_generation_logs_type_date ON public.generation_logs(generation_type, created_at DESC);


-- =========================================================================
-- 4. SYSTEM_SETTINGS TABLE (FLOW POOL, RATIOS & ADMIN CONTROLS)
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.system_settings (
    id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1)
);

ALTER TABLE public.system_settings ADD COLUMN IF NOT EXISTS flow_monthly_credit_pool INT NOT NULL DEFAULT 5000;
ALTER TABLE public.system_settings ADD COLUMN IF NOT EXISTS guest_video_cost_credits INT NOT NULL DEFAULT 4;
ALTER TABLE public.system_settings ADD COLUMN IF NOT EXISTS user_video_cost_credits INT NOT NULL DEFAULT 6;
ALTER TABLE public.system_settings ADD COLUMN IF NOT EXISTS unlimited_mode BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE public.system_settings ADD COLUMN IF NOT EXISTS user_daily_video_limit INT NOT NULL DEFAULT 0;
ALTER TABLE public.system_settings ADD COLUMN IF NOT EXISTS user_monthly_video_limit INT NOT NULL DEFAULT 0;
ALTER TABLE public.system_settings ADD COLUMN IF NOT EXISTS user_daily_image_limit INT NOT NULL DEFAULT 0;
ALTER TABLE public.system_settings ADD COLUMN IF NOT EXISTS user_monthly_image_limit INT NOT NULL DEFAULT 0;
ALTER TABLE public.system_settings ADD COLUMN IF NOT EXISTS global_daily_video_limit INT NOT NULL DEFAULT 500;
ALTER TABLE public.system_settings ADD COLUMN IF NOT EXISTS global_daily_image_limit INT NOT NULL DEFAULT 2000;
ALTER TABLE public.system_settings ADD COLUMN IF NOT EXISTS guest_generation_enabled BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE public.system_settings ADD COLUMN IF NOT EXISTS guest_daily_video_limit INT NOT NULL DEFAULT 1;
ALTER TABLE public.system_settings ADD COLUMN IF NOT EXISTS guest_daily_image_limit INT NOT NULL DEFAULT 3;
ALTER TABLE public.system_settings ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

INSERT INTO public.system_settings (id, flow_monthly_credit_pool, guest_video_cost_credits, user_video_cost_credits, unlimited_mode)
VALUES (1, 5000, 4, 6, true)
ON CONFLICT (id) DO UPDATE SET
    flow_monthly_credit_pool = EXCLUDED.flow_monthly_credit_pool,
    guest_video_cost_credits = EXCLUDED.guest_video_cost_credits,
    user_video_cost_credits = EXCLUDED.user_video_cost_credits;


-- =========================================================================
-- 5. FUNCTION: CHECK_GENERATION_LIMIT (VIP BYPASS & AUTOMATIC CUTOFF)
-- =========================================================================
CREATE OR REPLACE FUNCTION public.check_generation_limit(
    p_user_id UUID DEFAULT NULL,
    p_guest_ip TEXT DEFAULT NULL,
    p_type TEXT DEFAULT 'video'
)
RETURNS JSON AS $$
DECLARE
    v_settings RECORD;
    v_profile RECORD;
    v_daily_count INT;
    v_monthly_count INT;
    v_daily_limit INT;
    v_monthly_limit INT;
BEGIN
    SELECT * INTO v_settings FROM public.system_settings WHERE id = 1;

    -- 1. GUEST USER CHECK
    IF p_user_id IS NULL THEN
        IF NOT COALESCE(v_settings.guest_generation_enabled, true) THEN
            RETURN json_build_object('allowed', false, 'reason', 'Service temporarily unavailable.');
        END IF;

        IF p_type = 'video' THEN
            v_daily_limit := COALESCE(v_settings.guest_daily_video_limit, 1);
        ELSE
            v_daily_limit := COALESCE(v_settings.guest_daily_image_limit, 3);
        END IF;

        SELECT COUNT(*) INTO v_daily_count
        FROM public.generation_logs
        WHERE guest_ip = p_guest_ip 
          AND generation_type = p_type
          AND created_at >= (now() - interval '24 hours');

        IF v_daily_limit > 0 AND v_daily_count >= v_daily_limit THEN
            RETURN json_build_object(
                'allowed', false, 
                'reason', 'Service temporarily unavailable. Quota full for today. Please try again tomorrow.'
            );
        END IF;

        RETURN json_build_object('allowed', true, 'used_today', v_daily_count, 'limit_today', v_daily_limit);
    END IF;

    -- 2. LOGGED-IN USER CHECK
    SELECT * INTO v_profile FROM public.user_profiles WHERE user_id = p_user_id;

    -- Banned / Restricted check
    IF v_profile.is_restricted THEN
        RETURN json_build_object('allowed', false, 'reason', 'Your account has been restricted by the administrator.');
    END IF;

    -- VIP / SPECIAL USER: Bypasses ALL daily and monthly limits
    IF v_profile.is_unlimited THEN
        RETURN json_build_object('allowed', true, 'is_vip', true);
    END IF;

    -- Unlimited mode check (if platform is in unlimited mode and user has no custom limit)
    IF v_settings.unlimited_mode AND (v_profile.custom_daily_video_limit IS NULL) THEN
        RETURN json_build_object('allowed', true, 'unlimited', true);
    END IF;

    -- Standard User Limits
    IF p_type = 'video' THEN
        v_daily_limit := COALESCE(v_profile.custom_daily_video_limit, v_settings.user_daily_video_limit, 0);
        v_monthly_limit := COALESCE(v_profile.custom_monthly_video_limit, v_settings.user_monthly_video_limit, 0);
    ELSE
        v_daily_limit := COALESCE(v_profile.custom_daily_image_limit, v_settings.user_daily_image_limit, 0);
        v_monthly_limit := COALESCE(v_profile.custom_monthly_image_limit, v_settings.user_monthly_image_limit, 0);
    END IF;

    -- Check Daily
    SELECT COUNT(*) INTO v_daily_count
    FROM public.generation_logs
    WHERE user_id = p_user_id 
      AND generation_type = p_type
      AND created_at >= (now() - interval '24 hours');

    IF v_daily_limit > 0 AND v_daily_count >= v_daily_limit THEN
        RETURN json_build_object(
            'allowed', false,
            'reason', 'Service temporarily unavailable. Quota full for today. Please try again tomorrow.'
        );
    END IF;

    -- Check Monthly
    SELECT COUNT(*) INTO v_monthly_count
    FROM public.generation_logs
    WHERE user_id = p_user_id 
      AND generation_type = p_type
      AND created_at >= date_trunc('month', now());

    IF v_monthly_limit > 0 AND v_monthly_count >= v_monthly_limit THEN
        RETURN json_build_object(
            'allowed', false,
            'reason', 'Service temporarily unavailable. Quota full for this month. Please try again next month.'
        );
    END IF;

    RETURN json_build_object(
        'allowed', true,
        'used_today', v_daily_count,
        'limit_today', v_daily_limit,
        'used_month', v_monthly_count,
        'limit_month', v_monthly_limit
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- =========================================================================
-- 6. ADMIN VIEW (USER OVERVIEW & GENERATION DATA FOR ADMIN PANEL)
-- =========================================================================
CREATE OR REPLACE VIEW public.admin_user_overview AS
SELECT
    p.user_id,
    p.email,
    p.full_name,
    p.avatar_url,
    p.role,
    p.is_restricted,
    p.is_unlimited,
    p.custom_daily_video_limit,
    p.custom_monthly_video_limit,
    p.created_at AS joined_at,
    p.last_login_at,
    
    (SELECT COUNT(*) FROM public.generation_logs g
     WHERE g.user_id = p.user_id AND g.generation_type = 'video'
       AND g.created_at >= (now() - interval '24 hours')) AS videos_today,
       
    (SELECT COUNT(*) FROM public.generation_logs g
     WHERE g.user_id = p.user_id AND g.generation_type = 'image'
       AND g.created_at >= (now() - interval '24 hours')) AS images_today,
       
    (SELECT COUNT(*) FROM public.generation_logs g
     WHERE g.user_id = p.user_id AND g.generation_type = 'video'
       AND g.created_at >= date_trunc('month', now())) AS videos_this_month,
       
    (SELECT COUNT(*) FROM public.generation_logs g
     WHERE g.user_id = p.user_id AND g.generation_type = 'image'
       AND g.created_at >= date_trunc('month', now())) AS images_this_month,
       
    (SELECT COUNT(*) FROM public.generation_logs g
     WHERE g.user_id = p.user_id AND g.generation_type = 'video') AS total_videos,
     
    (SELECT COUNT(*) FROM public.generation_logs g
     WHERE g.user_id = p.user_id AND g.generation_type = 'image') AS total_images
FROM public.user_profiles p;


-- =========================================================================
-- 7. ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================================================
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- User Profiles Policies
DROP POLICY IF EXISTS "Users can read own profile" ON public.user_profiles;
CREATE POLICY "Users can read own profile" ON public.user_profiles
    FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
CREATE POLICY "Users can update own profile" ON public.user_profiles
    FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Generation Logs Policies
DROP POLICY IF EXISTS "Users can read own generation logs" ON public.generation_logs;
CREATE POLICY "Users can read own generation logs" ON public.generation_logs
    FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow inserts on generation logs" ON public.generation_logs;
CREATE POLICY "Allow inserts on generation logs" ON public.generation_logs
    FOR INSERT TO anon, authenticated WITH CHECK (true);

-- System Settings Policies
DROP POLICY IF EXISTS "Public can read system settings" ON public.system_settings;
CREATE POLICY "Public can read system settings" ON public.system_settings
    FOR SELECT TO anon, authenticated USING (true);