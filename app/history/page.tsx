"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { attendanceTypeLabel, type AttendanceTypeValue } from "@/lib/attendance";

type AttendanceItem = {
  id: string;
  type: AttendanceTypeValue;
  location: {
    name: string;
  };
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
          <Link href="/">Back to Home</Link>
        </p>
        {error ? <p className="error">{error}</p> : null}
        <div className="w-full min-w-0 overflow-hidden rounded-3xl">
          <table className="history-table w-full min-w-full">
            <thead>
              <tr>
                <th className="break-words">Location</th>
                <th className="break-words">Type</th>
                <th className="break-words">Distance (m)</th>
                <th className="break-words">Face</th>
                <th className="break-words">Time</th>
              </tr>
            </thead>
            <tbody>
              {history.map((item) => (
                <tr key={item.id}>
                  <td className="break-words">{item.location.name}</td>
                  <td className="break-words">{attendanceTypeLabel[item.type]}</td>
                  <td className="break-words">{item.distance.toFixed(2)}</td>
                  <td className="break-words">{item.faceDetected ? "Yes" : "No"}</td>
                  <td className="break-words">
                    {new Date(item.createdAt).toLocaleString("en-GB", {
                      timeZone: "Asia/Bangkok"
                    })}
                  </td>
                </tr>
              ))}
              {history.length === 0 ? (
                <tr>
                  <td className="break-words" colSpan={5}>No records yet.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
