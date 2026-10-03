import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import ListingRow from "./listing-row";
import { MOCK_EVENTS, isEventLive } from "@/lib/mock-data";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profileName: string | null = null;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("name")
      .eq("id", user.id)
      .single();
    profileName = profile?.name ?? null;
  }

  const live = MOCK_EVENTS.filter((event) => isEventLive(event));
  const upcoming = MOCK_EVENTS.filter((event) => !isEventLive(event)).slice(0, 6);
  const featured = [...live, ...upcoming];

  return (
    <>
      {user ? (
        <h1 className="panel-kicker-free-heading hero-intro">
          Welcome back{profileName ? `, ${profileName}` : ""}. Here&apos;s what your cohort is up to.
        </h1>
      ) : (
        <h1 className="panel-kicker-free-heading hero-intro">
          Find out what&apos;s happening across the apprenticeship right now.
          Apprentices only — sign up with your cohort to see who&apos;s attending.
        </h1>
      )}

      <div className="cta-row">
        {user ? (
          <>
            <Link href="/profile" className="tab-button">
              My profile
            </Link>
            <Link href="/events" className="tab-button tab-button--primary">
              Browse events
            </Link>
          </>
        ) : (
          <>
            <Link href="/login" className="tab-button">
              Log in
            </Link>
            <Link href="/signup" className="tab-button tab-button--primary">
              Sign up
            </Link>
          </>
        )}
      </div>

      <div className="event-grid">
        {featured.map((event, index) => (
          <ListingRow key={event.id} event={event} index={index} />
        ))}
      </div>
    </>
  );
}
