import { AttendanceType } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { haversineDistanceMeters } from "@/lib/geo";
import { prisma } from "@/lib/prisma";

type CheckinBody = {
  type?: "check-in" | "check-out";
  latitude?: number;
  longitude?: number;
  faceDetected?: boolean;
};

export async function POST(request: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { id: session.userId } });
    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    const body = (await request.json()) as CheckinBody;
    if (body.faceDetected !== true) {
      return NextResponse.json(
        { error: "No face detected. Check-in blocked." },
        { status: 400 }
      );
    }
    if (
      typeof body.latitude !== "number" ||
      typeof body.longitude !== "number" ||
      Number.isNaN(body.latitude) ||
      Number.isNaN(body.longitude)
    ) {
      return NextResponse.json(
        { error: "Location permission denied or invalid coordinates." },
        { status: 400 }
      );
    }

    const distance = haversineDistanceMeters(
      user.allowedLat,
      user.allowedLng,
      body.latitude,
      body.longitude
    );

    if (distance > user.radius) {
      return NextResponse.json(
        {
          error: `Outside allowed radius. Distance: ${distance.toFixed(
            2
          )}m, allowed: ${user.radius}m.`
        },
        { status: 400 }
      );
    }

    const type: AttendanceType =
      body.type === "check-out" ? AttendanceType.CHECK_OUT : AttendanceType.CHECK_IN;

    await prisma.attendance.create({
      data: {
        userId: user.id,
        type,
        latitude: body.latitude,
        longitude: body.longitude,
        distance,
        faceDetected: true
      }
    });

    return NextResponse.json({
      message: `${type === "CHECK_IN" ? "Check-in" : "Check-out"} successful`,
      distance
    });
  } catch {
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
