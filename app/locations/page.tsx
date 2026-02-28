"use client";

import Link from "next/link";

export default function LocationsMenuPage() {
  return (
    <main className="container">
      <div className="card" style={{ maxWidth: 720, margin: "20px auto" }}>
        <h1>Location Management (Admin)</h1>
        <p>
          <Link href="/dashboard">Back to Dashboard</Link>
        </p>
        <p>
          <Link href="/locations/create">Create Location</Link>
        </p>
        <p>
          <Link href="/locations/manage">Edit / Delete / Enable Location</Link>
        </p>
        <p>
          <Link href="/locations/history">Location Attendance History</Link>
        </p>
      </div>
    </main>
  );
}
