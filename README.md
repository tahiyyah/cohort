# cohort

MVP scope (must-haves for the demo)

1. Apprentice-only sign-up. Gate it with an email domain check, an invite code, or both. This is what makes you different from Eventbrite, so put it in the pitch.
2. Create an event: title, description, date/time, location (in person or online), capacity, tags (e.g. "SDE", "networking", "social"), and a cover image.
3. Browse and filter events by date, location and tag.
4. RSVP, with an attendee count and a list of who's going.
5. Profiles: name, apprenticeship programme, cohort, location, interests. Seeing who's attending is where the networking happens.

Nice-to-haves (only if you have time)

- "Apprentices like you are going": recommendations based on cohort or interests
- Comments or Q&A on each event
- Calendar export (.ics)
- Map view
- Badges for organising or attending events

Suggested stack (quick to build, easy to split across people)

- Frontend: Next.js + Tailwind (or React + Vite)
- Backend/data/auth: Supabase (Postgres, auth and file storage), or AWS Amplify (Cognito, AppSync/DynamoDB, S3) if the judges will value AWS
- Hosting: Vercel or Amplify Hosting, both deploy in minutes

Team split

┌────────┬───────────────────────────────────────────────────────────────────────────┐
│ Person │                                   Owns                                    │
├────────┼───────────────────────────────────────────────────────────────────────────┤
│ SDE 1  │ Auth and apprentice verification, profiles                                │
├────────┼───────────────────────────────────────────────────────────────────────────┤
│ SDE 2  │ Event create/edit, image upload                                           │
├────────┼───────────────────────────────────────────────────────────────────────────┤
│ SDE 3  │ Event feed, search and filters, event detail page                         │
├────────┼───────────────────────────────────────────────────────────────────────────┤
│ SDE 4  │ RSVPs and attendee list, data model, deployment                           │
├────────┼───────────────────────────────────────────────────────────────────────────┤
│ PM     │ User stories, UI mockups, seed data, pitch deck, demo script, timekeeping │
└────────┴───────────────────────────────────────────────────────────────────────────┘

Agree on the data model first (Users, Events, RSVPs, Tags) so everyone can work in parallel

Data model sketch

users(id, name, email, programme, cohort, location, bio, avatar_url)
events(id, host_id→users, title, description, starts_at, ends_at,
       location, is_online, capacity, cover_url, tags[])
rsvps(user_id→users, event_id→events, status, created_at)

I can scaffold the repo with the stack, schema, auth gating, base pages and seed data so all four SDEs can start building straight away. Tell me:
1. How long the hackathon is
2. Which stack you want (Supabase/Next.js, AWS Amplify, or something your team already knows)
3. How you want to verify that users are apprentices
