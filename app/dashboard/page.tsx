"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type FaceApiModule = typeof import("face-api.js");

export default function DashboardPage() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [faceApi, setFaceApi] = useState<FaceApiModule | null>(null);
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [type, setType] = useState<"check-in" | "check-out">("check-in");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    let stream: MediaStream | null = null;

    const initialize = async () => {
      try {
        const module = await import("face-api.js");
        await module.nets.tinyFaceDetector.loadFromUri("/models");
        if (!active) return;
        setFaceApi(module);

        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user" }
        });
        if (!active || !videoRef.current) return;
        videoRef.current.srcObject = stream;

        navigator.geolocation.getCurrentPosition(
          (position) => {
            setLocation({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            });
          },
          () => {
            setError("Location permission denied.");
          },
          { enableHighAccuracy: true, timeout: 10000 }
        );
      } catch (initializationError) {
        setError(
          initializationError instanceof Error
            ? initializationError.message
            : "Failed to initialize camera or face model."
        );
      }
    };

    initialize();

    return () => {
      active = false;
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  const handleCheckin = async () => {
    setMessage("");
    setError("");

    if (!location) {
      setError("Location permission denied or unavailable.");
      return;
    }
    if (!videoRef.current || !faceApi) {
      setError("Camera or face detector not ready.");
      return;
    }

    setLoading(true);
    try {
      const faceResult = await faceApi.detectSingleFace(
        videoRef.current,
        new faceApi.TinyFaceDetectorOptions()
      );

      const faceDetected = Boolean(faceResult);
      if (!faceDetected) {
        setError("No face detected. Check-in blocked.");
        return;
      }

      const response = await fetch("/api/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          latitude: location.latitude,
          longitude: location.longitude,
          faceDetected
        })
      });

      const result = (await response.json()) as { message?: string; error?: string };
      if (!response.ok) {
        throw new Error(result.error ?? "Check-in failed");
      }

      setMessage(result.message ?? "Success");
    } catch (checkinError) {
      setError(
        checkinError instanceof Error ? checkinError.message : "Check-in failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container">
      <div className="card">
        <div className="row" style={{ justifyContent: "space-between" }}>
          <h1>Dashboard</h1>
          <button style={{ maxWidth: 140 }} onClick={handleLogout}>
            Logout
          </button>
        </div>

        <p>
          Make sure camera and geolocation are allowed. This requires HTTPS in
          production.
        </p>

        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          style={{ width: "100%", maxWidth: 420, borderRadius: 8 }}
        />

        <label htmlFor="type">Attendance Type</label>
        <select
          id="type"
          value={type}
          onChange={(event) => setType(event.target.value as "check-in" | "check-out")}
        >
          <option value="check-in">Check-in</option>
          <option value="check-out">Check-out</option>
        </select>

        <button onClick={handleCheckin} disabled={loading}>
          {loading ? "Submitting..." : "Submit Attendance"}
        </button>

        {message ? <p className="success">{message}</p> : null}
        {error ? <p className="error">{error}</p> : null}

        <p>
          <Link href="/history">View Attendance History</Link>
        </p>
      </div>
    </main>
  );
}
