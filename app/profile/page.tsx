"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";

type MeUser = {
  name: string;
  email: string;
  role: "ADMIN" | "USER";
};

export default function ProfilePage() {
  const [user, setUser] = useState<MeUser | null>(null);
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await fetch("/api/me");
        const result = (await response.json()) as {
          user?: MeUser;
          assignedLocationCount?: number;
          attendanceLocationReady?: boolean;
          error?: string;
        };
        if (!response.ok || !result.user) {
          throw new Error(result.error ?? "Failed to load profile.");
        }
        setUser(result.user);
        setName(result.user.name);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Failed to load.");
      }
    };

    loadProfile();
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch("/api/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          password: password || undefined
        })
      });

      const result = (await response.json()) as { error?: string; message?: string };
      if (!response.ok) {
        throw new Error(result.error ?? "Failed to update profile.");
      }
      setMessage(result.message ?? "Profile updated.");
      setPassword("");
      setUser((currentUser) =>
        currentUser
          ? {
              ...currentUser,
              name
            }
          : currentUser
      );
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Failed to update profile."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container">
      <div className="card" style={{ maxWidth: 520, margin: "20px auto" }}>
        <h1>Edit Profile</h1>
        <p>
          <Link href="/home">Back to Home</Link>
        </p>
        {user ? (
          <p>
            Email: {user.email}
            <br />
            Role: {user.role}
          </p>
        ) : null}

        <form onSubmit={handleSubmit}>
          <label htmlFor="name">Name</label>
          <input
            id="name"
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
          />

          <label htmlFor="password">New Password (optional)</label>
          <input
            id="password"
            type="password"
            minLength={8}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />

          <button type="submit" disabled={loading}>
            {loading ? "Saving..." : "Save Profile"}
          </button>
        </form>
        {message ? <p className="success">{message}</p> : null}
        {error ? <p className="error">{error}</p> : null}
      </div>
    </main>
  );
}
