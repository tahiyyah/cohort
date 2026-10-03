-- Run this in the Supabase SQL editor (or via `supabase db push`)
-- on the project at ragcyrjiqbiiepnbsqzs.supabase.co.
--
-- Safe to re-run: every statement is idempotent.

-- One row per auth user, holding the apprentice-facing profile fields.
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  name text not null,
  programme text,
  cohort text,
  location text,
  bio text,
  interests text[] not null default '{}',
  avatar_url text,
  created_at timestamptz not null default now()
);

-- Added after the first cut of this file; `add column if not exists` keeps
-- it working on a database where profiles already exists.
alter table public.profiles
  add column if not exists interests text[] not null default '{}';

-- Browse and attendee lists filter on these.
create index if not exists profiles_programme_idx on public.profiles (programme);
create index if not exists profiles_cohort_idx    on public.profiles (cohort);
create index if not exists profiles_interests_idx on public.profiles using gin (interests);

alter table public.profiles enable row level security;

-- Seeing who's attending an event is the networking payoff, so any
-- signed-in user can read any profile.
drop policy if exists "Profiles are viewable by authenticated users" on public.profiles;
create policy "Profiles are viewable by authenticated users"
  on public.profiles for select
  to authenticated
  using (true);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- The trigger below is what normally creates the row, but an explicit
-- insert policy means a client-side upsert still works if it ever misses.
drop policy if exists "Users can insert their own profile" on public.profiles;
create policy "Users can insert their own profile"
  on public.profiles for insert
  to authenticated
  with check (auth.uid() = id);

-- Auto-create the profile row when a user signs up. Runs as the table
-- owner (security definer) so it can insert despite RLS, and reads the
-- extra fields passed via supabase.auth.signUp({ options: { data } }).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, name, programme, cohort, location)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', ''),
    new.raw_user_meta_data->>'programme',
    new.raw_user_meta_data->>'cohort',
    new.raw_user_meta_data->>'location'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
