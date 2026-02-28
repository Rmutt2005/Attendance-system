"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

export default function CreateLocationPage() {
  const [name, setName] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [radius, setRadius] = useState("200");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");
    try {
      const response = await fetch("/api/locations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          latitude: Number(latitude),
          longitude: Number(longitude),
          radius: Number(radius)
        })
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(result.error ?? "Failed to create location.");
      }
      setMessage("Location created successfully.");
      setName("");
      setLatitude("");
      setLongitude("");
      setRadius("200");
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Failed to create location."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container">
      <div className="card" style={{ maxWidth: 720, margin: "20px auto" }}>
        <h1>Create Location</h1>
        <p>
          <Link href="/locations">Back to Location Management</Link>
        </p>

        <form onSubmit={handleCreate}>
          <label htmlFor="name">Location Name</label>
          <input
            id="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />

          <label htmlFor="latitude">Latitude</label>
          <input
            id="latitude"
            type="number"
            step="any"
            value={latitude}
            onChange={(event) => setLatitude(event.target.value)}
            required
          />

          <label htmlFor="longitude">Longitude</label>
          <input
            id="longitude"
            type="number"
            step="any"
            value={longitude}
            onChange={(event) => setLongitude(event.target.value)}
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
            {loading ? "Saving..." : "Create Location"}
          </button>
        </form>

        {message ? <p className="success">{message}</p> : null}
        {error ? <p className="error">{error}</p> : null}
      </div>
    </main>
  );
}
