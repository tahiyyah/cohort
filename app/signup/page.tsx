"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

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
    <main>
      <h1>Sign up</h1>
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
        <label>
          Name
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </label>
        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
        </label>
        <label>
          Programme
          <input
            type="text"
            value={programme}
            onChange={(e) => setProgramme(e.target.value)}
          />
        </label>
        <label>
          Cohort
          <input
            type="text"
            value={cohort}
            onChange={(e) => setCohort(e.target.value)}
          />
        </label>
        <label>
          Location
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </label>
        {error && <p className="error">{error}</p>}
        {notice && <p className="notice">{notice}</p>}
        <button type="submit" disabled={loading}>
          {loading ? "Signing up..." : "Sign up"}
        </button>
      </form>
      <p>
        Already have an account? <Link href="/login">Log in</Link>
      </p>
    </main>
  );
}
