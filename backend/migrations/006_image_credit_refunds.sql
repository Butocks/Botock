-- Migration 006: Image Credit Refunds
-- Run in Supabase SQL Editor

create or replace function public.refund_image_credit(p_user_id uuid, p_generation_id uuid)
returns boolean language plpgsql security definer set search_path = public as $$
declare v_changed integer;
begin
  update public.user_generations_log set refunded_at = now()
    where user_id = p_user_id and generation_type = 'image'
      and generation_id = p_generation_id and refunded_at is null;
  get diagnostics v_changed = row_count;
  return v_changed > 0;
end; $$;

revoke all on function public.refund_image_credit(uuid, uuid) from public, anon, authenticated;
grant execute on function public.refund_image_credit(uuid, uuid) to service_role;
