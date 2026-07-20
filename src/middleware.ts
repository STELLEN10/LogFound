import { updateSession } from "@/lib/supabase/middleware";
import { AUTH_COOKIE_NAME, verifySessionToken } from "@/lib/auth/session";
import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_PATHS = ["/login", "/api/auth/login", "/api/auth/logout", "/api/auth/session"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (PUBLIC_PATHS.includes(pathname)) return NextResponse.next();
  const session = await verifySessionToken(request.cookies.get(AUTH_COOKIE_NAME)?.value);
  if (session) return updateSession(request);
  if (pathname.startsWith("/api/")) return NextResponse.json({ error: { code: "sign_in_required", message: "Sign in to continue." } }, { status: 401, headers: { "Cache-Control": "no-store" } });
  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("callbackUrl", `${pathname}${request.nextUrl.search}`);
  return NextResponse.redirect(loginUrl);
}

export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"] };
