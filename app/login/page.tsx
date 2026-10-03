"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import GoogleButton from "../google-button";

/** Only same-site relative paths, so ?next= cannot bounce people off-site. */
function safeNext(raw: string | null): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return "/";
  return raw;
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = safeNext(searchParams.get("next"));
  // Set by /auth/callback when Google sign-in fails.
  const callbackError = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  return (
    <section className="seam" style={{ padding: "var(--space-6) var(--space-5)", maxWidth: "28rem" }}>
      <h1 className="panel-kicker-free-heading">
        Log in
      </h1>

      <GoogleButton next={next} />

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
          setLoading(true);

          const res = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
          });
          const data = await res.json();
          setLoading(false);

          if (!res.ok) {
            setError(data.error ?? "Login failed");
            return;
          }

          router.push(next);
          router.refresh();
        }}
      >
        <div className="field">
          <label className="field-label" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
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
          />
        </div>

        {(error || callbackError) && <p className="form-error">{error ?? callbackError}</p>}

        <button type="submit" disabled={loading} className="tab-button tab-button--primary" style={{ width: "100%", marginTop: "var(--space-2)" }}>
          {loading ? "Logging in…" : "Log in"}
        </button>
      </form>

      <p className="prose" style={{ marginTop: "var(--space-5)" }}>
        No account? <Link href="/signup" style={{ color: "var(--amber)" }}>Sign up</Link>
      </p>
    </section>
  );
}

export default function LoginPage() {
  // useSearchParams needs a Suspense boundary above it.
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
