import { NextResponse } from "next/server";
import { requireWorkspaceSession } from "@/lib/github/auth";
import { assertTrustedOrigin } from "@/lib/github/config";
import { toGithubErrorResponse } from "@/lib/github/errors";
import { createAuthorizationUrl, createOAuthState, GITHUB_OAUTH_STATE_COOKIE } from "@/lib/github/oauth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    assertTrustedOrigin(request);
    await requireWorkspaceSession();
    const state = createOAuthState();
    const response = NextResponse.json({ authorizationUrl: createAuthorizationUrl(state) }, { headers: { "Cache-Control": "no-store" } });
    response.cookies.set({
      name: GITHUB_OAUTH_STATE_COOKIE,
      value: state,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 10 * 60,
    });
    return response;
  } catch (error) {
    return toGithubErrorResponse(error);
  }
}
