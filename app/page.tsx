import Link from "next/link";
import { getUser } from "@/lib/auth";
import { getProfile } from "@/lib/profiles";
import { isEventLive } from "@/lib/events";
import { listEvents } from "@/lib/events-server";
import ListingRow from "./listing-row";

export default async function HomePage() {
  const user = await getUser();
  const profile = user ? await getProfile(user.id) : null;

  // Events are readable by signed-in apprentices only, so the board stays
  // empty for visitors - the copy above it does the selling instead.
  const events = user ? await listEvents(user.id) : [];
  const live = events.filter((event) => isEventLive(event));
  const upcoming = events.filter((event) => !isEventLive(event)).slice(0, 6);
  const featured = [...live, ...upcoming];

  return (
    <>
      <section className="hero">
        {user ? (
          <>
            <h1 className="hero-title">
              Your cohort is <em>out there</em>{profile?.name ? `, ${profile.name}` : ""}.
            </h1>
            <p className="hero-sub">
              Talks, study sessions, socials and side-project nights — everything
              apprentices are putting on this week, in one place.
            </p>
          </>
        ) : (
          <>
            <h1 className="hero-title">
              Events by apprentices, <em>for apprentices</em>.
            </h1>
            <p className="hero-sub">
              See what&apos;s happening across the apprenticeship right now.
              Apprentices only — sign up with your cohort to see who&apos;s attending.
            </p>
          </>
        )}

        <div className="cta-row">
          {user ? (
            <>
              <Link href="/events" className="tab-button tab-button--primary">
                Browse events
              </Link>
              <Link href="/profile" className="tab-button">
                My profile
              </Link>
            </>
          ) : (
            <>
              <Link href="/signup" className="tab-button tab-button--primary">
                Sign up
              </Link>
              <Link href="/login" className="tab-button">
                Log in
              </Link>
            </>
          )}
        </div>
      </section>

      <div className="event-grid">
        {featured.map((event, index) => (
          <ListingRow key={event.id} event={event} index={index} />
        ))}
      </div>
    </>
  );
}
