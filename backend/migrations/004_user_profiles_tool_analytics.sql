-- ============================================================
-- Migration 004: User Profiles, Tool Analytics & Credit Repair
-- Run in Supabase SQL Editor
-- ============================================================

-- 1. Ensure migration 003 columns exist (safe re-apply)
alter table public.user_generations_log
  add column if not exists generation_id uuid;
alter table public.user_generations_log
  add column if not exists refunded_at timestamptz;

create unique index if not exists user_video_generation_id_unique
  on public.user_generations_log (generation_id)
  where generation_type = 'video' and generation_id is not null;

-- 2. User Profiles Table (stores visible user info)
create table if not exists public.user_profiles (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  email      text not null,
  full_name  text,
  avatar_url text,
  provider   text default 'email',   -- 'email' | 'google'
  is_pro     boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.user_profiles enable row level security;

drop policy if exists "Users can view own profile" on public.user_profiles;
create policy "Users can view own profile"
  on public.user_profiles for select
  using (auth.uid() = user_id);

drop policy if exists "Users can update own profile" on public.user_profiles;
create policy "Users can update own profile"
  on public.user_profiles for update
  using (auth.uid() = user_id);

-- 3. Tool Usage Analytics Table
create table if not exists public.tool_usage_log (
  id         uuid primary key default gen_random_uuid(),
  tool_id    text not null check (char_length(tool_id) between 1 and 100),
  user_id    uuid references auth.users(id) on delete set null,
  used_at    timestamptz not null default now()
);

create index if not exists idx_tool_usage_tool_id
  on public.tool_usage_log(tool_id, used_at desc);
create index if not exists idx_tool_usage_user_id
  on public.tool_usage_log(user_id, used_at desc);

alter table public.tool_usage_log enable row level security;

-- 4. Auto-create profile on signup (trigger)
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.user_profiles (user_id, email, full_name, avatar_url, provider)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''),
    coalesce(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture', ''),
    coalesce(new.raw_app_meta_data->>'provider', 'email')
  )
  on conflict (user_id) do update set
    email      = excluded.email,
    full_name  = coalesce(excluded.full_name, public.user_profiles.full_name),
    avatar_url = coalesce(excluded.avatar_url, public.user_profiles.avatar_url),
    updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Backfill existing users into profiles
insert into public.user_profiles (user_id, email, full_name, avatar_url, provider)
select
  id,
  email,
  coalesce(raw_user_meta_data->>'full_name', raw_user_meta_data->>'name', ''),
  coalesce(raw_user_meta_data->>'avatar_url', raw_user_meta_data->>'picture', ''),
  coalesce(raw_app_meta_data->>'provider', 'email')
from auth.users
on conflict (user_id) do update set
  email      = excluded.email,
  updated_at = now();

-- 5. CREDIT REPAIR: Refund all failed/stuck video generations
-- (fixes "limit exceeded" for users whose videos failed but credits not returned)
update public.user_generations_log
set refunded_at = now()
where generation_type = 'video'
  and refunded_at is null
  and generation_id is not null
  and created_at > now() - interval '7 days'
  and generation_id not in (
    -- Keep charges for jobs that actually succeeded (have a real status)
    select generation_id from public.video_jobs
    where status = 'completed'
    and generation_id is not null
  );

-- 6. Re-apply refund functions (safe update)
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

revoke all on function public.refund_video_credit(uuid, uuid) from public, anon, authenticated;
grant execute on function public.refund_video_credit(uuid, uuid) to service_role;

-- 7. Admin view: user dashboard (admin can see all users + credits)
create or replace view public.admin_user_overview as
select
  p.user_id,
  p.email,
  p.full_name,
  p.provider,
  p.is_pro,
  p.created_at as joined_at,
  coalesce(c.daily_credits_used, 0) as credits_used_today,
  coalesce(c.daily_credits_allocated, 50) as credits_limit,
  coalesce(c.bonus_reward_credits, 0) as bonus_credits,
  coalesce(c.last_reset_at, p.created_at) as last_reset,
  (select count(*) from public.user_generations_log g
   where g.user_id = p.user_id and g.generation_type = 'video') as total_videos,
  (select count(*) from public.user_generations_log g
   where g.user_id = p.user_id and g.generation_type = 'image') as total_images
from public.user_profiles p
left join public.user_credits c on c.user_id = p.user_id;

-- 8. Tool usage summary view
create or replace view public.tool_usage_summary as
select
  tool_id,
  count(*) as total_uses,
  count(distinct user_id) as unique_users,
  max(used_at) as last_used_at
from public.tool_usage_log
group by tool_id
order by total_uses desc;

-- Done!
select 'Migration 004 applied successfully' as result;
