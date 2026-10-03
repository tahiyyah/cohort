import "server-only";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * Data access layer for the signed-in user.
 *
 * The Next.js docs are explicit that Proxy (proxy.ts) is for optimistic
 * cookie refresh only, not authorisation - so every page and route handler
 * that needs a user asks for one here, close to the data.
 */

export interface SessionUser {
  id: string;
  email: string;
}

export async function getUser(): Promise<SessionUser | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;
  return { id: user.id, email: user.email ?? "" };
}

/**
 * For pages. Sends anonymous visitors to the login form, remembering where
 * they were headed so the callback can send them back.
 */
export async function requireUser(returnTo: string): Promise<SessionUser> {
  const user = await getUser();
  // redirect() throws, so it must not sit inside a try block.
  if (!user) redirect(`/login?next=${encodeURIComponent(returnTo)}`);
  return user;
}
