"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type LocationItem = {
  id: string;
  name: string;
  radius: number;
};

export default function AttendanceLocationSelectPage() {
  const router = useRouter();
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [selectedLocationId, setSelectedLocationId] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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

  const goToScanPage = () => {
    if (!selectedLocationId) {
      setError("Please select a location first.");
      return;
    }
    setLoading(true);
    router.push(`/attendance/${selectedLocationId}`);
  };

  return (
    <main className="container">
      <div className="card" style={{ maxWidth: 640, margin: "20px auto" }}>
        <h1>Select Attendance Location</h1>
        <p>
          <Link href="/home">Back to Home</Link>
        </p>

        {locations.length === 0 ? (
          <p className="error">
            No location is assigned to your account yet. Please contact admin.
          </p>
        ) : (
          <>
            <label htmlFor="location">Location</label>
            <select
              id="location"
              value={selectedLocationId}
              onChange={(event) => setSelectedLocationId(event.target.value)}
            >
              {locations.map((location) => (
                <option key={location.id} value={location.id}>
                  {location.name} (radius {location.radius}m)
                </option>
              ))}
            </select>
            <button type="button" onClick={goToScanPage} disabled={loading}>
              {loading ? "Opening..." : "Go to Face Scan"}
            </button>
          </>
        )}

        {error ? <p className="error">{error}</p> : null}
      </div>
    </main>
  );
}
