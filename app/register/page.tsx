"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useState } from "react";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password })
      });

      const result = (await response.json()) as { message?: string; error?: string };
      if (!response.ok) {
        throw new Error(result.error ?? "Register failed");
      }

      setMessage(
        result.message ??
          "Register success. Please wait for admin to assign attendance location."
      );
      setName("");
      setEmail("");
      setPassword("");
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : "Register failed"
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
                    src="/logo.png"
                    alt="Logo"
                    width={120}
                    height={80}
                    className="auth-logo"
                  />
                </div>
        <h1>Register</h1>
        <p className="auth-subtitle">Create your account in seconds.</p>
        <form onSubmit={onSubmit}>
          <label htmlFor="name">Name</label>
          <input
            id="name"
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
          />

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
            minLength={8}
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />

          <button type="submit" disabled={loading}>
            {loading ? "Please wait..." : "Create account"}
          </button>
        </form>

        <p>New account starts without attendance location until admin updates it.</p>
        <p>
          Already have an account? <Link href="/login">Back to Login</Link>
        </p>

        {message ? <p className="success">{message}</p> : null}
        {error ? <p className="error">{error}</p> : null}
      </div>
    </main>
  );
}
