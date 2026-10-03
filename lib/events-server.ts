import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { EventInput, EventListing } from "@/lib/events";

/**
 * Event and RSVP queries. Server-only: importing this from a client
 * component is a build error, which is the point.
 */

// events -> profiles is ambiguous to PostgREST (host_id here, user_id via
// rsvps), so the host embed names its foreign key explicitly.
const EVENT_SELECT = `
  id, slug, code, title, description, starts_at, ends_at, location,
  is_online, capacity, tags,
  host:profiles!events_host_id_fkey ( name ),
  rsvps ( user_id, status, profile:profiles ( name, programme ) )
`;

interface EventRow {
  id: string;
  slug: string | null;
  code: string | null;
  title: string;
  description: string | null;
  starts_at: string;
  ends_at: string | null;
  location: string | null;
  is_online: boolean;
  capacity: number | null;
  tags: string[] | null;
  host: { name: string } | null;
  rsvps: {
    user_id: string;
    status: string;
    profile: { name: string; programme: string | null } | null;
  }[];
}

function toListing(row: EventRow, viewerId: string | null): EventListing {
  const going = (row.rsvps ?? []).filter((r) => r.status === "going");

  return {
    id: row.id,
    href: row.slug ?? row.id,
    code: row.code,
    title: row.title,
    tags: row.tags ?? [],
    description: row.description,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    location: row.location,
    isOnline: row.is_online,
    capacity: row.capacity,
    hostName: row.host?.name ?? "Unknown host",
    attendees: going.map((r) => ({
      name: r.profile?.name ?? "An apprentice",
      programme: r.profile?.programme ?? null,
    })),
    attendeeCount: going.length,
    viewerIsGoing: viewerId ? going.some((r) => r.user_id === viewerId) : false,
  };
}

export async function listEvents(viewerId: string | null): Promise<EventListing[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("events")
    .select(EVENT_SELECT)
    .order("starts_at", { ascending: true });

  if (error) throw new Error(`Could not load events: ${error.message}`);
  return (data as unknown as EventRow[]).map((row) => toListing(row, viewerId));
}

/** Accepts either the readable slug or the uuid. */
export async function getEvent(
  idOrSlug: string,
  viewerId: string | null
): Promise<EventListing | null> {
  const supabase = await createClient();
  const isUuid =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);

  const { data, error } = await supabase
    .from("events")
    .select(EVENT_SELECT)
    .eq(isUuid ? "id" : "slug", idOrSlug)
    .maybeSingle();

  if (error) throw new Error(`Could not load event: ${error.message}`);
  if (!data) return null;
  return toListing(data as unknown as EventRow, viewerId);
}

/** "Demo Day: SDE 12" -> "demo-day-sde-12", with a suffix if that is taken. */
function slugify(title: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return base || "event";
}

export async function createEvent(
  hostId: string,
  input: EventInput
): Promise<EventListing> {
  const supabase = await createClient();

  // Collisions are rare and the retry is cheap, so settle them by suffixing
  // rather than holding a lock.
  let slug = slugify(input.title);
  const { data: clash } = await supabase
    .from("events")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();
  if (clash) slug = `${slug}-${Math.random().toString(36).slice(2, 6)}`;

  const { data, error } = await supabase
    .from("events")
    .insert({
      host_id: hostId,
      slug,
      title: input.title,
      description: input.description ?? null,
      starts_at: input.startsAt,
      ends_at: input.endsAt ?? null,
      location: input.location ?? null,
      is_online: input.isOnline ?? false,
      capacity: input.capacity ?? null,
      tags: input.tags ?? [],
    })
    .select(EVENT_SELECT)
    .single();

  if (error) throw new Error(error.message);
  return toListing(data as unknown as EventRow, hostId);
}

/**
 * RSVP on or off. Writing "not_going" rather than deleting keeps a record
 * that the person looked and decided, which the attendee list ignores.
 */
export async function setRsvp(
  userId: string,
  eventId: string,
  going: boolean
): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("rsvps")
    .upsert(
      { user_id: userId, event_id: eventId, status: going ? "going" : "not_going" },
      { onConflict: "user_id,event_id" }
    );

  if (error) throw new Error(`Could not save RSVP: ${error.message}`);
}
