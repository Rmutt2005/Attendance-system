"use client";

import Link from "next/link";

export default function UsersMenuPage() {
  return (
    <main className="container">
      <div className="card" style={{ maxWidth: 720, margin: "20px auto" }}>
        <h1>User Management (Admin)</h1>
        <p>
          <Link href="/dashboard">Back to Dashboard</Link>
        </p>
        <div className="menu-links">
          <Link href="/users/create" className="menu-link">
            Create User
          </Link>
          <Link href="/users/access" className="menu-link">
            Assign Location Access
          </Link>
        </div>
      </div>
    </main>
  );
}
