import Link from "next/link";
import { formatEventWhen, isEventLive, type MockEvent } from "@/lib/mock-data";

export default function ListingRow({
  event,
  index = 0,
}: {
  event: MockEvent;
  index?: number;
}) {
  const live = isEventLive(event);

  return (
    <Link
      href={`/events/${event.id}`}
      className="listing"
      style={{ animationDelay: `${index * 55}ms` }}
    >
      <span className="listing-code mono-data">{event.code}</span>

      <span className="listing-main">
        <span className="listing-title">{event.title}</span>
        <span className="listing-meta">
          {event.tags.map((tag) => (
            <span key={tag} className="listing-tag">
              {tag}
            </span>
          ))}
          <span className="mono-data">{event.location}</span>
        </span>
      </span>

      <span className="listing-status">
        {live ? (
          <span className="live-tag">
            <span className="live-dot" aria-hidden="true" />
            Live now
          </span>
        ) : (
          <span className="upcoming-date">{formatEventWhen(event)}</span>
        )}
      </span>
    </Link>
  );
}
