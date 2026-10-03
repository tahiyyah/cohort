-- Changes to the existing "Passports" table. Run this in the Supabase SQL editor.
-- Existing columns: id, first_name, last_name, company, year, location, age,
-- interests, bio, profile_picture, username

-- Link each passport to the auth user who owns it. Filled in automatically on insert.
alter table public."Passports"
  add column if not exists user_id uuid default auth.uid()
  references auth.users (id) on delete cascade;

create unique index if not exists passports_user_id_key  on public."Passports" (user_id);
create unique index if not exists passports_username_key on public."Passports" (username);
create index if not exists passports_company_idx   on public."Passports" (company);
create index if not exists passports_interests_idx on public."Passports" using gin (interests);

-- Row level security: any signed-in user can read passports (seeing who's
-- attending is the point), but only the owner can create or edit theirs.
alter table public."Passports" enable row level security;

drop policy if exists "Passports are readable by signed-in users" on public."Passports";
create policy "Passports are readable by signed-in users"
  on public."Passports" for select
  to authenticated
  using (true);

drop policy if exists "Users can insert their own passport" on public."Passports";
create policy "Users can insert their own passport"
  on public."Passports" for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own passport" on public."Passports";
create policy "Users can update their own passport"
  on public."Passports" for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Profile picture storage: public bucket, each user writes only to their own folder (<user_id>/...)
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

drop policy if exists "Users can upload their own avatar" on storage.objects;
create policy "Users can upload their own avatar"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "Users can replace their own avatar" on storage.objects;
create policy "Users can replace their own avatar"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
