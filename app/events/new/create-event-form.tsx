"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const TAG_OPTIONS = ["SDE", "Data", "Cyber", "Networking", "Social", "Careers", "Demo"];

/** datetime-local gives "2026-10-03T14:00" in the browser's zone. */
function toIso(value: string): string {
  return new Date(value).toISOString();
}

export default function CreateEventForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [isOnline, setIsOnline] = useState(false);
  const [location, setLocation] = useState("");
  const [capacity, setCapacity] = useState("");
  const [tags, setTags] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggleTag(tag: string) {
    setTags((prev) => {
      const next = new Set(prev);
      if (next.has(tag)) {
        next.delete(tag);
      } else {
        next.add(tag);
      }
      return next;
    });
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();

    if (endsAt && new Date(endsAt) < new Date(startsAt)) {
      setError("The end time is before the start time.");
      return;
    }

    setBusy(true);
    setError(null);

    try {
      const response = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          startsAt: toIso(startsAt),
          endsAt: endsAt ? toIso(endsAt) : null,
          location,
          isOnline,
          capacity: capacity ? Number(capacity) : null,
          tags: Array.from(tags),
        }),
      });

      const body = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(body?.error ?? "Could not publish the listing.");
      }

      router.push(`/events/${body.event.href}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not publish the listing.");
      setBusy(false);
    }
  }

  return (
    <section className="seam" style={{ padding: "var(--space-6) var(--space-5)", maxWidth: "36rem" }}>
      <h1 className="panel-kicker-free-heading">
        Host an event <span className="listing-code mono-data">№ 0XX</span>
      </h1>

      <form onSubmit={submit}>
        <div className="field">
          <label className="field-label" htmlFor="title">
            Title
          </label>
          <input
            id="title"
            type="text"
            placeholder="Cross-Cohort Quiz Night"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div className="field">
          <label className="field-label" htmlFor="description">
            Description
          </label>
          <textarea
            id="description"
            placeholder="What's happening, and who should come?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>

        <div className="field-row">
          <div className="field">
            <label className="field-label" htmlFor="startsAt">
              Starts
            </label>
            <input
              id="startsAt"
              type="datetime-local"
              value={startsAt}
              onChange={(e) => setStartsAt(e.target.value)}
              required
            />
          </div>
          <div className="field">
            <label className="field-label" htmlFor="endsAt">
              Ends
            </label>
            <input
              id="endsAt"
              type="datetime-local"
              value={endsAt}
              onChange={(e) => setEndsAt(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="field">
          <span className="field-label">Location</span>
          <div style={{ display: "flex", gap: "var(--space-2)", marginBottom: "var(--space-3)" }}>
            <button
              type="button"
              className="nav-tab"
              data-active={!isOnline}
              onClick={() => setIsOnline(false)}
            >
              In person
            </button>
            <button
              type="button"
              className="nav-tab"
              data-active={isOnline}
              onClick={() => setIsOnline(true)}
            >
              Online
            </button>
          </div>
          <input
            type="text"
            placeholder={isOnline ? "Zoom, Discord, or other link" : "Shoreditch Campus, Studio 2"}
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
          />
        </div>

        <div className="field">
          <label className="field-label" htmlFor="capacity">
            Capacity
          </label>
          <input
            id="capacity"
            type="number"
            min={1}
            placeholder="40"
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
            required
          />
        </div>

        <div className="field">
          <span className="field-label">Tags</span>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-2)" }}>
            {TAG_OPTIONS.map((tag) => (
              <button
                key={tag}
                type="button"
                className="nav-tab"
                data-active={tags.has(tag)}
                onClick={() => toggleTag(tag)}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <p className="field-error" role="alert">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={busy}
          className="tab-button tab-button--primary"
          style={{ width: "100%", marginTop: "var(--space-2)" }}
        >
          {busy ? "Publishing…" : "Publish listing"}
        </button>
      </form>
    </section>
  );
}
