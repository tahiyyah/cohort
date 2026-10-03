-- Demo apprentices. Run AFTER schema.sql, in the Supabase SQL editor.
-- Safe to re-run: existing accounts are skipped.
--
-- These are real auth users, so you can log in as any of them during the
-- demo. Every account shares the password below. DEMO DATA ONLY - do not
-- run this against anything holding real users.
--
--   email:    firstname@cohort.test   (e.g. amara@cohort.test)
--   password: cohort2026
--
-- profiles.id is foreign-keyed to auth.users, so profile rows cannot exist
-- on their own. We insert the auth user and let the on_auth_user_created
-- trigger create the matching profile from raw_user_meta_data, then fill in
-- the fields the trigger does not carry (bio, interests).

do $$
declare
  demo record;
  new_id uuid;
begin
  for demo in
    select * from (values
      ('amara@cohort.test',  'Amara Boateng',     'Software Engineering', 'Cohort 12', 'Peckham',
       'Second-year SDE apprentice. I organise the Shoreditch cohort''s demo days and I''m always up for a coffee-and-code session.',
       array['TypeScript', 'Climbing', 'Board games', 'Mentoring']),
      ('finlay@cohort.test', 'Finlay Okoye',      'Cyber Security',       'Cohort 10', 'Croydon',
       'Blue team apprentice, CTF obsessive. Happy to walk anyone through their first capture-the-flag.',
       array['CTFs', 'Threat hunting', 'Cycling']),
      ('priya@cohort.test',  'Priya Chandran',    'Data',                 'Cohort 11', 'Ilford',
       'Data apprentice working on reporting pipelines. Learning dbt the hard way.',
       array['SQL', 'dbt', 'Baking', 'Netball']),
      ('tomasz@cohort.test', 'Tomasz Wieczorek',  'Software Engineering', 'Cohort 11', 'Walthamstow',
       'Backend-leaning SDE apprentice. Ask me about Go, or about the best pierogi in east London.',
       array['Go', 'Distributed systems', 'Football']),
      ('zainab@cohort.test', 'Zainab Hussain',    'Cyber Security',       'Cohort 9',  'Tooting',
       'Final-year cyber apprentice. I run the women-in-security meetup and mentor two first-years.',
       array['Incident response', 'Mentoring', 'Running']),
      ('leon@cohort.test',   'Leon Marsh',        'Data',                 'Cohort 12', 'Deptford',
       'First-year data apprentice, still figuring out which end of a dashboard is up. Keen to meet people.',
       array['Python', 'Visualisation', 'Music production']),
      ('aoife@cohort.test',  'Aoife Byrne',       'Software Engineering', 'Cohort 10', 'Archway',
       'Frontend apprentice. Accessibility is my thing - I will absolutely audit your colour contrast.',
       array['Accessibility', 'Design systems', 'Pottery']),
      ('kwame@cohort.test',  'Kwame Asante',      'Cyber Security',       'Cohort 11', 'Brixton',
       'Pen testing apprentice. Spend most weekends on Hack The Box.',
       array['Pen testing', 'Hack The Box', 'Basketball']),
      ('freya@cohort.test',  'Freya Lindqvist',   'Data',                 'Cohort 9',  'Clapham',
       'Final-year data apprentice moving into ML. Writing up my EPA project on forecasting.',
       array['Machine learning', 'Forecasting', 'Swimming']),
      ('osei@cohort.test',   'Osei Mensah',       'Software Engineering', 'Cohort 12', 'Stratford',
       'New SDE apprentice. Came in through a bootcamp, here for everything I can learn.',
       array['React', 'Open source', 'Chess'])
    ) as t(email, name, programme, cohort, location, bio, interests)
  loop
    -- Skip anyone already seeded so this file can be run more than once.
    if exists (select 1 from auth.users u where u.email = demo.email) then
      continue;
    end if;

    new_id := gen_random_uuid();

    insert into auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, created_at, updated_at,
      raw_app_meta_data, raw_user_meta_data,
      confirmation_token, recovery_token, email_change_token_new, email_change
    )
    values (
      '00000000-0000-0000-0000-000000000000',
      new_id,
      'authenticated',
      'authenticated',
      demo.email,
      extensions.crypt('cohort2026', extensions.gen_salt('bf')),
      now(), now(), now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object(
        'name',      demo.name,
        'programme', demo.programme,
        'cohort',    demo.cohort,
        'location',  demo.location
      ),
      '', '', '', ''
    );

    -- Supabase needs a matching identity row for email/password sign-in.
    insert into auth.identities (
      provider_id, user_id, identity_data, provider,
      last_sign_in_at, created_at, updated_at
    )
    values (
      new_id::text,
      new_id,
      jsonb_build_object('sub', new_id::text, 'email', demo.email, 'email_verified', true),
      'email',
      now(), now(), now()
    );

    -- The trigger created the profile; add what it does not carry.
    update public.profiles
       set bio = demo.bio,
           interests = demo.interests
     where id = new_id;
  end loop;
end $$;


-- ---------------------------------------------------------------------------
-- Demo events, hosted by the apprentices seeded above.
-- Mirrors MOCK_EVENTS in lib/mock-data.ts so the directory looks identical
-- once the UI reads from the database instead of the mock file.
-- ---------------------------------------------------------------------------

