"use client";

import { useState } from "react";

export default function RsvpButton({ capacity, baseCount }: { capacity: number; baseCount: number }) {
  const [going, setGoing] = useState(false);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "var(--space-4)" }}>
      <button
        type="button"
        onClick={() => setGoing((prev) => !prev)}
        className={going ? "tab-button" : "tab-button tab-button--primary"}
      >
        {going && (
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path
              d="M3 8.5 L6.5 12 L13 4.5"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
        {going ? "You're going" : "RSVP"}
      </button>
      <span className="mono-data" style={{ color: "var(--ink-dim)", fontSize: "0.85rem" }}>
        {baseCount + (going ? 1 : 0)} / {capacity} going
      </span>
    </div>
  );
}
