import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import {
  ATTENDANCE_ORDER,
  AttendanceTypeValue,
  attendanceTypeLabel,
  getBangkokDayRange,
  isAttendanceTypeValue
} from "@/lib/attendance";
import { haversineDistanceMeters } from "@/lib/geo";
import { prisma } from "@/lib/prisma";

type CheckinBody = {
  type?: string;
  locationId?: string;
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
    if (!body.locationId) {
      return NextResponse.json(
        { error: "locationId is required." },
        { status: 400 }
      );
    }
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

    const location = await prisma.location.findFirst({
      where: {
        id: body.locationId,
        isActive: true,
        userLocations: {
          some: { userId: user.id }
        }
      }
    });
    if (!location) {
      return NextResponse.json(
        { error: "You do not have access to this location." },
        { status: 403 }
      );
    }

    const distance = haversineDistanceMeters(
      location.latitude,
      location.longitude,
      body.latitude,
      body.longitude
    );

    if (distance > location.radius) {
      return NextResponse.json(
        {
          error: `Outside allowed radius. Distance: ${distance.toFixed(
            2
          )}m, allowed: ${location.radius}m.`
        },
        { status: 400 }
      );
    }

    if (!body.type || !isAttendanceTypeValue(body.type)) {
      return NextResponse.json(
        { error: "Invalid attendance type." },
        { status: 400 }
      );
    }

    const type: AttendanceTypeValue = body.type;
    const dayRange = getBangkokDayRange();
    const todayEntries = await prisma.attendance.findMany({
      where: {
        userId: user.id,
        createdAt: {
          gte: dayRange.start,
          lte: dayRange.end
        }
      },
      orderBy: {
        createdAt: "asc"
      }
    });

    const isDuplicateType = todayEntries.some((entry) => entry.type === type);
    if (isDuplicateType) {
      return NextResponse.json(
        {
          error: `You already submitted ${attendanceTypeLabel[type]} today (Asia/Bangkok).`
        },
        { status: 400 }
      );
    }

    const expectedType = ATTENDANCE_ORDER[todayEntries.length];
    if (!expectedType) {
      return NextResponse.json(
        { error: "Daily attendance is already complete." },
        { status: 400 }
      );
    }

    if (type !== expectedType) {
      return NextResponse.json(
        {
          error: `Invalid sequence. Next required type is ${attendanceTypeLabel[expectedType]}.`
        },
        { status: 400 }
      );
    }

    await prisma.attendance.create({
      data: {
        userId: user.id,
        locationId: location.id,
        type,
        latitude: body.latitude,
        longitude: body.longitude,
        distance,
        faceDetected: true
      }
    });

    return NextResponse.json({
      message: `${attendanceTypeLabel[type]} successful`,
      distance
    });
  } catch {
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