insert into public.events
  (slug, code, host_id, title, description, starts_at, ends_at, location, is_online, capacity, tags)
select v.slug, v.code, p.id, v.title, v.description,
       v.starts_at::timestamptz, v.ends_at::timestamptz,
       v.location, v.is_online, v.capacity, v.tags
from (values
  ('demo-day-sde-12', '№ 014', 'amara@cohort.test',
   'Demo Day: Software Engineering Cohort 12',
   'Cohort 12 presents the projects they''ve shipped this quarter. Sign-off sheets at the door, short talks, longer Q&A, drinks after.',
   '2026-10-03T14:00:00+01:00', '2026-10-03T17:00:00+01:00',
   'Shoreditch Campus, Studio 3', false, 60, array['SDE', 'Demo']),

  ('cyber-ctf-night', '№ 021', 'finlay@cohort.test',
   'Cyber Security Capture-the-Flag Night',
   'A relaxed CTF across three difficulty tracks. No experience required — pair up with someone from another cohort and learn as you go.',
   '2026-10-07T18:30:00+01:00', '2026-10-07T21:30:00+01:00',
   'Online — Discord', true, 40, array['Cyber', 'Social']),

  ('data-coffee-code', '№ 022', 'priya@cohort.test',
   'Data Apprentices Coffee & Code',
   'Bring a dataset you''re stuck on. Informal, small, and usually ends with someone''s dashboard getting fixed over a flat white.',
   '2026-10-09T09:00:00+01:00', '2026-10-09T10:30:00+01:00',
   'Camden Hub, Kitchen', false, 20, array['Data', 'Networking']),

  ('cross-cohort-quiz', '№ 027', 'aoife@cohort.test',
   'Cross-Cohort Quiz Night',
   'Teams of four, mixed across programmes on purpose. Prizes are mostly bragging rights and one real trophy that gets re-engraved every month.',
   '2026-10-10T19:00:00+01:00', '2026-10-10T21:30:00+01:00',
   'The Old Dispensary, Hackney', false, 50, array['Social', 'Networking']),

  ('sde-portfolio-review', '№ 031', 'tomasz@cohort.test',
   'SDE Cohort 11 Portfolio Review',
   'Bring your portfolio for structured feedback from apprentices one cohort ahead. Sign up for a 15-minute slot or just come to watch.',
   '2026-10-14T13:00:00+01:00', '2026-10-14T16:00:00+01:00',
   'Shoreditch Campus, Studio 1', false, 30, array['SDE', 'Careers']),

  ('women-in-tech-meetup', '№ 034', 'zainab@cohort.test',
   'Women in Tech Apprentices Meetup',
   'Open to apprentices of all programmes. This month: a panel on navigating end-point assessment, then open networking.',
   '2026-10-16T18:00:00+01:00', '2026-10-16T20:00:00+01:00',
   'Online — Zoom', true, 80, array['Networking', 'Social']),

  ('cyber-grad-social', '№ 039', 'zainab@cohort.test',
   'Cyber Cohort 9 Graduation Social',
   'Cohort 9''s last official meetup before end-point assessment results land. Open bar tab for the first hour, courtesy of the alumni fund.',
   '2026-10-22T19:30:00+01:00', '2026-10-22T23:00:00+01:00',
   'Rooftop, Elephant & Castle', false, 45, array['Cyber', 'Social'])
) as v(slug, code, host_email, title, description, starts_at, ends_at, location, is_online, capacity, tags)
join public.profiles p on p.email = v.host_email
on conflict (slug) do nothing;


-- Who is going to what.
insert into public.rsvps (user_id, event_id, status)
select p.id, e.id, 'going'
from (values
  ('demo-day-sde-12',     'tomasz@cohort.test'),
  ('demo-day-sde-12',     'osei@cohort.test'),
  ('demo-day-sde-12',     'aoife@cohort.test'),
  ('demo-day-sde-12',     'priya@cohort.test'),
  ('demo-day-sde-12',     'leon@cohort.test'),

  ('cyber-ctf-night',     'zainab@cohort.test'),
  ('cyber-ctf-night',     'kwame@cohort.test'),
  ('cyber-ctf-night',     'leon@cohort.test'),

  ('data-coffee-code',    'freya@cohort.test'),
  ('data-coffee-code',    'leon@cohort.test'),

  ('cross-cohort-quiz',   'amara@cohort.test'),
  ('cross-cohort-quiz',   'zainab@cohort.test'),
  ('cross-cohort-quiz',   'osei@cohort.test'),
  ('cross-cohort-quiz',   'kwame@cohort.test'),

  ('sde-portfolio-review','amara@cohort.test'),
  ('sde-portfolio-review','osei@cohort.test'),

  ('women-in-tech-meetup','priya@cohort.test'),
  ('women-in-tech-meetup','freya@cohort.test'),
  ('women-in-tech-meetup','aoife@cohort.test'),

  ('cyber-grad-social',   'finlay@cohort.test'),
  ('cyber-grad-social',   'kwame@cohort.test'),
  ('cyber-grad-social',   'leon@cohort.test'),
  ('cyber-grad-social',   'osei@cohort.test')
) as v(slug, email)
join public.profiles p on p.email = v.email
join public.events   e on e.slug  = v.slug
on conflict (user_id, event_id) do nothing;
