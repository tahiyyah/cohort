"use client";

import { useMemo, useState } from "react";
import ListingRow from "../listing-row";
import type { EventListing } from "@/lib/events";

type LocationFilter = "all" | "online" | "in-person";

export default function EventsBrowser({ events }: { events: EventListing[] }) {
  const [activeTags, setActiveTags] = useState<Set<string>>(new Set());
  const [locationFilter, setLocationFilter] = useState<LocationFilter>("all");

  const allTags = useMemo(
    () => Array.from(new Set(events.flatMap((event) => event.tags))).sort(),
    [events]
  );

  function toggleTag(tag: string) {
    setActiveTags((prev) => {
      const next = new Set(prev);
      if (next.has(tag)) {
        next.delete(tag);
      } else {
        next.add(tag);
      }
      return next;
    });
  }

  const filtered = useMemo(() => {
    return events.filter((event) => {
      const tagMatch = activeTags.size === 0 || event.tags.some((tag) => activeTags.has(tag));
      const locationMatch =
        locationFilter === "all" ||
        (locationFilter === "online" && event.isOnline) ||
        (locationFilter === "in-person" && !event.isOnline);
      return tagMatch && locationMatch;
    });
  }, [events, activeTags, locationFilter]);

  return (
    <>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: "var(--space-2)",
          marginBottom: "var(--space-5)",
        }}
      >
        {allTags.map((tag) => (
          <button
            key={tag}
            onClick={() => toggleTag(tag)}
            className="nav-tab"
            data-active={activeTags.has(tag)}
            type="button"
          >
            {tag}
          </button>
        ))}

        <span
          aria-hidden="true"
          style={{ width: "1px", height: "1.2rem", background: "var(--rail-dim)", margin: "0 var(--space-2)" }}
        />

        {(["all", "in-person", "online"] as LocationFilter[]).map((option) => (
          <button
            key={option}
            onClick={() => setLocationFilter(option)}
            className="nav-tab"
            data-active={locationFilter === option}
            type="button"
          >
            {option === "all" ? "All locations" : option === "in-person" ? "In person" : "Online"}
          </button>
        ))}
      </div>

      {filtered.length > 0 ? (
        <div className="event-grid">
          {filtered.map((event, index) => (
            <ListingRow key={event.id} event={event} index={index} />
          ))}
        </div>
      ) : (
        <p className="prose">No listings match those filters. Clear a tag or try another location.</p>
      )}
    </>
  );
}
