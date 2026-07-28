import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import type { Role } from "@/generated/prisma";

const SESSION_COOKIE = "merik_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

function getSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET is not set");
  return new TextEncoder().encode(secret);
}

export type SessionPayload = {
  userId: string;
  role: Role;
  email: string;
};

export async function createSession(payload: SessionPayload) {
  const token = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(getSecret());

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getSecret());
    return {
      userId: payload.userId as string,
      role: payload.role as Role,
      email: payload.email as string,
    };
  } catch {
    return null;
  }
}

export { SESSION_COOKIE };

// ---------------------------------------------------------------------------
// Pending verification (post signup/login, pre-OTP)
// ---------------------------------------------------------------------------

const PENDING_COOKIE = "merik_pending";
const PENDING_TTL_SECONDS = 60 * 15; // 15 minutes

export type PendingPurpose = "SIGNUP_VERIFICATION" | "LOGIN";

export async function createPendingVerification(
  userId: string,
  purpose: PendingPurpose
) {
  const token = await new SignJWT({ userId, purpose })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${PENDING_TTL_SECONDS}s`)
    .sign(getSecret());

  const cookieStore = await cookies();
  cookieStore.set(PENDING_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: PENDING_TTL_SECONDS,
  });
}

export async function getPendingVerification(): Promise<{
  userId: string;
  purpose: PendingPurpose;
} | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(PENDING_COOKIE)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getSecret());
    return {
      userId: payload.userId as string,
      purpose: payload.purpose as PendingPurpose,
    };
  } catch {
    return null;
  }
}

export async function clearPendingVerification() {
  const cookieStore = await cookies();
  cookieStore.delete(PENDING_COOKIE);
}
