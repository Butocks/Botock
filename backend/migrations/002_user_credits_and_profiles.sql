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
