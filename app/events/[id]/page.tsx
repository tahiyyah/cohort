import Link from "next/link";
import { notFound } from "next/navigation";
import SignatureMark from "../../signature-mark";
import RsvpButton from "../rsvp-button";
import { APPRENTICE_POOL, formatEventWhen, getMockEvent, isEventLive } from "@/lib/mock-data";

function programmeFor(name: string): string | null {
  return APPRENTICE_POOL.find((a) => a.name === name)?.programme ?? null;
}

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const event = getMockEvent(id);

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
          {event.title} <span className="listing-code mono-data">{event.code}</span>
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
              {event.capacity} apprentices
            </dd>
          </div>
          <div>
            <dt className="field-label">Hosted by</dt>
            <dd style={{ margin: "var(--space-1) 0 0" }} className="signature">
              <SignatureMark name={event.hostName} />
              <span className="signature-name">{event.hostName}</span>
            </dd>
          </div>
        </dl>

        <RsvpButton capacity={event.capacity} baseCount={event.attendeeNames.length} />
      </div>

      <section style={{ marginTop: "var(--space-7)" }}>
        <h2 className="panel-kicker-free-heading">
          Who&apos;s going ({event.attendeeNames.length})
        </h2>
        <div className="seam" style={{ padding: "var(--space-5)" }}>
          <div className="attendee-grid">
            {event.attendeeNames.map((name) => (
              <span key={name} className="signature">
                <SignatureMark name={name} />
                <span>
                  <span className="signature-name" style={{ display: "block" }}>
                    {name}
                  </span>
                  <span className="signature-role">{programmeFor(name)}</span>
                </span>
              </span>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
