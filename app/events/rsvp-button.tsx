"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RsvpButton({
  eventHref,
  capacity,
  baseCount,
  initiallyGoing,
}: {
  eventHref: string;
  capacity: number | null;
  baseCount: number;
  initiallyGoing: boolean;
}) {
  const router = useRouter();
  const [going, setGoing] = useState(initiallyGoing);
  const [count, setCount] = useState(baseCount);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const full = capacity !== null && !going && count >= capacity;

  async function toggle() {
    const next = !going;

    // Move the UI first, then put it back if the write fails.
    setGoing(next);
    setCount((c) => c + (next ? 1 : -1));
    setBusy(true);
    setError(null);

    try {
      const response = await fetch(`/api/events/${eventHref}/rsvp`, {
        method: next ? "POST" : "DELETE",
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error ?? "Could not save your RSVP.");
      }

      const body = await response.json();
      if (typeof body.attendeeCount === "number") setCount(body.attendeeCount);

      // Refresh so the attendee list below reflects the change.
      router.refresh();
    } catch (err) {
      setGoing(!next);
      setCount((c) => c + (next ? -1 : 1));
      setError(err instanceof Error ? err.message : "Could not save your RSVP.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-4)" }}>
        <button
          type="button"
          onClick={toggle}
          disabled={busy || full}
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
          {going ? "You're going" : full ? "Full" : "RSVP"}
        </button>
        <span className="mono-data" style={{ color: "var(--ink-dim)", fontSize: "0.85rem" }}>
          {capacity ? `${count} / ${capacity} going` : `${count} going`}
        </span>
      </div>
      {error && (
        <p className="field-error" role="alert" style={{ marginTop: "var(--space-3)" }}>
          {error}
        </p>
      )}
    </div>
  );
}
