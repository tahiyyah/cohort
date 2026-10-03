import { requireUser } from "@/lib/auth";
import { listEvents } from "@/lib/events-server";
import EventsBrowser from "./events-browser";

export default async function EventsPage() {
  const user = await requireUser("/events");
  const events = await listEvents(user.id);

  return (
    <>
      <h1 className="panel-kicker-free-heading">All events</h1>

      {events.length > 0 ? (
        <EventsBrowser events={events} />
      ) : (
        <p className="prose" style={{ padding: "var(--space-6) var(--space-5)" }}>
          No events on the board yet. Be the first to host one.
        </p>
      )}
    </>
  );
}
