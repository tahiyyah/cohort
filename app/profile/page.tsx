"use client";

import { useState } from "react";
import SignatureMark from "../signature-mark";
import { CURRENT_MOCK_PROFILE } from "@/lib/mock-data";

interface ProfileData {
  name: string;
  programme: string;
  cohort: string;
  location: string;
  bio: string;
  interests: string[];
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileData>(CURRENT_MOCK_PROFILE);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<ProfileData>(CURRENT_MOCK_PROFILE);
  const [interestsInput, setInterestsInput] = useState(CURRENT_MOCK_PROFILE.interests.join(", "));

  function startEditing() {
    setDraft(profile);
    setInterestsInput(profile.interests.join(", "));
    setEditing(true);
  }

  function save() {
    setProfile({
      ...draft,
      interests: interestsInput
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    });
    setEditing(false);
  }

  if (editing) {
    return (
      <section className="seam" style={{ padding: "var(--space-6) var(--space-5)", maxWidth: "32rem" }}>
        <h1 className="panel-kicker-free-heading">
          Edit your profile
        </h1>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            save();
          }}
        >
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

          <div style={{ display: "flex", gap: "var(--space-3)" }}>
            <button type="button" className="tab-button" onClick={() => setEditing(false)}>
              Cancel
            </button>
            <button type="submit" className="tab-button tab-button--primary">
              Save
            </button>
          </div>
        </form>
      </section>
    );
  }

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
              {profile.programme} · {profile.cohort} · {profile.location}
            </span>
          </div>
        </div>
        <button type="button" className="tab-button" onClick={startEditing}>
          Edit
        </button>
      </div>

      <p className="prose" style={{ marginTop: "var(--space-5)" }}>
        {profile.bio}
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
