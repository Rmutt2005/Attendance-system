import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type CreateUserBody = {
  name?: string;
  email?: string;
  password?: string;
  allowedLat?: number;
  allowedLng?: number;
  radius?: number;
};

export async function POST(request: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const body = (await request.json()) as CreateUserBody;
    const name = body.name?.trim();
    const email = body.email?.trim().toLowerCase();
    const password = body.password;
    const radius = body.radius ?? 200;

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required." },
        { status: 400 }
      );
    }

    if (
      typeof body.allowedLat !== "number" ||
      typeof body.allowedLng !== "number" ||
      Number.isNaN(body.allowedLat) ||
      Number.isNaN(body.allowedLng)
    ) {
      return NextResponse.json(
        { error: "allowedLat and allowedLng are required." },
        { status: 400 }
      );
    }

    if (!Number.isInteger(radius) || radius <= 0) {
      return NextResponse.json(
        { error: "radius must be a positive integer." },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { error: "Email already exists." },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const createdUser = await prisma.user.create({
      data: {
        name,
        email,
        password: passwordHash,
        allowedLat: body.allowedLat,
        allowedLng: body.allowedLng,
        radius
      },
      select: {
        id: true,
        name: true,
        email: true,
        allowedLat: true,
        allowedLng: true,
        radius: true,
        createdAt: true
      }
    });

    return NextResponse.json({ user: createdUser }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
