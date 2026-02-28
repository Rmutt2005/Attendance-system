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
        <div className="menu-links">
          <Link href="/locations/create" className="menu-link">
            Create Location
          </Link>
          <Link href="/locations/manage" className="menu-link">
            Edit / Delete / Enable
          </Link>
          <Link href="/locations/history" className="menu-link">
            Location Attendance History
          </Link>
        </div>
      </div>
    </main>
  );
}
