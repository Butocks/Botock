-- ============================================================
-- Migration 005: Fix Image Quota Calculation
-- Run in Supabase SQL Editor
-- ============================================================

-- Fix: consume_image_quota should only count images (not videos) 
-- and should ignore refunded generations (if any).
create or replace function public.consume_image_quota(
  p_user_id    uuid,
  p_daily_limit integer default 5,
  p_cost        integer default 1
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_used    integer;
  v_remaining integer;
begin
  if p_cost <= 0 or p_cost > 10000 or p_daily_limit < 0 then
    raise exception 'invalid image quota request' using errcode = '22023';
  end if;

  insert into public.user_credits (user_id, daily_credits_allocated)
  values (p_user_id, p_daily_limit)
  on conflict (user_id) do nothing;

  perform 1 from public.user_credits where user_id = p_user_id for update;

  -- Only count images for the image limit!
  select coalesce(sum(cost), 0) into v_used
  from public.user_generations_log
  where user_id = p_user_id
    and generation_type = 'image'
    and refunded_at is null
    and created_at > now() - interval '24 hours';

  v_remaining := greatest(0, p_daily_limit - v_used);
  if v_remaining < p_cost then
    raise exception 'image quota reached' using errcode = 'P0001';
  end if;

  insert into public.user_generations_log (user_id, generation_type, model, cost)
  values (p_user_id, 'image', 'nano-banana', p_cost);

end;
$$;

revoke all on function public.consume_image_quota(uuid, integer, integer) from public, anon, authenticated;
grant execute on function public.consume_image_quota(uuid, integer, integer) to service_role;
