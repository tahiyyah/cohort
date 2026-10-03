import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { getProfile, updateProfile, type ProfilePatch } from "@/lib/profiles";

export async function GET() {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  try {
    return NextResponse.json({ profile: await getProfile(user.id) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Expected a JSON body" }, { status: 400 });
  }

  if (body.name !== undefined && !String(body.name).trim()) {
    return NextResponse.json({ error: "name cannot be empty" }, { status: 400 });
  }

  const patch: ProfilePatch = {};
  if (body.name !== undefined) patch.name = String(body.name).trim();
  if (body.programme !== undefined) patch.programme = body.programme || null;
  if (body.cohort !== undefined) patch.cohort = body.cohort || null;
  if (body.location !== undefined) patch.location = body.location || null;
  if (body.bio !== undefined) patch.bio = body.bio || null;
  if (body.interests !== undefined) {
    patch.interests = Array.isArray(body.interests)
      ? body.interests.map(String).map((s: string) => s.trim()).filter(Boolean)
      : [];
  }

  try {
    return NextResponse.json({ profile: await updateProfile(user.id, patch) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
