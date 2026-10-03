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
    <section className="seam">
      {user ? (
        <h1 className="panel-kicker-free-heading hero-intro">
          Welcome back{profile?.name ? `, ${profile.name}` : ""}. Your cohort&apos;s board is below.
        </h1>
      ) : (
        <h1 className="panel-kicker-free-heading hero-intro">
          This board lists what&apos;s happening across the apprenticeship right now.
          Built by and for apprentices — sign up to see who&apos;s attending.
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

      {featured.map((event, index) => (
        <ListingRow key={event.id} event={event} index={index} />
      ))}
    </section>
  );
}
