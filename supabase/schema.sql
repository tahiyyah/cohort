-- Run this in the Supabase SQL editor (or via `supabase db push`)
-- on the project at syngonyzukumvdcrexws.supabase.co.

-- One row per auth user, holding the apprentice-facing profile fields.
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  name text not null,
  programme text,
  cohort text,
  location text,
  bio text,
  avatar_url text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Seeing who's attending an event is the networking payoff, so any
-- signed-in user can read any profile.
create policy "Profiles are viewable by authenticated users"
  on public.profiles for select
  to authenticated
  using (true);

create policy "Users can update their own profile"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id);

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
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
