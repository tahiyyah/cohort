import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { getEvent, setRsvp } from "@/lib/events-server";

/**
 * The [id] segment accepts a slug or a uuid, matching /events/[id], so the
 * event is resolved before writing rather than trusting the path.
 */
async function resolveEventId(idOrSlug: string, viewerId: string) {
  const event = await getEvent(idOrSlug, viewerId);
  return event?.id ?? null;
}

export async function POST(_request: Request, ctx: { params: Promise<{ id: string }> }) {
  return write(ctx, true);
}

export async function DELETE(_request: Request, ctx: { params: Promise<{ id: string }> }) {
  return write(ctx, false);
}

async function write(ctx: { params: Promise<{ id: string }> }, going: boolean) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const { id } = await ctx.params;

  try {
    const eventId = await resolveEventId(id, user.id);
    if (!eventId) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    await setRsvp(user.id, eventId, going);

    const event = await getEvent(eventId, user.id);
    return NextResponse.json({
      going,
      attendeeCount: event?.attendeeCount ?? 0,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
