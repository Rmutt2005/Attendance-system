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
        <p>
          <Link href="/users/create">Create User</Link>
        </p>
        <p>
          <Link href="/users/access">Assign Location Access</Link>
        </p>
      </div>
    </main>
  );
}
