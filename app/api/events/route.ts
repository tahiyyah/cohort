import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { createEvent, listEvents } from "@/lib/events-server";

export async function GET() {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  try {
    return NextResponse.json({ events: await listEvents(user.id) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);

  if (!body?.title || !body?.startsAt) {
    return NextResponse.json(
      { error: "title and startsAt are required" },
      { status: 400 }
    );
  }

  if (Number.isNaN(Date.parse(body.startsAt))) {
    return NextResponse.json({ error: "startsAt is not a valid date" }, { status: 400 });
  }
  if (body.endsAt && Number.isNaN(Date.parse(body.endsAt))) {
    return NextResponse.json({ error: "endsAt is not a valid date" }, { status: 400 });
  }
  if (body.endsAt && Date.parse(body.endsAt) < Date.parse(body.startsAt)) {
    return NextResponse.json({ error: "endsAt must be after startsAt" }, { status: 400 });
  }

  try {
    const event = await createEvent(user.id, {
      title: String(body.title),
      description: body.description ?? null,
      startsAt: body.startsAt,
      endsAt: body.endsAt ?? null,
      location: body.location ?? null,
      isOnline: Boolean(body.isOnline),
      capacity: body.capacity ? Number(body.capacity) : null,
      tags: Array.isArray(body.tags) ? body.tags.map(String) : [],
    });
    return NextResponse.json({ event }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
