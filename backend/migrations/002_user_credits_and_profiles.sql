-- Secure persistent credits and usage ledger for Supabase Postgres.
-- Run this in the Supabase SQL Editor only after rotating any exposed
-- service_role key. This migration is safe if the earlier draft was run.

create table if not exists public.user_credits (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text,
  daily_credits_allocated integer not null default 50 check (daily_credits_allocated >= 0),
  daily_credits_used integer not null default 0 check (daily_credits_used >= 0),
  bonus_reward_credits integer not null default 0 check (bonus_reward_credits >= 0),
  is_pro boolean not null default false,
  last_reset_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_tool_rewards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.user_credits(user_id) on delete cascade,
  tool_id text not null check (char_length(tool_id) between 1 and 100),
  amount integer not null check (amount > 0 and amount <= 1000),
  earned_at timestamptz not null default now(),
  expires_at timestamptz not null,
  check (expires_at > earned_at)
);

create table if not exists public.user_generations_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  generation_type text not null check (generation_type in ('video', 'image')),
  model text not null check (char_length(model) between 1 and 100),
  cost integer not null check (cost >= 0 and cost <= 10000),
  created_at timestamptz not null default now()
);

create index if not exists idx_user_credits_email on public.user_credits(email);
create index if not exists idx_user_tool_rewards_user_expiry
  on public.user_tool_rewards(user_id, expires_at);
create index if not exists idx_user_generations_log_user_created
  on public.user_generations_log(user_id, created_at desc);

alter table public.user_credits enable row level security;
alter table public.user_tool_rewards enable row level security;
alter table public.user_generations_log enable row level security;

-- The service_role key already bypasses RLS. A public "USING true" policy
-- would let ordinary authenticated users write every account's records.
drop policy if exists "Users can view own credits" on public.user_credits;
drop policy if exists "Service role full access on credits" on public.user_credits;
drop policy if exists "Service role full access on rewards" on public.user_tool_rewards;
drop policy if exists "Service role full access on log" on public.user_generations_log;
drop policy if exists "Users can view own rewards" on public.user_tool_rewards;
drop policy if exists "Users can view own generations" on public.user_generations_log;

create policy "Users can view own credits" on public.user_credits
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "Users can view own rewards" on public.user_tool_rewards
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "Users can view own generations" on public.user_generations_log
  for select to authenticated using ((select auth.uid()) = user_id);

