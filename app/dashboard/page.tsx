"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AdminDashboardPage() {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  return (
    <main className="container">
      <div className="card" style={{ maxWidth: 720, margin: "20px auto" }}>
        <div className="row" style={{ justifyContent: "space-between" }}>
          <h1>Admin Dashboard</h1>
          <button style={{ maxWidth: 140 }} onClick={handleLogout}>
            Logout
          </button>
        </div>
        <p>Manage users, location access, and attendance locations.</p>
        <p>
          <Link href="/users">User Management</Link>
        </p>
        <p>
          <Link href="/locations">Location Management</Link>
        </p>
      </div>
    </main>
  );
}
