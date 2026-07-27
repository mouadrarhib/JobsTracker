-- Masar Job Tracker — Contacts feature
-- Run this once in the Supabase SQL Editor, in addition to schema.sql
-- (https://supabase.com/dashboard/project/_/sql/new)

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

-- Safe to re-run: adds the status column if this table was created before it existed.
alter table public.contacts add column if not exists status text not null default 'Reached Out';

alter table public.contacts drop constraint if exists contacts_status_check;
alter table public.contacts add constraint contacts_status_check check (
  status in (
    'Reached Out', 'Responded', 'No Response', 'Called Me',
    'Interviewing Me', 'Referred Me', 'Cold'
  )
);

create index if not exists contacts_user_id_idx on public.contacts (user_id);
create index if not exists contacts_application_id_idx on public.contacts (application_id);

-- Keep date_last_updated current on every row change, without trusting the client for it.
create or replace function public.set_contacts_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.date_last_updated = now();
  return new;
end;
$$;

drop trigger if exists contacts_set_updated_at on public.contacts;
create trigger contacts_set_updated_at
  before update on public.contacts
  for each row
  execute function public.set_contacts_updated_at();

-- Row-level security: every row is scoped to the signed-in owner.
alter table public.contacts enable row level security;

drop policy if exists "contacts_select_own" on public.contacts;
create policy "contacts_select_own"
  on public.contacts for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "contacts_insert_own" on public.contacts;
create policy "contacts_insert_own"
  on public.contacts for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "contacts_update_own" on public.contacts;
create policy "contacts_update_own"
  on public.contacts for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "contacts_delete_own" on public.contacts;
create policy "contacts_delete_own"
  on public.contacts for delete
  to authenticated
  using ((select auth.uid()) = user_id);
