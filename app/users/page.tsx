"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";

type LocationOption = {
  id: string;
  name: string;
  isActive: boolean;
};

type UserItem = {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "USER";
  userLocations: {
    locationId: string;
    location: { name: string };
  }[];
};

export default function UsersPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [locations, setLocations] = useState<LocationOption[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [assigningUserId, setAssigningUserId] = useState<string | null>(null);
  const [selectedLocationIds, setSelectedLocationIds] = useState<string[]>([]);

  const loadUsersAndLocations = async () => {
    const [usersResponse, locationsResponse] = await Promise.all([
      fetch("/api/users"),
      fetch("/api/locations")
    ]);

    const usersResult = (await usersResponse.json()) as {
      users?: UserItem[];
      error?: string;
    };
    if (!usersResponse.ok) {
      throw new Error(usersResult.error ?? "Failed to load users.");
    }

    const locationsResult = (await locationsResponse.json()) as {
      locations?: LocationOption[];
      error?: string;
    };
    if (!locationsResponse.ok) {
      throw new Error(locationsResult.error ?? "Failed to load locations.");
    }

    setUsers(usersResult.users ?? []);
    setLocations(locationsResult.locations ?? []);
  };

  useEffect(() => {
    loadUsersAndLocations().catch((loadError) => {
      setError(loadError instanceof Error ? loadError.message : "Failed to load data.");
    });
  }, []);

  const handleCreateUser = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password })
      });

      const result = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(result.error ?? "Failed to create user.");
      }

      setMessage("User created successfully.");
      setName("");
      setEmail("");
      setPassword("");
      await loadUsersAndLocations();
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : "Failed to create user."
      );
    } finally {
      setLoading(false);
    }
  };

  const startAssignLocations = (user: UserItem) => {
    setAssigningUserId(user.id);
    setSelectedLocationIds(user.userLocations.map((item) => item.locationId));
  };

  const toggleLocation = (locationId: string) => {
    setSelectedLocationIds((current) =>
      current.includes(locationId)
        ? current.filter((id) => id !== locationId)
        : [...current, locationId]
    );
  };

  const saveUserLocations = async () => {
    if (!assigningUserId) return;
    setLoading(true);
    setMessage("");
    setError("");
    try {
      const response = await fetch(`/api/users/${assigningUserId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locationIds: selectedLocationIds })
      });

      const result = (await response.json()) as { error?: string; message?: string };
      if (!response.ok) {
        throw new Error(result.error ?? "Failed to update location access.");
      }

      setMessage(result.message ?? "Location access updated.");
      setAssigningUserId(null);
      await loadUsersAndLocations();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Failed to update location access."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container">
      <div className="card" style={{ maxWidth: 900, margin: "20px auto" }}>
        <h1>User Management (Admin)</h1>
        <p>
          <Link href="/dashboard">Back to Dashboard</Link>
        </p>

        <h2>Create User</h2>
        <form onSubmit={handleCreateUser}>
          <label htmlFor="name">Name</label>
          <input
            id="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />

          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />

          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            minLength={8}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? "Saving..." : "Create User"}
          </button>
        </form>

        <h2>Users</h2>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Assigned Locations</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
                <td>
                  {user.userLocations.length === 0
                    ? "None"
                    : user.userLocations.map((entry) => entry.location.name).join(", ")}
                </td>
                <td>
                  {user.role === "USER" ? (
                    <button
                      type="button"
                      style={{ maxWidth: 180 }}
                      onClick={() => startAssignLocations(user)}
                    >
                      Set Location Access
                    </button>
                  ) : (
                    "-"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {assigningUserId ? (
          <>
            <h2>Assign Locations to User</h2>
            {locations.length === 0 ? (
              <p className="error">No locations found. Please create locations first.</p>
            ) : (
              locations.map((location) => (
                <label key={location.id} style={{ display: "block", marginBottom: 8 }}>
                  <input
                    type="checkbox"
                    checked={selectedLocationIds.includes(location.id)}
                    onChange={() => toggleLocation(location.id)}
                    style={{ width: "auto", marginRight: 8 }}
                  />
                  {location.name} {location.isActive ? "(Active)" : "(Inactive)"}
                </label>
              ))
            )}

            <div className="row">
              <button type="button" onClick={saveUserLocations} disabled={loading}>
                {loading ? "Updating..." : "Save Access"}
              </button>
              <button
                type="button"
                onClick={() => setAssigningUserId(null)}
                style={{ background: "#6b7280" }}
              >
                Cancel
              </button>
            </div>
          </>
        ) : null}

        {message ? <p className="success">{message}</p> : null}
        {error ? <p className="error">{error}</p> : null}
      </div>
    </main>
  );
}
