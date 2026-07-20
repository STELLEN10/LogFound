import { NextResponse } from "next/server";
import { AUTH_COOKIE_NAME, sessionCookieOptions } from "@/lib/auth/session";

export const runtime = "nodejs";

export async function POST() {
  const response = NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  response.cookies.set({ name: AUTH_COOKIE_NAME, value: "", ...sessionCookieOptions(), maxAge: 0 });
  return response;
}
