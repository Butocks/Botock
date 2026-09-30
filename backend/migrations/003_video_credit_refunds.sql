-- Apply after 001_distributed_video_queue.sql and 002_user_credits_and_profiles.sql.
-- A job UUID makes a charge/refund idempotent across Azure, laptop and Colab
-- retries.  Never issue refunds from application memory alone.

alter table public.user_generations_log
  add column if not exists generation_id uuid;
alter table public.user_generations_log
  add column if not exists refunded_at timestamptz;

create unique index if not exists user_video_generation_id_unique
  on public.user_generations_log (generation_id)
  where generation_type = 'video' and generation_id is not null;

create or replace function public.reserve_video_credit(
  p_user_id uuid, p_generation_id uuid, p_cost integer, p_daily_limit integer default 50
) returns integer language plpgsql security definer set search_path = public as $$
declare v_rewards integer; v_used integer; v_remaining integer; v_existing integer;
begin
  if p_cost <= 0 or p_cost > 10000 or p_daily_limit < 0 then
    raise exception 'invalid credit request' using errcode = '22023';
  end if;
  insert into public.user_credits (user_id, daily_credits_allocated)
  values (p_user_id, p_daily_limit) on conflict (user_id) do nothing;
  perform 1 from public.user_credits where user_id = p_user_id for update;
  select cost into v_existing from public.user_generations_log
    where generation_type = 'video' and generation_id = p_generation_id;
  if found then return 0; end if;
  select coalesce(sum(amount), 0) into v_rewards from public.user_tool_rewards
    where user_id = p_user_id and expires_at > now();
  select coalesce(sum(cost), 0) into v_used from public.user_generations_log
    where user_id = p_user_id and generation_type = 'video' and refunded_at is null
      and created_at > now() - interval '24 hours';
  v_remaining := greatest(0, p_daily_limit + v_rewards - v_used);
  if v_remaining < p_cost then raise exception 'insufficient credits' using errcode = 'P0001'; end if;
  insert into public.user_generations_log (user_id, generation_type, model, cost, generation_id)
    values (p_user_id, 'video', 'queued', p_cost, p_generation_id);
  update public.user_credits set daily_credits_allocated = p_daily_limit,
    daily_credits_used = v_used + p_cost, bonus_reward_credits = v_rewards,
    updated_at = now() where user_id = p_user_id;
  return v_remaining - p_cost;
end; $$;

create or replace function public.refund_video_credit(p_user_id uuid, p_generation_id uuid)
returns boolean language plpgsql security definer set search_path = public as $$
declare v_changed integer;
begin
  update public.user_generations_log set refunded_at = now()
    where user_id = p_user_id and generation_type = 'video'
      and generation_id = p_generation_id and refunded_at is null;
  get diagnostics v_changed = row_count;
  return v_changed > 0;
end; $$;

revoke all on function public.reserve_video_credit(uuid, uuid, integer, integer) from public, anon, authenticated;
revoke all on function public.refund_video_credit(uuid, uuid) from public, anon, authenticated;
grant execute on function public.reserve_video_credit(uuid, uuid, integer, integer) to service_role;
grant execute on function public.refund_video_credit(uuid, uuid) to service_role;

-- The dashboard must use the same definition of "spent" as the reservation
-- function; otherwise a successfully refunded job would still look charged.
create or replace function public.get_user_credit_balance(
  p_user_id uuid, p_daily_limit integer default 50
) returns integer language plpgsql security definer set search_path = public as $$
declare v_rewards integer; v_used integer;
begin
  if p_daily_limit < 0 then raise exception 'invalid daily_limit' using errcode = '22023'; end if;
  insert into public.user_credits (user_id, daily_credits_allocated)
  values (p_user_id, p_daily_limit) on conflict (user_id) do nothing;
  select coalesce(sum(amount), 0) into v_rewards from public.user_tool_rewards
    where user_id = p_user_id and expires_at > now();
  select coalesce(sum(cost), 0) into v_used from public.user_generations_log
    where user_id = p_user_id and refunded_at is null
      and created_at > now() - interval '24 hours';
  return greatest(0, p_daily_limit + v_rewards - v_used);
end; $$;
