-- Mock passports for development and the demo. Run in the Supabase SQL editor.
-- user_id is left null: these aren't real logins, so they show up in browse and
-- attendee lists but can't be edited through the app.

insert into public."Passports"
  (first_name, last_name, username, company, year, location, age, interests, bio, profile_picture, user_id)
values
  ('Priya', 'Sharma', 'priyacodes', 'BAE Systems', 3, 'Bristol', 21,
   array['Software', 'Cyber Security', 'Climbing'],
   'Third year software apprentice. Ask me about CTFs or the best bouldering walls in Bristol.',
   null, null),

  ('Jordan', 'Okafor', 'jokafor', 'Rolls-Royce', 1, 'Derby', 18,
   array['Data', 'Football', 'Gaming'],
   'Just started my data analyst apprenticeship. Looking for people to play five-a-side with.',
   null, null),

  ('Chloe', 'Bennett', 'chloeb', 'Airbus', 2, 'Stevenage', 20,
   array['Software', 'Space', 'Photography'],
   'Working on satellite ground systems. Always up for a coffee and a chat about space.',
   null, null),

  ('Tom', 'Hughes', 'tomhughes', 'Jaguar Land Rover', 4, 'Coventry', 22,
   array['Electrical Engineering', 'Cars', 'Food'],
   'Final year engineering apprentice. Happy to give advice on the end-point assessment.',
   null, null),

  ('Aisha', 'Rahman', 'aisharahman', 'BT Group', 2, 'London', 19,
   array['Networking', 'Software', 'Music'],
   'Network engineering apprentice. I organise the monthly London apprentice meetup.',
   null, null)
on conflict (username) do nothing;
