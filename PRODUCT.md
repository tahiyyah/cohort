# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Apprentices on apprenticeship programmes (e.g. software engineering, data, cyber), organized into cohorts, looking to find and attend events run by and for other apprentices. The job: discover relevant events (by date, location, tag), decide whether to go, and see who else from their programme/cohort/location is attending so showing up feels worthwhile.

## Product Purpose

Cohort is an events and networking platform exclusively for apprentices. It exists because general event platforms (e.g. Eventbrite) don't filter for "people like me" — apprentices want to meet other apprentices, not the general public. Success means an apprentice can find an event, RSVP, and recognize names/faces of people in their programme or cohort before they arrive.

## Positioning

Apprentice-only gating (planned: email domain check and/or invite code, not yet implemented) plus attendee visibility is the mechanism a general-purpose event platform could not truthfully copy — the exclusivity and peer-visibility are the product, not a feature bolted onto a generic event list.

## Operating Context

Built for a timeboxed hackathon. The team is split by ownership area: auth/apprentice verification/profiles, event create/edit, event feed/search/filters/detail, RSVPs/attendee list/data model/deployment, plus a PM handling user stories, mockups, seed data, and the pitch. Work is split across people and branches in the same repo and must integrate cleanly.

## Capabilities and Constraints

MVP scope (from the team's brief):
- Apprentice-only sign-up, gated by email domain check and/or invite code (not yet implemented — current signup accepts any email/password).
- Create an event: title, description, date/time, location (in-person or online), capacity, tags (e.g. "SDE", "networking", "social"), cover image.
- Browse and filter events by date, location, and tag.
- RSVP, with attendee count and a list of who's going.
- Profiles: name, apprenticeship programme, cohort, location, interests — surfaced so attendees can recognize each other.

Nice-to-haves (only if time allows): cohort/interest-based "apprentices like you are going" recommendations, comments/Q&A per event, .ics calendar export, map view, organizer/attendee badges.

Data model: `users` (id, name, email, programme, cohort, location, bio, avatar_url), `events` (id, host_id, title, description, starts_at, ends_at, location, is_online, capacity, cover_url, tags[]), `rsvps` (user_id, event_id, status, created_at).

Backend is already built: Next.js route handlers + Supabase Auth for signup/login/logout/session, with a `profiles` table (RLS + auto-provision trigger) matching the `users` shape above. Event/RSVP backend is not yet built.

## Brand Commitments

Product name: Cohort. No existing logo, color palette, or institutional branding to honor — this is a free design world for the hackathon.

## Evidence on Hand

No real content, demo data, testimonials, or press exists yet. Nothing to preserve or avoid fabricating beyond the MVP scope above — this is a from-scratch hackathon build.

## Product Principles

- Apprentice-only exclusivity and attendee visibility are the product's reason to exist — never design them as an afterthought gate on top of a generic event list.
- Cohort/programme/location context should surface naturally wherever people and events are shown, since that's what turns "an event" into "networking."
- This ships inside a hackathon demo window — favor clarity and a strong first impression over exhaustive edge-case coverage.
- Multiple people build this in parallel across branches; structure and naming should stay predictable enough for teammates to extend without collisions.
