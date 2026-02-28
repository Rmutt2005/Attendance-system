import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type AssignLocationsBody = {
  locationIds?: string[];
};

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

    const body = (await request.json()) as AssignLocationsBody;
    const locationIds = Array.isArray(body.locationIds) ? body.locationIds : null;
    if (!locationIds) {
      return NextResponse.json({ error: "locationIds array is required." }, { status: 400 });
    }

    const distinctLocationIds = [...new Set(locationIds.filter(Boolean))];

    const existingLocations = await prisma.location.findMany({
      where: { id: { in: distinctLocationIds } },
      select: { id: true }
    });
    if (existingLocations.length !== distinctLocationIds.length) {
      return NextResponse.json({ error: "Some locations are invalid." }, { status: 400 });
    }

    await prisma.userLocation.deleteMany({
      where: { userId: params.id }
    });

    if (distinctLocationIds.length > 0) {
      await prisma.userLocation.createMany({
        data: distinctLocationIds.map((locationId) => ({
          userId: params.id,
          locationId
        }))
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        name: true,
        email: true,
        userLocations: {
          select: {
            locationId: true,
            location: { select: { name: true } }
          }
        }
      }
    });

    return NextResponse.json({
      user,
      message: "User location access updated successfully."
    });
  } catch {
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
