import { cookies } from "next/headers";
import { AUTH_COOKIE_NAME, verifySessionToken } from "@/lib/auth/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const token = (await cookies()).get(AUTH_COOKIE_NAME)?.value;
  const session = await verifySessionToken(token);
  return Response.json({ authenticated: Boolean(session), user: session?.user || null }, { headers: { "Cache-Control": "no-store" } });
}
