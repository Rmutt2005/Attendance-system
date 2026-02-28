"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";

type LocationItem = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radius: number;
  isActive: boolean;
};

export default function ManageLocationsPage() {
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [radius, setRadius] = useState("200");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadLocations = async () => {
    const response = await fetch("/api/locations");
    const result = (await response.json()) as {
      locations?: LocationItem[];
      error?: string;
    };
    if (!response.ok) {
      throw new Error(result.error ?? "Failed to load locations.");
    }
    setLocations(result.locations ?? []);
  };

  useEffect(() => {
    loadLocations().catch((loadError) => {
      setError(loadError instanceof Error ? loadError.message : "Failed to load.");
    });
  }, []);

  const startEdit = (location: LocationItem) => {
    setEditingId(location.id);
    setName(location.name);
    setLatitude(String(location.latitude));
    setLongitude(String(location.longitude));
    setRadius(String(location.radius));
  };

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setLatitude("");
    setLongitude("");
    setRadius("200");
  };

  const handleUpdate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingId) return;

    setLoading(true);
    setMessage("");
    setError("");
    try {
      const response = await fetch(`/api/locations/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          latitude: Number(latitude),
          longitude: Number(longitude),
          radius: Number(radius)
        })
      });
      const result = (await response.json()) as { error?: string; message?: string };
      if (!response.ok) {
        throw new Error(result.error ?? "Failed to update location.");
      }
      setMessage(result.message ?? "Location updated.");
      resetForm();
      await loadLocations();
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Update failed.");
    } finally {
      setLoading(false);
    }
  };

  const toggleActive = async (location: LocationItem) => {
    setLoading(true);
    setMessage("");
    setError("");
    try {
      const response = await fetch(`/api/locations/${location.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !location.isActive })
      });
      const result = (await response.json()) as { error?: string; message?: string };
      if (!response.ok) {
        throw new Error(result.error ?? "Failed to change status.");
      }
      setMessage(result.message ?? "Status updated.");
      await loadLocations();
    } catch (toggleError) {
      setError(toggleError instanceof Error ? toggleError.message : "Update failed.");
    } finally {
      setLoading(false);
    }
  };

  const deleteLocation = async (locationId: string) => {
    setLoading(true);
    setMessage("");
    setError("");
    try {
      const response = await fetch(`/api/locations/${locationId}`, { method: "DELETE" });
      const result = (await response.json()) as { error?: string; message?: string };
      if (!response.ok) {
        throw new Error(result.error ?? "Delete failed.");
      }
      setMessage(result.message ?? "Location deleted.");
      if (editingId === locationId) {
        resetForm();
      }
      await loadLocations();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Delete failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container">
      <div className="card" style={{ maxWidth: 980, margin: "20px auto" }}>
        <h1>Manage Locations</h1>
        <p>
          <Link href="/locations">Back to Location Management</Link>
        </p>

        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Lat/Lng</th>
              <th>Radius</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {locations.map((location) => (
              <tr key={location.id}>
                <td>{location.name}</td>
                <td>
                  {location.latitude}, {location.longitude}
                </td>
                <td>{location.radius}m</td>
                <td>{location.isActive ? "Active" : "Inactive"}</td>
                <td>
                  <div className="row">
                    <button
                      type="button"
                      className="button-secondary"
                      onClick={() => startEdit(location)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="button-muted"
                      onClick={() => toggleActive(location)}
                    >
                      {location.isActive ? "Disable" : "Enable"}
                    </button>
                    <button
                      type="button"
                      className="button-danger"
                      onClick={() => deleteLocation(location.id)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {editingId ? (
          <>
            <h2>Edit Location</h2>
            <form onSubmit={handleUpdate}>
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

              <div className="row">
                <button type="submit" disabled={loading}>
                  {loading ? "Updating..." : "Update Location"}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="button-muted"
                >
                  Cancel Edit
                </button>
              </div>
            </form>
          </>
        ) : null}

        {message ? <p className="success">{message}</p> : null}
        {error ? <p className="error">{error}</p> : null}
      </div>
    </main>
  );
}
