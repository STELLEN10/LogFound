import { z } from "zod";
import { authenticateCredentials } from "@/lib/auth/credentials";
import { createSessionToken, sessionCookieOptions } from "@/lib/auth/session";
import { ensureWorkspaceUser } from "@/lib/auth/users";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const loginSchema = z.object({ username: z.string().trim().min(1).max(64), password: z.string().min(1).max(256) });

export async function POST(request: Request) {
  try {
    const input = loginSchema.parse(await request.json());
    const user = await authenticateCredentials(input.username, input.password);
    if (!user) return Response.json({ error: { code: "invalid_credentials", message: "That username or password does not match." } }, { status: 401, headers: { "Cache-Control": "no-store" } });
    const token = await createSessionToken(user);
    await ensureWorkspaceUser(user);
    const response = NextResponse.json({ ok: true, user }, { headers: { "Cache-Control": "no-store" } });
    response.cookies.set({ name: "logfound_session", value: token, ...sessionCookieOptions() });
    return response;
  } catch (error) {
    if (error instanceof z.ZodError) return Response.json({ error: { code: "invalid_request", message: "Enter a username and password to continue." } }, { status: 400 });
    console.error("[auth] login failed", { message: error instanceof Error ? error.message : "unknown_error" });
    return Response.json({ error: { code: "auth_unavailable", message: "Sign in is temporarily unavailable. Please try again." } }, { status: 503 });
  }
}
