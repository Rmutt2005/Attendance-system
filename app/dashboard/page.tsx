"use client";

import Link from "next/link";

export default function AdminDashboardPage() {
  return (
    <main className="container">
      <div className="card" style={{ maxWidth: 720, margin: "20px auto" }}>
        <h1>Admin Dashboard</h1>
        <p>Manage users, location access, and attendance locations.</p>
        <div className="menu-links">
          <Link href="/users" className="menu-link">
            User Management
          </Link>
          <Link href="/locations" className="menu-link">
            Location Management
          </Link>
        </div>
      </div>
    </main>
  );
}
