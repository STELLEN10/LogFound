import { SignJWT } from "jose/jwt/sign";
import { jwtVerify } from "jose/jwt/verify";

export const AUTH_COOKIE_NAME = "logfound_session";
export const AUTH_SESSION_MAX_AGE = 60 * 60 * 24 * 30;

export type AuthUser = { id: string; username: string; name: string };
export type AuthSession = { user: AuthUser; expiresAt: number };

function authSecret() {
  const configured = process.env.NEXTAUTH_SECRET?.trim();
  if (configured) return new TextEncoder().encode(configured);
  if (process.env.NODE_ENV === "production") throw new Error("NEXTAUTH_SECRET is required for authentication in production.");
  return new TextEncoder().encode("logfound-development-session-secret");
}

export async function userIdForUsername(username: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`logfound:user:${username.toLowerCase()}`));
  const bytes = new Uint8Array(digest);
  bytes[6] = (bytes[6] & 0x0f) | 0x50;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

export async function createSessionToken(user: AuthUser) {
  return new SignJWT({ username: user.username, name: user.name, kind: "logfound-demo" })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime(`${AUTH_SESSION_MAX_AGE}s`)
    .sign(authSecret());
}

export async function verifySessionToken(token: string | undefined): Promise<AuthSession | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, authSecret(), { algorithms: ["HS256"] });
    if (payload.kind !== "logfound-demo" || typeof payload.sub !== "string" || typeof payload.username !== "string" || typeof payload.name !== "string" || typeof payload.exp !== "number") return null;
    return { user: { id: payload.sub, username: payload.username, name: payload.name }, expiresAt: payload.exp * 1000 };
  } catch {
    return null;
  }
}

export function sessionCookieOptions() {
  return { httpOnly: true, sameSite: "lax" as const, secure: process.env.NODE_ENV === "production", path: "/", maxAge: AUTH_SESSION_MAX_AGE };
}
