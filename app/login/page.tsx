"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const result = (await response.json()) as { error?: string; message?: string };
      if (!response.ok) {
        throw new Error(result.error ?? "Request failed");
      }

      router.push("/");
      router.refresh();
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : "Request failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container">
      <div className="card auth-card" style={{ maxWidth: 460, margin: "70px auto" }}>
        <div className="auth-logo-wrap">
          <Image
            src="/images/logo.PNG"
            alt="Logo"
            width={56}
            height={56}
            className="auth-logo"
          />
        </div>
        <h1>Login</h1>
        
        <form onSubmit={onSubmit}>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />

          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />

          <button type="submit" disabled={loading}>
            {loading ? "Please wait..." : "Sign in"}
          </button>
        </form>
        <p>
          No account yet? <Link href="/register">Register</Link>
        </p>
        {error ? <p className="error">{error}</p> : null}
      </div>
    </main>
  );
}
