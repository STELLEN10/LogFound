import { SignJWT } from "jose/jwt/sign";
import { jwtVerify } from "jose/jwt/verify";

export const AUTH_COOKIE_NAME = "logfound_session";
export const AUTH_SESSION_MAX_AGE = 60 * 60 * 24 * 30;

export type AuthUser = { id: string; username: string; name: string };
export type AuthSession = { user: AuthUser; expiresAt: number };

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isUuid(value: string): boolean {
  return UUID_PATTERN.test(value);
}

function authSecret() {
  const configured = process.env.NEXTAUTH_SECRET?.trim();
  if (configured) return new TextEncoder().encode(configured);
  if (process.env.NODE_ENV === "production") throw new Error("NEXTAUTH_SECRET is required for authentication in production.");
  return new TextEncoder().encode("logfound-development-session-secret");
}

/**
 * Generate a workspace identity that is safe to write to PostgreSQL UUID
 * columns. GitHub subjects, usernames, slugs, hashes, and timestamps are not
 * UUIDs and must never be used as workspace identities.
 */
export function createWorkspaceUuid(): string {
  return crypto.randomUUID();
}

export async function createSessionToken(user: AuthUser) {
  const userId = isUuid(user.id) ? user.id : createWorkspaceUuid();
  return new SignJWT({ username: user.username, name: user.name, kind: "logfound-demo" })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime(`${AUTH_SESSION_MAX_AGE}s`)
    .sign(authSecret());
}

export async function verifySessionToken(token: string | undefined): Promise<AuthSession | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, authSecret(), { algorithms: ["HS256"] });
    if (payload.kind !== "logfound-demo" || typeof payload.sub !== "string" || typeof payload.username !== "string" || typeof payload.name !== "string" || typeof payload.exp !== "number") return null;
    const userId = isUuid(payload.sub) ? payload.sub : createWorkspaceUuid();
    return { user: { id: userId, username: payload.username, name: payload.name }, expiresAt: payload.exp * 1000 };
  } catch {
    return null;
  }
}

export function sessionCookieOptions() {
  return { httpOnly: true, sameSite: "lax" as const, secure: process.env.NODE_ENV === "production", path: "/", maxAge: AUTH_SESSION_MAX_AGE };
}
