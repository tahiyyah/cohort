/**
 * Shapes and formatting for events.
 *
 * Deliberately free of any Supabase import: client components render these,
 * so pulling the server client in here would drag next/headers into the
 * browser bundle. The queries live in lib/events-server.ts.
 *
 * The field names match what the pages used while the data was mocked, so
 * the markup did not have to change when this became real.
 */

export interface Attendee {
  name: string;
  programme: string | null;
}

export interface EventListing {
  id: string;
  /** Readable URL segment; falls back to the uuid when an event has none. */
  href: string;
  code: string | null;
  title: string;
  tags: string[];
  description: string | null;
  startsAt: string;
  endsAt: string | null;
  location: string | null;
  isOnline: boolean;
  capacity: number | null;
  hostName: string;
  attendees: Attendee[];
  attendeeCount: number;
  viewerIsGoing: boolean;
}

export interface EventInput {
  title: string;
  description?: string | null;
  startsAt: string;
  endsAt?: string | null;
  location?: string | null;
  isOnline?: boolean;
  capacity?: number | null;
  tags?: string[];
}

export function isEventLive(
  event: Pick<EventListing, "startsAt" | "endsAt">,
  now: Date = new Date()
): boolean {
  const starts = new Date(event.startsAt).getTime();
  const ends = event.endsAt ? new Date(event.endsAt).getTime() : starts;
  const t = now.getTime();
  return t >= starts && t <= ends;
}

export function formatEventWhen(event: Pick<EventListing, "startsAt">): string {
  return new Date(event.startsAt).toLocaleString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}