-- Azure calls this only with service_role. Locking the user's profile before
-- calculating the rolling 24-hour balance prevents concurrent double-spend.
create or replace function public.consume_video_credits(
  p_user_id uuid,
  p_cost integer,
  p_daily_limit integer default 50
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_rewards integer;
  v_used integer;
  v_remaining integer;
begin
  if p_cost <= 0 or p_cost > 10000 or p_daily_limit < 0 then
    raise exception 'invalid credit request' using errcode = '22023';
  end if;

  insert into public.user_credits (user_id, daily_credits_allocated)
  values (p_user_id, p_daily_limit)
  on conflict (user_id) do nothing;

  perform 1 from public.user_credits where user_id = p_user_id for update;

  select coalesce(sum(amount), 0) into v_rewards
  from public.user_tool_rewards
  where user_id = p_user_id and expires_at > now();

  select coalesce(sum(cost), 0) into v_used
  from public.user_generations_log
  where user_id = p_user_id and generation_type = 'video'
    and created_at > now() - interval '24 hours';

  v_remaining := greatest(0, p_daily_limit + v_rewards - v_used);
  if v_remaining < p_cost then
    raise exception 'insufficient credits' using errcode = 'P0001';
  end if;

  insert into public.user_generations_log (user_id, generation_type, model, cost)
  values (p_user_id, 'video', 'queued', p_cost);

  update public.user_credits
  set daily_credits_allocated = p_daily_limit,
      daily_credits_used = v_used + p_cost,
      bonus_reward_credits = v_rewards,
      last_reset_at = now(),
      updated_at = now()
  where user_id = p_user_id;

  return v_remaining - p_cost;
end;
$$;

revoke all on function public.consume_video_credits(uuid, integer, integer)
  from public, anon, authenticated;
grant execute on function public.consume_video_credits(uuid, integer, integer) to service_role;

-- ─────────────────────────────────────────────────────────────────────────────
-- get_user_credit_balance
-- Returns how many credits the user has left today (daily + active rewards – used).
-- Auto-provisions a row for new users so the first balance check never fails.
-- ─────────────────────────────────────────────────────────────────────────────
create or replace function public.get_user_credit_balance(
  p_user_id    uuid,
  p_daily_limit integer default 50
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_rewards integer;
  v_used    integer;
begin
  if p_daily_limit < 0 then
    raise exception 'invalid daily_limit' using errcode = '22023';
  end if;

  -- Ensure row exists for this user
  insert into public.user_credits (user_id, daily_credits_allocated)
  values (p_user_id, p_daily_limit)
  on conflict (user_id) do nothing;

  -- Sum of all non-expired bonus reward credits
  select coalesce(sum(amount), 0) into v_rewards
  from public.user_tool_rewards
  where user_id = p_user_id and expires_at > now();

  -- Credits consumed in the last rolling 24 hours
  select coalesce(sum(cost), 0) into v_used
  from public.user_generations_log
  where user_id = p_user_id
    and created_at > now() - interval '24 hours';

  return greatest(0, p_daily_limit + v_rewards - v_used);
end;
$$;

revoke all on function public.get_user_credit_balance(uuid, integer)
  from public, anon, authenticated;
grant execute on function public.get_user_credit_balance(uuid, integer) to service_role;


-- ─────────────────────────────────────────────────────────────────────────────
-- consume_image_quota
-- Atomically checks and records one image generation.
-- Raises 'image quota reached' (caught by the Python 429 handler) if over limit.
-- ─────────────────────────────────────────────────────────────────────────────
create or replace function public.consume_image_quota(
  p_user_id    uuid,
  p_daily_limit integer default 5,
  p_cost        integer default 5
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_rewards integer;
  v_used    integer;
  v_remaining integer;
begin
  if p_cost <= 0 or p_cost > 10000 or p_daily_limit < 0 then
    raise exception 'invalid image quota request' using errcode = '22023';
  end if;

  -- Ensure user row exists
  insert into public.user_credits (user_id, daily_credits_allocated)
  values (p_user_id, p_daily_limit)
  on conflict (user_id) do nothing;

  -- Lock the user's credit row to prevent concurrent double-spend
  perform 1 from public.user_credits where user_id = p_user_id for update;

  -- Active bonus rewards
  select coalesce(sum(amount), 0) into v_rewards
  from public.user_tool_rewards
  where user_id = p_user_id and expires_at > now();

  -- Credits used in the last 24 hours (images + videos combined)
  select coalesce(sum(cost), 0) into v_used
  from public.user_generations_log
  where user_id = p_user_id
    and created_at > now() - interval '24 hours';

  v_remaining := greatest(0, p_daily_limit + v_rewards - v_used);
  if v_remaining < p_cost then
    raise exception 'image quota reached' using errcode = 'P0001';
  end if;

  -- Record the generation
  insert into public.user_generations_log (user_id, generation_type, model, cost)
  values (p_user_id, 'image', 'nano-banana', p_cost);

  -- Update summary columns for fast dashboard reads
  update public.user_credits
  set daily_credits_used    = v_used + p_cost,
      bonus_reward_credits  = v_rewards,
      updated_at            = now()
  where user_id = p_user_id;
end;
$$;

revoke all on function public.consume_image_quota(uuid, integer, integer)
  from public, anon, authenticated;
grant execute on function public.consume_image_quota(uuid, integer, integer) to service_role;


-- ─────────────────────────────────────────────────────────────────────────────
-- claim_tool_reward
-- Awards bonus credits for using a qualifying tool.
-- Enforces a per-(user, tool) cooldown window.
-- Returns a JSON object: {earned, cooldown, message, new_balance, expires_at}
-- ─────────────────────────────────────────────────────────────────────────────
create or replace function public.claim_tool_reward(
  p_user_id         uuid,
  p_tool_id         text,
  p_amount          integer,
  p_cooldown_seconds integer default 86400,
  p_daily_limit     integer default 50
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_last_earned   timestamptz;
  v_expires_at    timestamptz;
  v_new_balance   integer;
begin
  -- Validate inputs
  if p_amount <= 0 or p_amount > 1000 then
    raise exception 'invalid reward amount' using errcode = '22023';
  end if;
  if char_length(p_tool_id) < 1 or char_length(p_tool_id) > 100 then
    raise exception 'invalid tool_id' using errcode = '22023';
  end if;

  -- Ensure credit row exists
  insert into public.user_credits (user_id, daily_credits_allocated)
  values (p_user_id, p_daily_limit)
  on conflict (user_id) do nothing;

  -- Check cooldown: when did this user last claim THIS tool?
  select max(earned_at) into v_last_earned
  from public.user_tool_rewards
  where user_id = p_user_id and tool_id = p_tool_id;

  if v_last_earned is not null
     and v_last_earned > now() - make_interval(secs => p_cooldown_seconds) then
    return jsonb_build_object(
      'cooldown', true,
      'earned',   0,
      'message',  format('Reward cooldown active. Try again after %s hours.',
                         round(p_cooldown_seconds / 3600.0, 1)),
      'new_balance', public.get_user_credit_balance(p_user_id, p_daily_limit),
      'expires_at',  (v_last_earned + make_interval(secs => p_cooldown_seconds))
    );
  end if;

  -- Insert reward row (expires in 24 hours from now)
  v_expires_at := now() + interval '24 hours';
  insert into public.user_tool_rewards (user_id, tool_id, amount, expires_at)
  values (p_user_id, p_tool_id, p_amount, v_expires_at);

  -- Recalculate balance after insertion
  v_new_balance := public.get_user_credit_balance(p_user_id, p_daily_limit);

  -- Update summary column
  update public.user_credits
  set bonus_reward_credits = bonus_reward_credits + p_amount,
      updated_at = now()
  where user_id = p_user_id;

  return jsonb_build_object(
    'cooldown',    false,
    'earned',      p_amount,
    'message',     format('Earned +%s credits for tool %s.', p_amount, p_tool_id),
    'new_balance', v_new_balance,
    'expires_at',  v_expires_at
  );
end;
$$;

revoke all on function public.claim_tool_reward(uuid, text, integer, integer, integer)
  from public, anon, authenticated;
grant execute on function public.claim_tool_reward(uuid, text, integer, integer, integer) to service_role;


-- ─────────────────────────────────────────────────────────────────────────────
-- get_active_user_rewards
-- Returns all non-expired reward rows for a user (for the /active-rewards endpoint).
-- ─────────────────────────────────────────────────────────────────────────────
create or replace function public.get_active_user_rewards(
  p_user_id uuid
)
returns table (
  tool_id   text,
  amount    integer,
  earned_at timestamptz,
  expires_at timestamptz
)
language sql
security definer
set search_path = public
as $$
  select tool_id, amount, earned_at, expires_at
  from public.user_tool_rewards
  where user_id = p_user_id
    and expires_at > now()
  order by earned_at desc;
$$;

revoke all on function public.get_active_user_rewards(uuid)
  from public, anon, authenticated;
grant execute on function public.get_active_user_rewards(uuid) to service_role;
