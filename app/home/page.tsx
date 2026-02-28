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

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

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
                className={
                  me?.attendanceLocationReady ? "success" : me ? "error" : ""
                }
              >
                {me
                  ? me.attendanceLocationReady
                    ? `Ready for attendance (${me.assignedLocationCount} locations)`
                    : "No attendance location yet (waiting admin)"
                  : "Loading status..."}
              </span>
            </p>
          </div>
        </div>

        {error ? <p className="error">{error}</p> : null}

        <div className="row" style={{ marginTop: 12 }}>
          <button type="button" onClick={() => router.push("/attendance")}>
            Attendance Check In/Out
          </button>
          <button type="button" onClick={() => router.push("/history")}>
            Attendance History
          </button>
          <button type="button" onClick={() => router.push("/profile")}>
            Edit Profile
          </button>
        </div>

        <button style={{ maxWidth: 160, marginTop: 18 }} onClick={handleLogout}>
          Logout
        </button>
      </div>
    </main>
  );
}
