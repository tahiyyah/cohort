# Auth API

Backend-only. These are Next.js route handlers backed by Supabase Auth.
Session state lives in HTTP-only cookies set by Supabase — the frontend
does not need to store or send a token manually, just use
`credentials: "include"` (same-origin fetches include cookies by default).

No apprentice-gating (email domain / invite code) is applied yet — any
email/password can sign up. That can be added inside
`app/api/auth/signup/route.ts` later without changing the contract below.

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

1. In the Supabase dashboard (Project Settings → API), copy the **anon
   public key** into `.env.local` as `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   (currently a placeholder).
2. In the Supabase SQL editor, run `supabase/schema.sql` once to create
   the `profiles` table, its RLS policies, and the auto-provision
   trigger.
3. `npm install && npm run dev`.
