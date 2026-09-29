-- Run once against the Postgres database used by the Azure control plane.
-- Do not expose this database connection string to laptop or Colab workers.

do $$ begin
  create type video_job_status as enum ('reserving', 'queued', 'running', 'completed', 'failed');
exception
  when duplicate_object then null;
end $$;

-- Supports databases where the first version of this migration was already
-- applied before the short-lived reservation state was introduced.
alter type video_job_status add value if not exists 'reserving' before 'queued';

create table if not exists video_jobs (
  id uuid primary key,
  user_id text not null,
  status video_job_status not null default 'queued',
  payload jsonb not null,
  attempts smallint not null default 0 check (attempts <= 2),
  worker_id text,
  account_id text,
  lease_expires_at timestamptz,
  output_object_key text,
  error_code text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists video_jobs_claim_idx
  on video_jobs (status, created_at) where status = 'queued';

create index if not exists video_jobs_user_idx on video_jobs (user_id, created_at desc);
