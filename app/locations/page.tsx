"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { attendanceTypeLabel, type AttendanceTypeValue } from "@/lib/attendance";

type LocationItem = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radius: number;
  isActive: boolean;
};

type LocationHistoryItem = {
  id: string;
  type: AttendanceTypeValue;
  distance: number;
  faceDetected: boolean;
  createdAt: string;
  user: {
    name: string;
    email: string;
  };
};

export default function LocationsPage() {
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [name, setName] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [radius, setRadius] = useState("200");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [historyLocationId, setHistoryLocationId] = useState<string | null>(null);
  const [historyLocationName, setHistoryLocationName] = useState("");
  const [historyItems, setHistoryItems] = useState<LocationHistoryItem[]>([]);
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

  const resetForm = () => {
    setName("");
    setLatitude("");
    setLongitude("");
    setRadius("200");
    setEditingId(null);
  };

  const handleCreateOrUpdate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");
    try {
      const payload = {
        name,
        latitude: Number(latitude),
        longitude: Number(longitude),
        radius: Number(radius)
      };
      const endpoint = editingId ? `/api/locations/${editingId}` : "/api/locations";
      const method = editingId ? "PATCH" : "POST";
      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const result = (await response.json()) as { error?: string; message?: string };
      if (!response.ok) {
        throw new Error(result.error ?? "Save failed.");
      }
      setMessage(editingId ? "Location updated." : "Location created.");
      resetForm();
      await loadLocations();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Save failed.");
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (location: LocationItem) => {
    setEditingId(location.id);
    setName(location.name);
    setLatitude(String(location.latitude));
    setLongitude(String(location.longitude));
    setRadius(String(location.radius));
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
        throw new Error(result.error ?? "Update failed.");
      }
      setMessage(result.message ?? "Status updated.");
      await loadLocations();
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Update failed.");
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
      if (historyLocationId === locationId) {
        setHistoryLocationId(null);
        setHistoryItems([]);
      }
      await loadLocations();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Delete failed.");
    } finally {
      setLoading(false);
    }
  };

  const loadLocationHistory = async (location: LocationItem) => {
    setLoading(true);
    setMessage("");
    setError("");
    try {
      const response = await fetch(`/api/locations/${location.id}/history`);
      const result = (await response.json()) as {
        items?: LocationHistoryItem[];
        location?: { name: string };
        error?: string;
      };
      if (!response.ok) {
        throw new Error(result.error ?? "Failed to load location history.");
      }
      setHistoryLocationId(location.id);
      setHistoryLocationName(result.location?.name ?? location.name);
      setHistoryItems(result.items ?? []);
    } catch (historyError) {
      setError(historyError instanceof Error ? historyError.message : "Failed to load.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container">
      <div className="card" style={{ maxWidth: 980, margin: "20px auto" }}>
        <h1>Location Management (Admin)</h1>
        <p>
          <Link href="/dashboard">Back to Dashboard</Link>
        </p>

        <h2>{editingId ? "Edit Location" : "Create Location"}</h2>
        <form onSubmit={handleCreateOrUpdate}>
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
              {loading ? "Saving..." : editingId ? "Update Location" : "Create Location"}
            </button>
            {editingId ? (
              <button
                type="button"
                onClick={resetForm}
                style={{ background: "#6b7280" }}
              >
                Cancel Edit
              </button>
            ) : null}
          </div>
        </form>

        <h2>Locations</h2>
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
                      style={{ maxWidth: 120 }}
                      onClick={() => startEdit(location)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      style={{ maxWidth: 120, background: "#475569" }}
                      onClick={() => toggleActive(location)}
                    >
                      {location.isActive ? "Disable" : "Enable"}
                    </button>
                    <button
                      type="button"
                      style={{ maxWidth: 120, background: "#0f766e" }}
                      onClick={() => loadLocationHistory(location)}
                    >
                      View History
                    </button>
                    <button
                      type="button"
                      style={{ maxWidth: 120, background: "#b91c1c" }}
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

        {historyLocationId ? (
          <>
            <h2>Location History: {historyLocationName}</h2>
            <table>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Type</th>
                  <th>Distance</th>
                  <th>Face</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {historyItems.map((item) => (
                  <tr key={item.id}>
                    <td>{item.user.name}</td>
                    <td>{item.user.email}</td>
                    <td>{attendanceTypeLabel[item.type]}</td>
                    <td>{item.distance.toFixed(2)}m</td>
                    <td>{item.faceDetected ? "Yes" : "No"}</td>
                    <td>
                      {new Date(item.createdAt).toLocaleString("en-GB", {
                        timeZone: "Asia/Bangkok"
                      })}
                    </td>
                  </tr>
                ))}
                {historyItems.length === 0 ? (
                  <tr>
                    <td colSpan={6}>No records for this location.</td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </>
        ) : null}

        {message ? <p className="success">{message}</p> : null}
        {error ? <p className="error">{error}</p> : null}
      </div>
    </main>
  );
}
