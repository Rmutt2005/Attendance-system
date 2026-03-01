"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { attendanceTypeLabel, type AttendanceTypeValue } from "@/lib/attendance";

type LocationItem = {
  id: string;
  name: string;
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

export default function LocationHistoryPage() {
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [selectedLocationId, setSelectedLocationId] = useState("");
  const [selectedLocationName, setSelectedLocationName] = useState("");
  const [historyItems, setHistoryItems] = useState<LocationHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadLocations = async () => {
      try {
        const response = await fetch("/api/locations");
        const result = (await response.json()) as {
          locations?: LocationItem[];
          error?: string;
        };
        if (!response.ok) {
          throw new Error(result.error ?? "Failed to load locations.");
        }
        const loaded = result.locations ?? [];
        setLocations(loaded);
        if (loaded.length > 0) {
          setSelectedLocationId(loaded[0].id);
        }
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Failed to load.");
      }
    };
    loadLocations();
  }, []);

  const loadHistory = async () => {
    if (!selectedLocationId) {
      setError("Please select a location.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/locations/${selectedLocationId}/history`);
      const result = (await response.json()) as {
        location?: { name: string };
        items?: LocationHistoryItem[];
        error?: string;
      };
      if (!response.ok) {
        throw new Error(result.error ?? "Failed to load location history.");
      }
      setSelectedLocationName(result.location?.name ?? "");
      setHistoryItems(result.items ?? []);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container">
      <div className="card w-full" style={{ maxWidth: 980, margin: "20px auto" }}>
        <h1>Location Attendance History</h1>
        <p>
          <Link href="/locations">Back to Location Management</Link>
        </p>

        <label htmlFor="location">Location</label>
        <select
          id="location"
          value={selectedLocationId}
          onChange={(event) => setSelectedLocationId(event.target.value)}
        >
          {locations.map((location) => (
            <option key={location.id} value={location.id}>
              {location.name}
            </option>
          ))}
        </select>

        <button type="button" onClick={loadHistory} disabled={loading}>
          {loading ? "Loading..." : "Load History"}
        </button>

        {selectedLocationName ? <h2>History: {selectedLocationName}</h2> : null}
        <div className="w-full overflow-x-auto rounded-3xl min-w-0 location-history-table-wrap">
          <table className="min-w-full table-fixed location-history-table">
          <thead>
            <tr>
              <th className="break-words">User</th>
              <th className="break-words">Email</th>
              <th className="break-words">Type</th>
              <th className="break-words">Time</th>
            </tr>
          </thead>
          <tbody>
            {historyItems.map((item) => (
              <tr key={item.id}>
                <td className="break-words">{item.user.name}</td>
                <td className="break-words">{item.user.email}</td>
                <td className="break-words">{attendanceTypeLabel[item.type]}</td>
                <td className="break-words">
                  {new Date(item.createdAt).toLocaleString("en-GB", {
                    timeZone: "Asia/Bangkok"
                  })}
                </td>
              </tr>
            ))}
            {historyItems.length === 0 ? (
              <tr>
                <td className="break-words" colSpan={4}>No records.</td>
              </tr>
            ) : null}
          </tbody>
          </table>
        </div>

        {error ? <p className="error">{error}</p> : null}
      </div>
    </main>
  );
}
