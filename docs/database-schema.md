# 🗄️ Database Schema Module

The Postgres schema backing the app on Supabase — two tables, both scoped to their owner with Row-Level Security, plus an optional demo-data seed script.

**Files:**
- `supabase/schema.sql` — `applications` table + RLS
- `supabase/contacts.sql` — `contacts` table + RLS (depends on `schema.sql`)
- `supabase/seed_demo_user.sql` — optional demo data for a test account

Run once, in order, in the Supabase SQL Editor. See the main [README](../README.md#supabase-setup) for the exact setup steps.

---

## `applications` table

```sql
create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),

  company_name text not null,
  role text not null,
  location text not null default '',
  job_url text not null default '',
  job_description text not null default '',
  score integer not null default 0 check (score between 0 and 100),
  status text not null default 'Wishlist' check (status in (...)),
  date_applied date,
  resume_version text not null default '',
  cover_letter_sent boolean not null default false,
  contact_person text not null default '',
  salary_range text not null default '',
  notes text not null default '',
  source text not null default 'Other' check (source in (...)),

  date_last_updated timestamptz not null default now(),
  created_at timestamptz not null default now()
);
```

Notable choices:
- **`user_id default auth.uid()`** — a new row is automatically owned by whoever's session inserted it, without the client needing to pass `user_id` explicitly (and RLS's `with check` still verifies it independently — see below).
- **`check` constraints on `score`, `status`, and `source`** enforce the same enums as the TypeScript `Status`/`Source` unions in `src/types.ts` at the database level — so even a direct SQL edit or a bug in the client can't insert an invalid status.
- **`date_last_updated`** is *never* set by the client. A trigger (`set_applications_updated_at`) forces it to `now()` on every update, so this field is a trustworthy "last touched" timestamp independent of whatever the frontend claims.
- **`applications_user_id_idx`** — an index on `user_id`, since every single query in [`supabaseDataService`](data-layer.md#supabasedataservice--supabasecontactsservice) is implicitly filtered by owner via RLS.

## `contacts` table

```sql
create table if not exists public.contacts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  name text not null,
  title text not null default '',
  company text not null default '',
  linkedin_url text not null default '',
  email text not null default '',
  phone text not null default '',
  application_id uuid references public.applications(id) on delete set null,
  status text not null default 'Reached Out',
  date_contacted date,
  notes text not null default '',
  date_last_updated timestamptz not null default now(),
  created_at timestamptz not null default now()
);
```

- **`application_id ... on delete set null`** — deleting an application doesn't cascade-delete its linked contacts; the contact survives with `applicationId: null`, since the person you talked to is still worth remembering even if you withdrew or deleted that specific application record.
- The `status` column and its check constraint were added in a later migration than the base table, which is why the file adds it defensively:
  ```sql
  alter table public.contacts add column if not exists status text not null default 'Reached Out';
  alter table public.contacts drop constraint if exists contacts_status_check;
  alter table public.contacts add constraint contacts_status_check check (status in (...));
  ```
  This `add column if not exists` / `drop constraint if exists` pattern makes the whole file **safe to re-run** on a database that already has the table — it was written as an idempotent migration, not a one-shot script, so pulling a newer version of the repo and re-running it against an existing project won't error.
- Same `date_last_updated` trigger pattern as `applications`, via its own `set_contacts_updated_at` function.

## Row-Level Security

Both tables enable RLS and define four identical-shaped policies (select/insert/update/delete), each scoped to `(select auth.uid()) = user_id`:

```sql
alter table public.applications enable row level security;

create policy "applications_select_own"
  on public.applications for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "applications_insert_own"
  on public.applications for insert
  to authenticated
  with check ((select auth.uid()) = user_id);
-- ...update, delete follow the same pattern
```

This is the enforcement layer that makes "private by default" actually true: even if the Supabase publishable key is public (it always is, by design) and even if a bug in the frontend ever queried without a `user_id` filter, Postgres itself refuses to return, insert, update, or delete any row that doesn't belong to the requesting session. The frontend's `supabaseDataService`/`supabaseContactsService` never manually filter by `user_id` in their queries — they don't have to, because RLS makes it structurally impossible to see anyone else's rows regardless of what the client asks for.

`to authenticated` scopes every policy to signed-in sessions only — an anonymous/unauthenticated request matches none of these policies and gets nothing back.

## `seed_demo_user.sql`

An optional script for populating a demo account with realistic data — 20 applications spanning every pipeline stage and 10 contacts, several linked to specific applications by looking up `application_id` via a `select ... limit 1` subquery matched on company name. Usage, from the file's own header comment:

1. Create a user in Supabase Dashboard → Authentication → Users (e.g. `demo@masar.app`), with "Auto Confirm User" checked.
2. Run this file in the SQL Editor.
3. Sign in to the app as that user.

It's **safe to re-run**: it first deletes only that demo user's existing applications and contacts (`delete from ... where user_id = demo_user_id`), then re-inserts a fresh set — running it twice resets the demo data rather than duplicating it. It raises an exception up front if no user with that email exists yet, rather than silently inserting orphaned rows.

## Related modules

- [Data Layer](data-layer.md) — the `supabaseDataService`/`supabaseContactsService` that query these tables
- [Authentication](authentication.md) — `auth.uid()`, the identity every RLS policy checks against
