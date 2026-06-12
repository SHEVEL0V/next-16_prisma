/** @format */
"use server";

import { jwtVerify, SignJWT } from "jose";
import { cookies } from "next/headers";
import type { User } from "../../generated/prisma/client";

/**
 * Session Management Utilities
 * Handles JWT-based session encryption, decryption, and cookie management
 */

// Session duration (1 hour in milliseconds)
const SESSION_DURATION_MS = 60 * 60 * 1000;

// Lazy-initialized encoded key — validated at call time, not at module load.
// This prevents next build from failing when env vars are not available at build time.
let _encodedKey: Uint8Array | null = null;

function getEncodedKey(): Uint8Array {
  if (!_encodedKey) {
    const secretKey = process.env.SESSION_SECRET;
    if (!secretKey) {
      throw new Error("SESSION_SECRET is not defined in environment variables");
    }
    _encodedKey = new TextEncoder().encode(secretKey);
  }
  return _encodedKey;
}

/**
 * Session payload structure stored in JWT
 */
type SessionPayload = {
  id: string;
  name: string;
  expiresAt: number;
};

/**
 * Encrypt session payload into JWT token
 * Uses HS256 algorithm with 7-day expiration
 *
 * @param payload - Session data to encrypt (user id, name, expiry)
 * @returns Encrypted JWT token string
 */
export async function encrypt(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(getEncodedKey());
}

/**
 * Decrypt and verify JWT session token
 * Returns null if token is invalid or verification fails
 *
 * @param session - JWT token string to decrypt
 * @returns Decrypted session payload or null if invalid
 */
export async function decrypt(session: string | undefined = "") {
  if (!session) return null;

  try {
    const { payload } = await jwtVerify(session, getEncodedKey(), {
      algorithms: ["HS256"],
    });
    return payload as SessionPayload;
  } catch (error) {
    console.error("⛔️ Session decryption failed", error);
    return null;
  }
}

/**
 * Create new user session
 * Encrypts user data and stores as HTTP-only cookie (1 hour duration)
 *
 * @param user - User object with id and name
 */
export async function createSession(user: User) {
  const expiresAt = Date.now() + SESSION_DURATION_MS;
  const { id, name } = user;

  const session = await encrypt({
    id,
    name,
    expiresAt,
  });

  const cookieStore = await cookies();

  cookieStore.set("session", session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires: new Date(expiresAt),
    sameSite: "lax",
    path: "/",
  });
}

/**
 * Get current session from cookies
 * Automatically decrypts and validates JWT token
 *
 * @returns Session payload if valid, null otherwise
 */
export async function getSession() {
  const sessionValue = (await cookies()).get("session")?.value;

  return (await decrypt(sessionValue)) as SessionPayload | null;
}

/**
 * Delete current user session
 * Clears session cookie on logout
 */
export async function deleteSession() {
  (await cookies()).delete("session");
}
