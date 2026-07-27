-- Masar Job Tracker — Phase 2 schema
-- Run this once in the Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql/new)

create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),

  company_name text not null,
  role text not null,
  location text not null default '',
  job_url text not null default '',
  job_description text not null default '',
  score integer not null default 0 check (score between 0 and 100),
  status text not null default 'Wishlist' check (
    status in (
      'Wishlist', 'Applied', 'Phone Screen', 'Interview',
      'Technical Test', 'Offer', 'Rejected', 'Withdrawn'
    )
  ),
  date_applied date,
  resume_version text not null default '',
  cover_letter_sent boolean not null default false,
  contact_person text not null default '',
  salary_range text not null default '',
  notes text not null default '',
  source text not null default 'Other' check (
    source in (
      'LinkedIn', 'Company Site', 'Referral', 'Indeed',
      'ReKrute', 'MarocAnnonces', 'Networking Event', 'Other'
    )
  ),

  date_last_updated timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists applications_user_id_idx on public.applications (user_id);

-- Keep date_last_updated current on every row change, without trusting the client for it.
create or replace function public.set_applications_updated_at()
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

drop trigger if exists applications_set_updated_at on public.applications;
create trigger applications_set_updated_at
  before update on public.applications
  for each row
  execute function public.set_applications_updated_at();

-- Row-level security: every row is scoped to the signed-in owner.
alter table public.applications enable row level security;

drop policy if exists "applications_select_own" on public.applications;
create policy "applications_select_own"
  on public.applications for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "applications_insert_own" on public.applications;
create policy "applications_insert_own"
  on public.applications for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "applications_update_own" on public.applications;
create policy "applications_update_own"
  on public.applications for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "applications_delete_own" on public.applications;
create policy "applications_delete_own"
  on public.applications for delete
  to authenticated
  using ((select auth.uid()) = user_id);
