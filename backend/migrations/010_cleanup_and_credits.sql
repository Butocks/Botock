-- Drop the Paddle subscription tables completely
DROP TABLE IF EXISTS public.user_subscriptions CASCADE;
DROP TABLE IF EXISTS public.service_plans CASCADE;

-- Create Settings Table for Admin to control Guest vs Logged-In User limits
CREATE TABLE IF NOT EXISTS public.system_settings (
    id INT PRIMARY KEY DEFAULT 1,
    guest_daily_credits INT DEFAULT 5,
    user_daily_credits INT DEFAULT 50,
    video_credit_cost INT DEFAULT 15,
    image_credit_cost INT DEFAULT 5,
    updated_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT single_row CHECK (id = 1)
);

-- Seed default limits
INSERT INTO public.system_settings (id, guest_daily_credits, user_daily_credits, video_credit_cost, image_credit_cost)
VALUES (1, 5, 50, 15, 5)
ON CONFLICT (id) DO UPDATE SET 
    updated_at = now();

-- RPC for getting settings
CREATE OR REPLACE FUNCTION public.get_system_settings()
RETURNS SETOF public.system_settings
LANGUAGE sql
SECURITY DEFINER
AS $$
    SELECT * FROM public.system_settings WHERE id = 1;
$$;
