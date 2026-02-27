import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { SESSION_COOKIE_NAME } from "@/lib/constants";

const protectedPages = ["/dashboard", "/history", "/users"];
const protectedApis = ["/api/checkin", "/api/history", "/api/users"];

const isProtectedPage = (pathname: string) =>
  protectedPages.some((path) => pathname.startsWith(path));

const isProtectedApi = (pathname: string) =>
  protectedApis.some((path) => pathname.startsWith(path));

const isAuthenticated = async (token?: string) => {
  try {
    if (!token || !process.env.JWT_SECRET) return false;
    await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET));
    return true;
  } catch {
    return false;
  }
};

export async function middleware(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const loggedIn = await isAuthenticated(token);
  const pathname = request.nextUrl.pathname;

  if ((isProtectedPage(pathname) || isProtectedApi(pathname)) && !loggedIn) {
    if (isProtectedApi(pathname)) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (pathname.startsWith("/login") && loggedIn) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/login",
    "/dashboard/:path*",
    "/history/:path*",
    "/users/:path*",
    "/api/:path*"
  ]
};
