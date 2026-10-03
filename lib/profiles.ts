import "server-only";

import { createClient } from "@/lib/supabase/server";

export interface Profile {
  id: string;
  email: string;
  name: string;
  programme: string | null;
  cohort: string | null;
  location: string | null;
  bio: string | null;
  interests: string[];
  avatarUrl: string | null;
}

/** The fields a person is allowed to change about themselves. */
export interface ProfilePatch {
  name?: string;
  programme?: string | null;
  cohort?: string | null;
  location?: string | null;
  bio?: string | null;
  interests?: string[];
}

const PROFILE_SELECT =
  "id, email, name, programme, cohort, location, bio, interests, avatar_url";

interface ProfileRow {
  id: string;
  email: string;
  name: string;
  programme: string | null;
  cohort: string | null;
  location: string | null;
  bio: string | null;
  interests: string[] | null;
  avatar_url: string | null;
}

function toProfile(row: ProfileRow): Profile {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    programme: row.programme,
    cohort: row.cohort,
    location: row.location,
    bio: row.bio,
    interests: row.interests ?? [],
    avatarUrl: row.avatar_url,
  };
}

export async function getProfile(userId: string): Promise<Profile | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select(PROFILE_SELECT)
    .eq("id", userId)
    .maybeSingle();

  if (error) throw new Error(`Could not load profile: ${error.message}`);
  return data ? toProfile(data as ProfileRow) : null;
}

export async function updateProfile(
  userId: string,
  patch: ProfilePatch
): Promise<Profile> {
  const supabase = await createClient();

  // Only forward keys the caller actually sent, so a partial edit cannot
  // blank out fields it never showed.
  const row: Record<string, unknown> = {};
  if (patch.name !== undefined) row.name = patch.name;
  if (patch.programme !== undefined) row.programme = patch.programme;
  if (patch.cohort !== undefined) row.cohort = patch.cohort;
  if (patch.location !== undefined) row.location = patch.location;
  if (patch.bio !== undefined) row.bio = patch.bio;
  if (patch.interests !== undefined) row.interests = patch.interests;

  const { data, error } = await supabase
    .from("profiles")
    .update(row)
    .eq("id", userId)
    .select(PROFILE_SELECT)
    .single();

  if (error) throw new Error(`Could not save profile: ${error.message}`);
  return toProfile(data as ProfileRow);
}
