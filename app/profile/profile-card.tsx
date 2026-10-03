"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import SignatureMark from "../signature-mark";
import type { Profile } from "@/lib/profiles";

/** Nullable DB columns, flattened to strings for the form inputs. */
interface Draft {
  name: string;
  programme: string;
  cohort: string;
  location: string;
  bio: string;
}

function toDraft(profile: Profile): Draft {
  return {
    name: profile.name,
    programme: profile.programme ?? "",
    cohort: profile.cohort ?? "",
    location: profile.location ?? "",
    bio: profile.bio ?? "",
  };
}

export default function ProfileCard({ initialProfile }: { initialProfile: Profile }) {
  const router = useRouter();
  const [profile, setProfile] = useState(initialProfile);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Draft>(toDraft(initialProfile));
  const [interestsInput, setInterestsInput] = useState(initialProfile.interests.join(", "));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function startEditing() {
    setDraft(toDraft(profile));
    setInterestsInput(profile.interests.join(", "));
    setError(null);
    setEditing(true);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);

    const patch = {
      ...draft,
      interests: interestsInput
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    };

    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });

      const body = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(body?.error ?? "Could not save your profile.");
      }

      setProfile(body.profile);
      setEditing(false);
      // Other surfaces show this name, so let them re-read it.
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save your profile.");
    } finally {
      setBusy(false);
    }
  }

  if (editing) {
    return (
      <section className="seam" style={{ padding: "var(--space-6) var(--space-5)", maxWidth: "32rem" }}>
        <h1 className="panel-kicker-free-heading">
          Edit your directory entry <span className="listing-code mono-data">№ 00A</span>
        </h1>

        <form onSubmit={save}>
          <div className="field">
            <label className="field-label" htmlFor="profile-name">
              Name
            </label>
            <input
              id="profile-name"
              type="text"
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              required
            />
          </div>

          <div className="field-row">
            <div className="field">
              <label className="field-label" htmlFor="profile-programme">
                Programme
              </label>
              <input
                id="profile-programme"
                type="text"
                value={draft.programme}
                onChange={(e) => setDraft({ ...draft, programme: e.target.value })}
              />
            </div>
            <div className="field">
              <label className="field-label" htmlFor="profile-cohort">
                Cohort
              </label>
              <input
                id="profile-cohort"
                type="text"
                value={draft.cohort}
                onChange={(e) => setDraft({ ...draft, cohort: e.target.value })}
              />
            </div>
          </div>

          <div className="field">
            <label className="field-label" htmlFor="profile-location">
              Location
            </label>
            <input
              id="profile-location"
              type="text"
              value={draft.location}
              onChange={(e) => setDraft({ ...draft, location: e.target.value })}
            />
          </div>

          <div className="field">
            <label className="field-label" htmlFor="profile-bio">
              Bio
            </label>
            <textarea
              id="profile-bio"
              value={draft.bio}
              onChange={(e) => setDraft({ ...draft, bio: e.target.value })}
            />
          </div>

          <div className="field">
            <label className="field-label" htmlFor="profile-interests">
              Interests
            </label>
            <input
              id="profile-interests"
              type="text"
              placeholder="TypeScript, Climbing, Board games"
              value={interestsInput}
              onChange={(e) => setInterestsInput(e.target.value)}
            />
            <span className="field-hint">Comma-separated.</span>
          </div>

          {error && (
            <p className="field-error" role="alert">
              {error}
            </p>
          )}

          <div style={{ display: "flex", gap: "var(--space-3)" }}>
            <button
              type="button"
              className="tab-button"
              onClick={() => setEditing(false)}
              disabled={busy}
            >
              Cancel
            </button>
            <button type="submit" className="tab-button tab-button--primary" disabled={busy}>
              {busy ? "Saving…" : "Save"}
            </button>
          </div>
        </form>
      </section>
    );
  }

  // A Google sign-up arrives with only a name, so these can be empty.
  const details = [profile.programme, profile.cohort, profile.location].filter(Boolean);

  return (
    <section className="seam" style={{ padding: "var(--space-6) var(--space-5)", maxWidth: "36rem" }}>
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-start", gap: "var(--space-4)" }}>
        <div className="signature">
          <SignatureMark name={profile.name} />
          <div>
            <h1 className="panel-kicker-free-heading" style={{ marginBottom: "var(--space-1)" }}>
              {profile.name}
            </h1>
            <span className="signature-role">
              {details.length > 0 ? details.join(" · ") : "Add your programme and cohort"}
            </span>
          </div>
        </div>
        <button type="button" className="tab-button" onClick={startEditing}>
          Edit
        </button>
      </div>

      <p className="prose" style={{ marginTop: "var(--space-5)" }}>
        {profile.bio || "No bio yet. Tell your cohort what you're working on."}
      </p>

      <div style={{ marginTop: "var(--space-5)", display: "flex", flexWrap: "wrap", gap: "var(--space-2)" }}>
        {profile.interests.map((interest) => (
          <span key={interest} className="listing-tag">
            {interest}
          </span>
        ))}
      </div>
    </section>
  );
}
