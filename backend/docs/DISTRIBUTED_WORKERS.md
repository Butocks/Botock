# Distributed Flow workers

This design keeps the public API on Azure and lets private workers on a laptop
or Colab fetch work over an outbound HTTPS connection.  Do not expose a laptop
or a Colab runtime to the internet and do not give either one a Supabase
`service_role` key.

## What is a worker slot?

One worker slot means **one Flow account and one Chromium generation at a
time**.  A Flow session must never be used by two Chromium processes or copied
between Azure, a laptop, and Colab.  If three Flow accounts are available,
start three slots, each with its own account and encrypted session.

Example layout:

| location | account | worker id | concurrent Flow jobs |
| --- | --- | --- | --- |
| Azure (1 GB) | flow-azure-01 | azure-flow-01 | 1 |
| laptop | flow-local-01 | local-flow-01 | 1 |
| Colab | flow-colab-01 | colab-flow-01 | 1 |
| Colab | flow-colab-02 | colab-flow-02 | 1 |

That gives four simultaneous jobs when all machines are online.  The queue
length is separate: it is the number of jobs allowed to wait, not the number
of browser instances.  The distribution is capacity-based: with Azure=1,
local=2, and Colab=3, up to six jobs run at the same time.  Which individual
job reaches which machine first is intentionally not fixed; the next idle slot
claims the next queued job.

## Required central services

Use the Azure deployment as the control plane and add:

1. A persistent job store (Supabase Postgres is suitable because this project
   already uses Supabase).
2. Azure Blob Storage (or another private object store) for completed videos.
   A file saved on Colab or a laptop cannot be downloaded from Azure.
3. A worker-only API on Azure.  Workers call `claim`, `heartbeat`, `complete`,
   and `fail`; the API, not the worker, owns database credentials.

The public `POST /api/video/generate` inserts a `queued` job.  An idle worker
claims one job atomically.  It renews its lease while Chromium is running.  If
the worker stops (laptop asleep, Colab disconnects, Azure restarts), the lease
expires and the job becomes available to another worker.  A job should only be
retried once or twice and then marked `failed` for review, so an invalid prompt
cannot loop forever.

The implementation first creates a short-lived `reserving` row, then deducts
credits, and finally makes it `queued`.  This prevents a full queue from
charging a user.  An abandoned reservation is discarded automatically.

## Queue table

Run this migration in the central Postgres database.  It deliberately stores
only a reference to an uploaded input image, never a base64 image blob.

```sql
create type video_job_status as enum ('queued', 'running', 'completed', 'failed');

create table video_jobs (
  id uuid primary key,
  user_id uuid not null,
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

create index video_jobs_claim_idx on video_jobs (status, created_at)
  where status = 'queued';
```

The Azure-only claim transaction must use `FOR UPDATE SKIP LOCKED`, change the
row to `running`, and set `lease_expires_at = now() + interval '15 minutes'`.
When a worker sends a heartbeat, extend the lease only when both `worker_id`
and `account_id` match.  A scheduled Azure task returns expired `running` jobs
to `queued` (or marks them failed after the retry limit).

## Worker configuration

Every slot runs the same worker program with different values:

```dotenv
# Public Azure API URL. Workers only need outbound HTTPS access.
CONTROL_PLANE_URL=https://api.botock.app
WORKER_ID=local-flow-01
FLOW_ACCOUNT_ID=flow-local-01
WORKER_TOKEN=long-random-token-for-this-one-worker-only

# One account = one browser at a time. Do not raise this above 1.
FLOW_CONCURRENCY=1

# This file stays only on this machine; it is never uploaded or committed.
SESSION_PATH=/private/botock/flow-local-01.session.enc
SESSION_ENCRYPTION_KEY=fernet-key-for-this-worker-only
```

For Azure, set these as Key Vault references / App Service secrets.  On a
laptop use an untracked `.env` readable only by that user.  In Colab use the
Secrets panel, authenticate a dedicated account manually for that temporary
runtime, and delete the session when the runtime ends.  Do not paste a Google
password, session cookie, service-role key, or a shared encryption key into a
notebook.

Give every worker a separately generated token.  Store only a SHA-256 or
Argon2 hash of each token in the Azure control plane.  Revoking `colab-flow-01`
must not affect Azure, the laptop, or another Flow account.

On a trusted machine, generate a token and its Azure-side hash like this:

