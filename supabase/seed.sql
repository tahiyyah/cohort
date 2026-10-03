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
