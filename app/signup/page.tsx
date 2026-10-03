"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import GoogleButton from "../google-button";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [programme, setProgramme] = useState("");
  const [cohort, setCohort] = useState("");
  const [location, setLocation] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  return (
    <section className="seam" style={{ padding: "var(--space-6) var(--space-5)", maxWidth: "32rem" }}>
      <h1 className="panel-kicker-free-heading">
        Sign up <span className="listing-code mono-data">№ 003</span>
      </h1>
      <p className="prose" style={{ marginTop: "calc(var(--space-5) * -1)", marginBottom: "var(--space-5)" }}>
        Add your name to the directory. Your programme and cohort help other
        apprentices recognize you at events.
      </p>

      <GoogleButton next="/profile" label="Sign up with Google" />

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "var(--space-3)",
          margin: "var(--space-5) 0",
          color: "var(--ink-dim)",
          fontSize: "0.8rem",
        }}
      >
        <span aria-hidden="true" style={{ flex: 1, height: "1px", background: "var(--rail-dim)" }} />
        or
        <span aria-hidden="true" style={{ flex: 1, height: "1px", background: "var(--rail-dim)" }} />
      </div>

      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setError(null);
          setNotice(null);
          setLoading(true);

          const res = await fetch("/api/auth/signup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email,
              password,
              name,
              programme: programme || undefined,
              cohort: cohort || undefined,
              location: location || undefined,
            }),
          });
          const data = await res.json();
          setLoading(false);

          if (!res.ok) {
            setError(data.error ?? "Sign up failed");
            return;
          }

          if (!data.session) {
            setNotice("Account created — check your email to confirm it before logging in.");
            return;
          }

          router.push("/");
          router.refresh();
        }}
      >
        <div className="field">
          <label className="field-label" htmlFor="name">
            Name
          </label>
          <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>

        <div className="field">
          <label className="field-label" htmlFor="email">
            Email
          </label>
          <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>

        <div className="field">
          <label className="field-label" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
        </div>

        <div className="field-row">
          <div className="field">
            <label className="field-label" htmlFor="programme">
              Programme
            </label>
            <input id="programme" type="text" placeholder="Software Engineering" value={programme} onChange={(e) => setProgramme(e.target.value)} />
          </div>
          <div className="field">
            <label className="field-label" htmlFor="cohort">
              Cohort
            </label>
            <input id="cohort" type="text" placeholder="Cohort 12" value={cohort} onChange={(e) => setCohort(e.target.value)} />
          </div>
        </div>

        <div className="field">
          <label className="field-label" htmlFor="location">
            Location
          </label>
          <input id="location" type="text" placeholder="Peckham" value={location} onChange={(e) => setLocation(e.target.value)} />
        </div>

        {error && <p className="form-error">{error}</p>}
        {notice && <p className="form-notice">{notice}</p>}

        <button type="submit" disabled={loading} className="tab-button tab-button--primary" style={{ width: "100%", marginTop: "var(--space-2)" }}>
          {loading ? "Signing up…" : "Sign up"}
        </button>
      </form>

      <p className="prose" style={{ marginTop: "var(--space-5)" }}>
        Already have an account? <Link href="/login" style={{ color: "var(--amber)" }}>Log in</Link>
      </p>
    </section>
  );
}
