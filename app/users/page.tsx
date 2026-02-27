"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

export default function UsersPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [allowedLat, setAllowedLat] = useState("");
  const [allowedLng, setAllowedLng] = useState("");
  const [radius, setRadius] = useState("200");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          allowedLat: Number(allowedLat),
          allowedLng: Number(allowedLng),
          radius: Number(radius)
        })
      });

      const result = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(result.error ?? "Failed to create user.");
      }

      setMessage("User created successfully.");
      setName("");
      setEmail("");
      setPassword("");
      setAllowedLat("");
      setAllowedLng("");
      setRadius("200");
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : "Failed to create user."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container">
      <div className="card" style={{ maxWidth: 520, margin: "20px auto" }}>
        <h1>Create User</h1>
        <p>
          <Link href="/dashboard">Back to Dashboard</Link>
        </p>
        <form onSubmit={handleSubmit}>
          <label htmlFor="name">Name</label>
          <input
            id="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />

          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />

          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />

          <label htmlFor="allowedLat">Allowed Latitude</label>
          <input
            id="allowedLat"
            type="number"
            step="any"
            value={allowedLat}
            onChange={(event) => setAllowedLat(event.target.value)}
            required
          />

          <label htmlFor="allowedLng">Allowed Longitude</label>
          <input
            id="allowedLng"
            type="number"
            step="any"
            value={allowedLng}
            onChange={(event) => setAllowedLng(event.target.value)}
            required
          />

          <label htmlFor="radius">Radius (meters)</label>
          <input
            id="radius"
            type="number"
            min={1}
            step={1}
            value={radius}
            onChange={(event) => setRadius(event.target.value)}
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create User"}
          </button>
        </form>
        {message ? <p className="success">{message}</p> : null}
        {error ? <p className="error">{error}</p> : null}
      </div>
    </main>
  );
}
