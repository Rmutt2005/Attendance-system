import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const items = await prisma.attendance.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json({ items });
  } catch {
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
