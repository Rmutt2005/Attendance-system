"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type AttendanceItem = {
  id: string;
  type: "CHECK_IN" | "CHECK_OUT";
  latitude: number;
  longitude: number;
  distance: number;
  faceDetected: boolean;
  createdAt: string;
};

export default function HistoryPage() {
  const [history, setHistory] = useState<AttendanceItem[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const run = async () => {
      try {
        const response = await fetch("/api/history");
        const result = (await response.json()) as {
          items?: AttendanceItem[];
          error?: string;
        };
        if (!response.ok) {
          throw new Error(result.error ?? "Failed to load history");
        }
        setHistory(result.items ?? []);
      } catch (historyError) {
        setError(
          historyError instanceof Error
            ? historyError.message
            : "Failed to load history"
        );
      }
    };

    run();
  }, []);

  return (
    <main className="container">
      <div className="card">
        <h1>Attendance History</h1>
        <p>
          <Link href="/dashboard">Back to Dashboard</Link>
        </p>
        {error ? <p className="error">{error}</p> : null}
        <table>
          <thead>
            <tr>
              <th>Type</th>
              <th>Distance (m)</th>
              <th>Face</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            {history.map((item) => (
              <tr key={item.id}>
                <td>{item.type === "CHECK_IN" ? "Check-in" : "Check-out"}</td>
                <td>{item.distance.toFixed(2)}</td>
                <td>{item.faceDetected ? "Yes" : "No"}</td>
                <td>{new Date(item.createdAt).toLocaleString()}</td>
              </tr>
            ))}
            {history.length === 0 ? (
              <tr>
                <td colSpan={4}>No records yet.</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </main>
  );
}
