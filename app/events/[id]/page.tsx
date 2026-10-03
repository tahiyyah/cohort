import Link from "next/link";
import { notFound } from "next/navigation";
import PersonMark from "../../person-mark";
import RsvpButton from "../rsvp-button";
import { requireUser } from "@/lib/auth";
import { formatEventWhen, isEventLive } from "@/lib/events";
import { getEvent } from "@/lib/events-server";

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireUser(`/events/${id}`);
  const event = await getEvent(id, user.id);

  if (!event) {
    notFound();
  }

  const live = isEventLive(event);

  return (
    <>
      <Link href="/events" className="nav-tab" style={{ display: "inline-block", marginBottom: "var(--space-5)" }}>
        ← All events
      </Link>

      <div className="seam" style={{ padding: "var(--space-6) var(--space-5)" }}>
        <h1 className="panel-kicker-free-heading">
          {event.title}
        </h1>

        <div className="listing-meta" style={{ marginBottom: "var(--space-5)" }}>
          {event.tags.map((tag) => (
            <span key={tag} className="listing-tag">
              {tag}
            </span>
          ))}
          {live ? (
            <span className="live-tag">
              <span className="live-dot" aria-hidden="true" />
              Live now
            </span>
          ) : (
            <span className="upcoming-date">{formatEventWhen(event)}</span>
          )}
        </div>

        <p className="prose" style={{ marginBottom: "var(--space-5)" }}>
          {event.description}
        </p>

        <dl
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(10rem, 1fr))",
            gap: "var(--space-4)",
            marginBottom: "var(--space-6)",
            maxWidth: "36rem",
          }}
        >
          <div>
            <dt className="field-label">Location</dt>
            <dd className="mono-data" style={{ margin: "var(--space-1) 0 0", color: "var(--ink)" }}>
              {event.location}
            </dd>
          </div>
          <div>
            <dt className="field-label">Capacity</dt>
            <dd className="mono-data" style={{ margin: "var(--space-1) 0 0", color: "var(--ink)" }}>
              {event.capacity ? `${event.capacity} apprentices` : "No limit"}
            </dd>
          </div>
          <div>
            <dt className="field-label">Hosted by</dt>
            <dd style={{ margin: "var(--space-1) 0 0" }} className="signature">
              <PersonMark name={event.hostName} avatarUrl={event.hostAvatarUrl} />
              <span className="signature-name">{event.hostName}</span>
            </dd>
          </div>
        </dl>

        <RsvpButton
          eventHref={event.href}
          capacity={event.capacity}
          baseCount={event.attendeeCount}
          initiallyGoing={event.viewerIsGoing}
        />
      </div>

      <section style={{ marginTop: "var(--space-7)" }}>
        <h2 className="panel-kicker-free-heading">
          Who&apos;s going ({event.attendeeCount})
        </h2>
        <div className="seam" style={{ padding: "var(--space-5)" }}>
          {event.attendees.length > 0 ? (
            <div className="attendee-grid">
              {event.attendees.map((attendee) => (
                <span key={attendee.name} className="signature">
                  <PersonMark name={attendee.name} avatarUrl={attendee.avatarUrl} />
                  <span>
                    <span className="signature-name" style={{ display: "block" }}>
                      {attendee.name}
                    </span>
                    <span className="signature-role">{attendee.programme}</span>
                  </span>
                </span>
              ))}
            </div>
          ) : (
            <p className="prose" style={{ margin: 0 }}>
              Nobody has RSVPed yet. Be the first.
            </p>
          )}
        </div>
      </section>
    </>
  );
}
