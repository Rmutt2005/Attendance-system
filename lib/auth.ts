import { cookies } from "next/headers";
import { jwtVerify, SignJWT } from "jose";
import { SESSION_COOKIE_NAME, SESSION_DURATION_SECONDS } from "@/lib/constants";

export type SessionPayload = {
  userId: string;
  email: string;
  name: string;
  role: "ADMIN" | "USER";
};

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not configured");
  }
  return new TextEncoder().encode(secret);
};

export const signSessionToken = async (payload: SessionPayload) => {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_SECONDS}s`)
    .sign(getJwtSecret());
};

export const verifySessionToken = async (token: string) => {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    return payload as SessionPayload;
  } catch {
    return null;
  }
};

export const getCurrentSession = async () => {
  const cookieStore = cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionToken(token);
};

export const sessionCookieName = SESSION_COOKIE_NAME;
export const sessionMaxAge = SESSION_DURATION_SECONDS;
