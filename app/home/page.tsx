"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type MeResponse = {
  user: {
    name: string;
    email: string;
    role: "ADMIN" | "USER";
  };
  assignedLocationCount: number;
  attendanceLocationReady: boolean;
};

export default function HomePage() {
  const router = useRouter();
  const [me, setMe] = useState<MeResponse | null>(null);
  const [error, setError] = useState("");
  const statusValue = me ? (me.attendanceLocationReady ? "Ready" : "Not Ready") : "Loading";

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await fetch("/api/me");
        const result = (await response.json()) as MeResponse & { error?: string };
        if (!response.ok) {
          throw new Error(result.error ?? "Failed to load profile.");
        }
        setMe(result);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Failed to load.");
      }
    };

    loadProfile();
  }, []);

  return (
    <main className="container">
      <div className="card" style={{ maxWidth: 720, margin: "20px auto" }}>
        <div className="row" style={{ justifyContent: "space-between" }}>
          <h1>User Home</h1>
          <div style={{ textAlign: "right" }}>
            <p style={{ margin: 0 }}>
              {me?.user.name ?? "Loading..."} ({me?.user.email ?? ""})
            </p>
            <p style={{ margin: "6px 0 0 0" }}>
              Status:{" "}
              <span
                className={`status-badge ${
                  statusValue === "Ready"
                    ? "status-ready"
                    : statusValue === "Not Ready"
                      ? "status-not-ready"
                      : "status-loading"
                }`}
              >
                {me
                  ? statusValue === "Ready"
                    ? `${statusValue} (${me.assignedLocationCount} locations)`
                    : "No attendance location yet (waiting admin)"
                  : "Loading status..."}
              </span>
            </p>
          </div>
        </div>

        {error ? <p className="error">{error}</p> : null}

        <div className="row" style={{ marginTop: 12 }}>
          <button
            type="button"
            className="attendance-main-button"
            onClick={() => router.push("/attendance")}
          >
            Attendance Check In/Out
          </button>
          <button type="button" onClick={() => router.push("/history")}>
            Attendance History
          </button>
          <button type="button" onClick={() => router.push("/profile")}>
            Edit Profile
          </button>
        </div>
      </div>
    </main>
  );
}
