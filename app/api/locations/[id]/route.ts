import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type UpdateLocationBody = {
  name?: string;
  latitude?: number;
  longitude?: number;
  radius?: number;
  isActive?: boolean;
};

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const whereClause =
      session.role === "ADMIN"
        ? { id: params.id }
        : {
            id: params.id,
            isActive: true,
            userLocations: { some: { userId: session.userId } }
          };

    const location = await prisma.location.findFirst({
      where: whereClause
    });
    if (!location) {
      return NextResponse.json({ error: "Location not found." }, { status: 404 });
    }

    return NextResponse.json({ location });
  } catch {
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }
    if (session.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }

    const body = (await request.json()) as UpdateLocationBody;
    const updateData: {
      name?: string;
      latitude?: number;
      longitude?: number;
      radius?: number;
      isActive?: boolean;
    } = {};

    if (typeof body.name === "string") {
      updateData.name = body.name.trim();
    }
    if (typeof body.latitude === "number" && !Number.isNaN(body.latitude)) {
      updateData.latitude = body.latitude;
    }
    if (typeof body.longitude === "number" && !Number.isNaN(body.longitude)) {
      updateData.longitude = body.longitude;
    }
    if (typeof body.radius === "number") {
      if (!Number.isInteger(body.radius) || body.radius <= 0) {
        return NextResponse.json(
          { error: "radius must be a positive integer." },
          { status: 400 }
        );
      }
      updateData.radius = body.radius;
    }
    if (typeof body.isActive === "boolean") {
      updateData.isActive = body.isActive;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update." },
        { status: 400 }
      );
    }

    const location = await prisma.location.update({
      where: { id: params.id },
      data: updateData
    });

    return NextResponse.json({ location, message: "Location updated successfully." });
  } catch {
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }
    if (session.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }

    await prisma.location.delete({ where: { id: params.id } });
    return NextResponse.json({ message: "Location deleted successfully." });
  } catch {
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
