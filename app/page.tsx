import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import LogoutButton from "./logout-button";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <main>
        <h1>Cohort</h1>
        <p>You&apos;re not signed in.</p>
        <p>
          <Link href="/login">Log in</Link> · <Link href="/signup">Sign up</Link>
        </p>
      </main>
    );
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return (
    <main>
      <h1>Cohort</h1>
      <p>
        Signed in as <strong>{profile?.name ?? user.email}</strong> ({user.email})
      </p>
      {profile?.programme && <p>Programme: {profile.programme}</p>}
      {profile?.cohort && <p>Cohort: {profile.cohort}</p>}
      {profile?.location && <p>Location: {profile.location}</p>}
      <LogoutButton />
    </main>
  );
}
