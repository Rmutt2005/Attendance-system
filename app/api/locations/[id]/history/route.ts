import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
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

    const location = await prisma.location.findUnique({
      where: { id: params.id },
      select: { id: true, name: true }
    });
    if (!location) {
      return NextResponse.json({ error: "Location not found." }, { status: 404 });
    }

    const items = await prisma.attendance.findMany({
      where: { locationId: params.id },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json({ location, items });
  } catch {
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
