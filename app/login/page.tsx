"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  return (
    <section className="seam" style={{ padding: "var(--space-6) var(--space-5)", maxWidth: "28rem" }}>
      <h1 className="panel-kicker-free-heading">
        Log in <span className="listing-code mono-data">№ 002</span>
      </h1>

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

          router.push("/");
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

        {error && <p className="form-error">{error}</p>}

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
