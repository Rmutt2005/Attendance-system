"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { attendanceTypeLabel, type AttendanceTypeValue } from "@/lib/attendance";

type FaceApiModule = {
  nets: {
    tinyFaceDetector: {
      loadFromUri: (uri: string) => Promise<void>;
    };
  };
  TinyFaceDetectorOptions: new () => unknown;
  detectSingleFace: (
    input: HTMLVideoElement,
    options: unknown
  ) => Promise<unknown>;
};

type LocationResponse = {
  location: {
    id: string;
    name: string;
    radius: number;
  };
};

export default function AttendanceScanPage() {
  const params = useParams<{ locationId: string }>();
  const locationId = params.locationId;

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [faceApi, setFaceApi] = useState<FaceApiModule | null>(null);
  const [currentLocation, setCurrentLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [selectedType, setSelectedType] = useState<AttendanceTypeValue>("MORNING_IN");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [faceDetectedLive, setFaceDetectedLive] = useState<boolean | null>(null);
  const [targetLocationName, setTargetLocationName] = useState("Loading...");

  useEffect(() => {
    const loadLocation = async () => {
      try {
        const response = await fetch(`/api/locations/${locationId}`);
        const result = (await response.json()) as LocationResponse & { error?: string };
        if (!response.ok) {
          throw new Error(result.error ?? "Failed to load location.");
        }
        setTargetLocationName(result.location.name);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Failed to load.");
      }
    };

    loadLocation();
  }, [locationId]);

  useEffect(() => {
    let active = true;
    let stream: MediaStream | null = null;

    const initialize = async () => {
      try {
        const faceApiLib = await import("face-api.js");
        await faceApiLib.nets.tinyFaceDetector.loadFromUri("/models");
        if (!active) return;
        setFaceApi(faceApiLib as unknown as FaceApiModule);

        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user" }
        });
        if (!active || !videoRef.current) return;
        videoRef.current.srcObject = stream;

        navigator.geolocation.getCurrentPosition(
          (position) => {
            setCurrentLocation({
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

  useEffect(() => {
    if (!faceApi) return;

    const intervalId = window.setInterval(async () => {
      const video = videoRef.current;
      if (!video || video.readyState < 2) return;

      try {
        const result = await faceApi.detectSingleFace(
          video,
          new faceApi.TinyFaceDetectorOptions()
        );
        setFaceDetectedLive(Boolean(result));
      } catch {
        setFaceDetectedLive(null);
      }
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [faceApi]);

  const handleCheckin = async () => {
    setMessage("");
    setError("");

    if (!currentLocation) {
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
          locationId,
          type: selectedType,
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
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
        <h1>Attendance Scan</h1>

        <p>
          Selected location: <strong>{targetLocationName}</strong>
        </p>
        <p>
          Make sure camera and geolocation are allowed. This requires HTTPS in
          production.
        </p>

        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          style={{
            width: "100%",
            maxWidth: 420,
            borderRadius: 8,
            transform: "scaleX(-1)",
            border:
              faceDetectedLive === null
                ? "3px solid #9ca3af"
                : faceDetectedLive
                  ? "3px solid #16a34a"
                  : "3px solid #dc2626"
          }}
        />
        <p
          className={
            faceDetectedLive === null
              ? ""
              : faceDetectedLive
                ? "success"
                : "error"
          }
        >
          {faceDetectedLive === null
            ? "Face status: Waiting for camera..."
            : faceDetectedLive
              ? "Face status: Face detected"
              : "Face status: No face detected"}
        </p>

        <label htmlFor="type">Attendance Type</label>
        <select
          id="type"
          value={selectedType}
          onChange={(event) => setSelectedType(event.target.value as AttendanceTypeValue)}
        >
          <option value="MORNING_IN">{attendanceTypeLabel.MORNING_IN}</option>
          <option value="LUNCH_OUT">{attendanceTypeLabel.LUNCH_OUT}</option>
          <option value="AFTERNOON_IN">{attendanceTypeLabel.AFTERNOON_IN}</option>
          <option value="EVENING_OUT">{attendanceTypeLabel.EVENING_OUT}</option>
        </select>

        <button className="attendance-main-button" onClick={handleCheckin} disabled={loading}>
          {loading ? "Submitting..." : "Submit Attendance"}
        </button>

        {message ? <p className="success">{message}</p> : null}
        {error ? <p className="error">{error}</p> : null}

        <p>
          <Link href="/attendance">Back to Location Selection</Link>
        </p>
      </div>
    </main>
  );
}
