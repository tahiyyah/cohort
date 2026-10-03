import { supabase } from "./supabase";

const TABLE = "Passports";
const AVATAR_BUCKET = "avatars";

// Only these columns can be set from the client. id and user_id are set by the database/auth.
const EDITABLE_FIELDS = [
  "first_name",
  "last_name",
  "username",
  "company",
  "year",
  "location",
  "age",
  "interests",
  "bio",
  "profile_picture",
];

const REQUIRED_FIELDS = ["first_name", "last_name", "username"];

function pickEditable(fields) {
  const out = {};
  for (const key of EDITABLE_FIELDS) {
    if (fields[key] !== undefined) out[key] = fields[key];
  }
  if (out.interests) out.interests = normaliseInterests(out.interests);
  if (out.username) out.username = out.username.trim();
  for (const key of ["year", "age"]) {
    if (out[key] === "" || out[key] === null) out[key] = null;
    else if (out[key] !== undefined) out[key] = Number(out[key]);
  }
  return out;
}

// Accepts an array or a comma-separated string; trims and removes case-insensitive duplicates.
export function normaliseInterests(interests) {
  const list = Array.isArray(interests)
    ? interests
    : String(interests).split(",");
  const seen = new Set();
  return list
    .map((i) => i.trim())
    .filter((i) => {
      const key = i.toLowerCase();
      if (!i || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

async function requireUser() {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  if (!data.user) throw new Error("Not signed in");
  return data.user;
}

// Returns the passport with this id, or null if it doesn't exist.
export async function getProfile(id) {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

// Returns the passport with this username, or null if it doesn't exist.
export async function getProfileByUsername(username) {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("username", username.trim())
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function isUsernameAvailable(username) {
  const existing = await getProfileByUsername(username);
  if (!existing) return true;
  const { data } = await supabase.auth.getUser();
  return existing.user_id === data.user?.id;
}

// Returns the signed-in user's passport, or null if they haven't completed onboarding.
export async function getMyProfile() {
  const user = await requireUser();
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

// Create-or-update for the onboarding form. Requires first_name, last_name and username.
export async function saveMyProfile(fields) {
  const user = await requireUser();
  const row = { ...pickEditable(fields), user_id: user.id };
  const missing = REQUIRED_FIELDS.filter((key) => !row[key]);
  if (missing.length) throw new Error(`Missing: ${missing.join(", ")}`);

  const { data, error } = await supabase
    .from(TABLE)
    .upsert(row, { onConflict: "user_id" })
    .select()
    .single();
  if (error) throw error;
  return data;
}

// Partial update for the edit-profile page.
export async function updateMyProfile(fields) {
  const user = await requireUser();
  const changes = pickEditable(fields);
  if (Object.keys(changes).length === 0) return getMyProfile();

  const { data, error } = await supabase
    .from(TABLE)
    .update(changes)
    .eq("user_id", user.id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// Browse/filter passports. All filters are optional.
// `search` matches first name, last name or username.
export async function listProfiles({
  company,
  year,
  location,
  interest,
  search,
  limit = 50,
  offset = 0,
} = {}) {
  let query = supabase
    .from(TABLE)
    .select("*")
    .order("first_name", { ascending: true })
    .range(offset, offset + limit - 1);

  if (company) query = query.ilike("company", `%${company}%`);
  if (year) query = query.eq("year", Number(year));
  if (location) query = query.ilike("location", `%${location}%`);
  if (interest) query = query.contains("interests", [interest.trim()]);
  if (search) {
    // Strip characters that would break PostgREST's or() syntax
    const term = search.replace(/[,()]/g, "").trim();
    if (term) {
      query = query.or(
        `first_name.ilike.%${term}%,last_name.ilike.%${term}%,username.ilike.%${term}%`,
      );
    }
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

// Fetch several passports at once, e.g. for an event's attendee list.
export async function getProfilesByIds(ids) {
  if (!ids?.length) return [];
  const { data, error } = await supabase.from(TABLE).select("*").in("id", ids);
  if (error) throw error;
  return data;
}

// Uploads an image to avatars/<user_id>/avatar.<ext> and saves its public URL on the passport.
export async function uploadAvatar(file) {
  const user = await requireUser();
  const ext = file.name.split(".").pop().toLowerCase();
  const path = `${user.id}/avatar.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from(AVATAR_BUCKET)
    .upload(path, file, { upsert: true, contentType: file.type });
  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(path);
  // Cache-bust so the new image shows immediately after replacing an old one
  const avatarUrl = `${data.publicUrl}?v=${Date.now()}`;
  return updateMyProfile({ profile_picture: avatarUrl });
}

// Display helper: "Ahsan Malik"
export function fullName(profile) {
  return [profile?.first_name, profile?.last_name].filter(Boolean).join(" ");
}
