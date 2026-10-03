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
  -- Email signup sends `name`; Google sends `full_name` and `avatar_url`.
  -- Fall back to the local part of the address so name is never blank.
  insert into public.profiles (id, email, name, programme, cohort, location, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(
      nullif(new.raw_user_meta_data->>'name', ''),
      nullif(new.raw_user_meta_data->>'full_name', ''),
      split_part(coalesce(new.email, 'apprentice'), '@', 1)
    ),
    new.raw_user_meta_data->>'programme',
    new.raw_user_meta_data->>'cohort',
    new.raw_user_meta_data->>'location',
    nullif(new.raw_user_meta_data->>'avatar_url', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- ---------------------------------------------------------------------------
-- Events
-- ---------------------------------------------------------------------------

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  -- Readable identifier used in URLs (/events/demo-day-sde-12). Nullable:
  -- an event created without one is still valid and is addressed by id.
  slug text,
  -- Display code the listing UI prints, e.g. "No 014".
  code text,
  host_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  description text,
  starts_at timestamptz not null,
  ends_at timestamptz,
  location text,
  is_online boolean not null default false,
  capacity integer check (capacity is null or capacity > 0),
  cover_url text,
  tags text[] not null default '{}',
  created_at timestamptz not null default now(),
  constraint events_ends_after_starts check (ends_at is null or ends_at >= starts_at)
);

-- This table may already exist from a teammate's migration, in which case the
-- create above was a no-op. Add the two display columns the directory UI uses
-- without disturbing the existing shape; both stay nullable so inserts that
-- predate them keep working.
alter table public.events add column if not exists slug text;
alter table public.events add column if not exists code text;

create unique index if not exists events_slug_key      on public.events (slug);
create index        if not exists events_starts_at_idx on public.events (starts_at);
create index if not exists events_host_idx      on public.events (host_id);
create index if not exists events_tags_idx      on public.events using gin (tags);

alter table public.events enable row level security;

-- The directory is the product: any signed-in apprentice can see any event.
drop policy if exists "Events are viewable by authenticated users" on public.events;
create policy "Events are viewable by authenticated users"
  on public.events for select
  to authenticated
  using (true);

drop policy if exists "Users can create events they host" on public.events;
create policy "Users can create events they host"
  on public.events for insert
  to authenticated
  with check (auth.uid() = host_id);

drop policy if exists "Hosts can update their own events" on public.events;
create policy "Hosts can update their own events"
  on public.events for update
  to authenticated
  using (auth.uid() = host_id)
  with check (auth.uid() = host_id);

drop policy if exists "Hosts can delete their own events" on public.events;
create policy "Hosts can delete their own events"
  on public.events for delete
  to authenticated
  using (auth.uid() = host_id);

-- ---------------------------------------------------------------------------
-- RSVPs
-- ---------------------------------------------------------------------------

create table if not exists public.rsvps (
  user_id uuid not null references public.profiles (id) on delete cascade,
  event_id uuid not null references public.events (id) on delete cascade,
  status text not null default 'going' check (status in ('going', 'interested', 'not_going')),
  created_at timestamptz not null default now(),
  primary key (user_id, event_id)
);

create index if not exists rsvps_event_idx on public.rsvps (event_id);

alter table public.rsvps enable row level security;

-- Seeing who else is going is the networking payoff, so RSVPs are readable
-- by any signed-in user - but only ever writable by their owner.
drop policy if exists "RSVPs are viewable by authenticated users" on public.rsvps;
create policy "RSVPs are viewable by authenticated users"
  on public.rsvps for select
  to authenticated
  using (true);

drop policy if exists "Users can create their own RSVP" on public.rsvps;
create policy "Users can create their own RSVP"
  on public.rsvps for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own RSVP" on public.rsvps;
create policy "Users can update their own RSVP"
  on public.rsvps for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own RSVP" on public.rsvps;
create policy "Users can delete their own RSVP"
  on public.rsvps for delete
  to authenticated
  using (auth.uid() = user_id);
