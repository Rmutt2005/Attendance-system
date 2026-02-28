import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { SESSION_COOKIE_NAME } from "@/lib/constants";
import type { SessionPayload } from "@/lib/auth";

const protectedPages = [
  "/dashboard",
  "/home",
  "/attendance",
  "/history",
  "/users",
  "/locations",
  "/profile"
];
const protectedApis = [
  "/api/checkin",
  "/api/history",
  "/api/users",
  "/api/locations",
  "/api/me"
];
const adminPages = ["/dashboard", "/users", "/locations"];
const adminApis = ["/api/users"];
const userOnlyPages = ["/home", "/attendance", "/profile"];

const isPathIn = (pathname: string, paths: string[]) =>
  paths.some((path) => pathname.startsWith(path));

const parseSession = async (token?: string) => {
  try {
    if (!token || !process.env.JWT_SECRET) return null;
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(process.env.JWT_SECRET)
    );
    return payload as SessionPayload;
  } catch {
    return null;
  }
};

export async function middleware(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = await parseSession(token);
  const pathname = request.nextUrl.pathname;

  if ((isPathIn(pathname, protectedPages) || isPathIn(pathname, protectedApis)) && !session) {
    if (isPathIn(pathname, protectedApis)) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (!session) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/login") || pathname.startsWith("/register")) {
    return NextResponse.redirect(
      new URL(session.role === "ADMIN" ? "/dashboard" : "/home", request.url)
    );
  }

  if (session.role !== "ADMIN" && (isPathIn(pathname, adminPages) || isPathIn(pathname, adminApis))) {
    if (isPathIn(pathname, adminApis)) {
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }
    return NextResponse.redirect(new URL("/home", request.url));
  }

  if (session.role === "ADMIN" && isPathIn(pathname, userOnlyPages)) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/login",
    "/register",
    "/dashboard/:path*",
    "/home/:path*",
    "/attendance/:path*",
    "/history/:path*",
    "/users/:path*",
    "/locations/:path*",
    "/profile/:path*",
    "/api/:path*"
  ]
};