```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
python -c "import hashlib; print(hashlib.sha256(b'PASTE_THE_TOKEN_HERE').hexdigest())"
```

Set the Azure secret to one JSON value, for example:

```json
{
  "azure-flow-01": {"token_hash": "HASH_1", "account_id": "flow-azure-01"},
  "local-flow-01": {"token_hash": "HASH_2", "account_id": "flow-local-01"}
}
```

The plain token goes only into the matching worker's secret store as
`WORKER_TOKEN`.

The supplied Docker image now runs as a non-root `botock` user and excludes
sessions, environment files, generated media, and images from its build
context. Keep `CHROMIUM_NO_SANDBOX=false`; turning it on is an explicit,
less-secure compatibility override only.

Generate the Fernet session key independently for each worker:

```bash
python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
```

## Starting a worker

Apply `migrations/001_distributed_video_queue.sql`, configure the Azure
variables, and then set `DISTRIBUTED_QUEUE_ENABLED=true` on Azure.  Restart
the Azure app.  For each private worker, install `requirements.txt`, set the
worker configuration above plus `FLOW_CONCURRENCY=1`, and run:

```bash
python worker.py
```

Run that command once per account in a separate environment.  For example,
Colab with two accounts requires two isolated runtimes (or two isolated
containers), each with its own session path, encryption key, worker id, and
token.  Do not run two copies using the same account/session.

## Multiple browsers on one machine

Use `worker_supervisor.py` when one laptop, Colab runtime, or Azure worker
container should run multiple browser slots. Copy `worker-slots.example.json`
to `worker-slots.json`, put real unique secrets into it, and protect it:

```bash
chmod 600 worker-slots.json
python worker_supervisor.py
```

The supervisor creates one isolated `worker.py` process per slot and restarts
a slot if it exits. It rejects duplicate worker IDs, Flow account IDs, or
session paths. `worker-slots.json` is ignored by Git.

Example capacity plan:

| server | slots now | future change |
| --- | ---: | --- |
| Azure | 1 | Add one new account/slot after increasing RAM |
| laptop | 2–6 | Add one account/session/slot for each browser |
| Colab | 2–N | Add one account/session/slot for each browser |

Never increase capacity by changing one account from one to six browsers.
Instead, add six independently authenticated Flow accounts and six slots.

## Capacity and offline behaviour

Set the public waiting limit centrally, for example `MAX_PENDING_VIDEO_JOBS=50`.
This is safe even if only Azure is online.  Capacity is created by starting
slots:

```text
Azure only:             1 active, 49 waiting
Azure + laptop:          2 active, 48 waiting
Azure + laptop + Colab:  4 active, 46 waiting
```

When a worker is offline it simply claims no new job.  Its current job returns
to the queue after its lease expires.  The worker must make output upload
idempotent (object key `videos/<job-id>.mp4`) so a recovered job cannot create
two downloadable files.

## Adding another account or raising capacity

1. Create a dedicated Flow account and manually sign in on the machine that
   will own it.
2. Save an encrypted session at a new, private `SESSION_PATH`.
3. Create one worker token and one worker record for that account.
4. Start exactly one worker slot with the new `WORKER_ID` and
   `FLOW_ACCOUNT_ID`.
5. Confirm the worker heartbeat appears in the Azure admin view before sending
   production jobs to it.

To increase capacity, add accounts/slots rather than setting one account to
two browsers.  Azure 1 GB should remain at one Chromium worker.  Colab is an
optional burst worker only: it can disconnect at any time and should never be
the only worker handling the queue.

## Security checklist

- Do not store Google passwords in this app. Prefer a manual, per-worker login
  and a short-lived encrypted browser session.
- Keep `session/`, `.env`, generated media, debug screenshots, and Blob
  connection strings out of Git. The existing `.gitignore` already excludes
  the first four; rotate a session immediately if it was ever committed.
- Use a different session encryption key for every worker. Environment
  variables reduce accidental commits but are not a secret vault; use Azure
  Key Vault/Colab Secrets and never log them.
- Disable production screenshots by default and give the session directory
  mode `0700` and session files mode `0600`.
- Do not run Chromium as root or with `--no-sandbox`. Use a non-root container
  and an environment where Chromium sandboxing is supported.
- The worker API must rate-limit authentication attempts, require TLS, reject
  replayed worker requests (timestamp + nonce), and never return a session or
  another user's job.
- Keep the automation compatible with Google/Flow terms and account policies;
  use an official supported integration if one is available.
