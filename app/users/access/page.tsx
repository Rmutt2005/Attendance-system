"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

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

export default function UserAccessPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [locations, setLocations] = useState<LocationOption[]>([]);
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
        <h1>Assign Location Access</h1>
        <p>
          <Link href="/users">Back to User Management</Link>
        </p>

        <div className="w-full min-w-0 overflow-x-auto rounded-3xl">
          <table className="access-table min-w-full table-fixed">
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
                  <td className="break-words">{user.name}</td>
                  <td className="break-words">{user.email}</td>
                  <td className="break-words">{user.role}</td>
                  <td className="break-words">
                    {user.userLocations.length === 0
                      ? "None"
                      : user.userLocations.map((entry) => entry.location.name).join(", ")}
                  </td>
                  <td className="whitespace-nowrap overflow-hidden text-left">
                    {user.role === "USER" ? (
                      <button
                        type="button"
                        className="access-action-button inline-flex !w-auto items-center justify-center px-3 py-1.5 text-xs md:text-sm rounded-full max-w-full overflow-hidden text-ellipsis whitespace-nowrap shadow-none hover:shadow-none"
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
        </div>

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
                className="button-muted"
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
