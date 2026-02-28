import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type CreateLocationBody = {
  name?: string;
  latitude?: number;
  longitude?: number;
  radius?: number;
};

export async function GET() {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    if (session.role === "ADMIN") {
      const locations = await prisma.location.findMany({
        orderBy: { createdAt: "desc" }
      });
      return NextResponse.json({ locations });
    }

    const locations = await prisma.location.findMany({
      where: {
        isActive: true,
        userLocations: {
          some: { userId: session.userId }
        }
      },
      orderBy: { name: "asc" }
    });
    return NextResponse.json({ locations });
  } catch {
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }
    if (session.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }

    const body = (await request.json()) as CreateLocationBody;
    const name = body.name?.trim();
    const radius = body.radius ?? 200;

    if (!name) {
      return NextResponse.json({ error: "Location name is required." }, { status: 400 });
    }
    if (
      typeof body.latitude !== "number" ||
      typeof body.longitude !== "number" ||
      Number.isNaN(body.latitude) ||
      Number.isNaN(body.longitude)
    ) {
      return NextResponse.json(
        { error: "latitude and longitude are required." },
        { status: 400 }
      );
    }
    if (!Number.isInteger(radius) || radius <= 0) {
      return NextResponse.json(
        { error: "radius must be a positive integer." },
        { status: 400 }
      );
    }

    const location = await prisma.location.create({
      data: {
        name,
        latitude: body.latitude,
        longitude: body.longitude,
        radius,
        isActive: true
      }
    });

    return NextResponse.json({ location }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
