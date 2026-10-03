# Auth API

Backend-only. These are Next.js route handlers backed by Supabase Auth.
Session state lives in HTTP-only cookies set by Supabase — the frontend
does not need to store or send a token manually, just use
`credentials: "include"` (same-origin fetches include cookies by default).

Signup is open — any email/password is accepted, and Google sign-in is
also available (see below). Apprentice-gating was considered and
deliberately left out.

## POST /api/auth/signup

Request body:

```json
{
  "email": "string (required)",
  "password": "string (required)",
  "name": "string (required)",
  "programme": "string (optional)",
  "cohort": "string (optional)",
  "location": "string (optional)"
}
```

Success — `201`:

```json
{ "user": { "id": "...", "email": "...", ... }, "session": { ... } }
```

Errors:
- `400` — missing required field, or Supabase validation error (e.g. weak
  password, malformed email). Body: `{ "error": "message" }`.

Note: if Supabase email confirmation is turned on for the project,
`session` will be `null` until the user confirms their email — treat that
as "check your email" in the UI rather than a failure.

A matching row in `profiles` (name, programme, cohort, location) is
created automatically by a DB trigger — no separate profile-creation call
needed.

## POST /api/auth/login

Request body:

```json
{ "email": "string (required)", "password": "string (required)" }
```

Success — `200`: same shape as signup's success response.

Errors:
- `400` — missing field.
- `401` — invalid credentials. Body: `{ "error": "message" }`.

## POST /api/auth/logout

No body. Success — `200`: `{ "success": true }`. Clears the session
cookie.

## GET /api/auth/session

Returns the currently logged-in user (reads the session cookie, no body
needed). Always `200`:

```json
{ "user": { "id": "...", "email": "...", ... }, "profile": { "id": "...", "name": "...", "programme": "...", "cohort": "...", "location": "...", "bio": "...", "avatar_url": "..." } }
```

or, when logged out:

```json
{ "user": null, "profile": null }
```

Use this on page load to decide whether to show logged-in vs
logged-out UI.

## Setup required before this works

1. Copy `.env.example` to `.env.local` and paste the **anon public key**
   from the Supabase dashboard (Project Settings → API Keys). The project
   URL is already filled in. Never put the `service_role` key here.
2. In the Supabase SQL editor, run `supabase/schema.sql` — it creates
   `profiles`, `events` and `rsvps` with their RLS policies and the
   auto-provision trigger. It is safe to re-run.
3. Optionally run `supabase/seed.sql` for ten demo apprentices and seven
   events. Those are real logins: `firstname@cohort.test` / `cohort2026`.
   Demo data only — it writes to auth internals.
4. `npm install && npm run dev`.

---

# Google sign-in

Client-side, not a route handler. `app/google-button.tsx` calls
`supabase.auth.signInWithOAuth({ provider: "google" })` with a `redirectTo`
of `/auth/callback?next=<path>`.

## GET /auth/callback

Where Supabase returns the browser after Google. Exchanges the one-time
`code` for a session cookie, then redirects to `next` (relative paths only
— anything else is forced to `/`). On failure it redirects to
`/login?error=<message>`.

Requires dashboard setup: Google provider enabled in Supabase with a
Client ID/Secret, the Supabase callback URL registered in Google Cloud,
and the app's origin allowed under Authentication → URL Configuration.

---

# Events API

All endpoints require a session; without one they return `401` with
`{ "error": "Not signed in" }`.

An event is addressed by either its readable `slug` or its uuid. Responses
carry `href`, which is whichever of the two to use in a URL.

## GET /api/events

Returns every event, soonest first.

```json
{ "events": [ { "id": "...", "href": "demo-day-sde-12", "code": "№ 014",
  "title": "...", "tags": ["SDE"], "description": "...",
  "startsAt": "2026-10-03T13:00:00+00:00", "endsAt": "...",
  "location": "...", "isOnline": false, "capacity": 60,
  "hostName": "Amara Boateng",
  "attendees": [ { "name": "...", "programme": "..." } ],
  "attendeeCount": 5, "viewerIsGoing": false } ] }
```

## POST /api/events

Creates an event hosted by the signed-in user. A `slug` is generated from
the title.

Request body: `title` and `startsAt` (ISO 8601) are required;
`description`, `endsAt`, `location`, `isOnline`, `capacity`, `tags[]`
optional.

- `201` — `{ "event": { ... } }`, same shape as above.
- `400` — missing/invalid field, e.g. `endsAt` before `startsAt`.

## POST /api/events/:idOrSlug/rsvp

Marks the signed-in user as going. `DELETE` on the same path marks them
not going. Both are idempotent.

- `200` — `{ "going": true, "attendeeCount": 6 }`
- `404` — no such event.

---

# Profile API

## GET /api/profile

`{ "profile": { "id", "email", "name", "programme", "cohort", "location",
"bio", "interests": [], "avatarUrl" } }` for the signed-in user.

## PATCH /api/profile

Partial update — only the keys you send are written, so a partial edit
cannot blank fields it never showed. Accepts `name`, `programme`,
`cohort`, `location`, `bio`, `interests[]`.

- `200` — `{ "profile": { ... } }`
- `400` — `name` sent but empty.
