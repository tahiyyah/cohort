import Link from "next/link";
import { formatEventWhen, isEventLive, type MockEvent } from "@/lib/mock-data";

// Each category gets its own cover gradient (always renders, zero
// network dependency) AND a real photo layered on top. If the photo
// fails to load — e.g. flaky venue wifi during the demo — the CSS
// background-image layer just goes transparent and the gradient
// underneath still shows, so the card never looks broken.
const COVER_GRADIENTS: Record<string, string> = {
  SDE: "linear-gradient(135deg, #FF8A5B, #F05537)",
  Cyber: "linear-gradient(135deg, #7C3AED, #4C1D95)",
  Data: "linear-gradient(135deg, #06B6D4, #0E7490)",
  Networking: "linear-gradient(135deg, #F472B6, #DB2777)",
  Social: "linear-gradient(135deg, #FBBF24, #F59E0B)",
  Careers: "linear-gradient(135deg, #34D399, #059669)",
  Demo: "linear-gradient(135deg, #818CF8, #4F46E5)",
};
const DEFAULT_GRADIENT = "linear-gradient(135deg, #C4B5FD, #7C3AED)";

const COVER_PHOTOS: Record<string, string> = {
  SDE: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=800&q=60",
  Cyber: "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?auto=format&fit=crop&w=800&q=60",
  Data: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=60",
  Networking: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=800&q=60",
  Social: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=800&q=60",
  Careers: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=800&q=60",
  Demo: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=60",
};

export default function ListingRow({
  event,
  index = 0,
}: {
  event: MockEvent;
  index?: number;
}) {
  const live = isEventLive(event);
  const category = event.tags[0];
  const gradient = COVER_GRADIENTS[category] ?? DEFAULT_GRADIENT;
  const photo = COVER_PHOTOS[category];

  return (
    <Link
      href={`/events/${event.id}`}
      className="listing"
      style={{ animationDelay: `${index * 55}ms` }}
    >
      <span
        className="listing-cover"
        style={{
          background: photo ? `url(${photo}) center/cover, ${gradient}` : gradient,
        }}
        aria-hidden="true"
      />

      <span className="listing-body">
        <span className="listing-title">{event.title}</span>

        <span className="listing-meta">
          {event.tags.map((tag) => (
            <span key={tag} className="listing-tag">
              {tag}
            </span>
          ))}
        </span>

        <span className="listing-location">{event.location}</span>

        <span className="listing-footer">
          {live ? (
            <span className="live-tag">
              <span className="live-dot" aria-hidden="true" />
              Live now
            </span>
          ) : (
            <span className="upcoming-date">{formatEventWhen(event)}</span>
          )}
        </span>
      </span>
    </Link>
  );
}
