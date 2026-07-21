import { NextRequest, NextResponse } from "next/server";
import { requireWorkspaceSession } from "@/lib/github/auth";
import { getGithubViewer } from "@/lib/github/client";
import { GithubIntegrationError } from "@/lib/github/errors";
import {
  exchangeGithubCode,
  GITHUB_OAUTH_STATE_COOKIE,
  validOAuthState,
} from "@/lib/github/oauth";
import { checkGithubStorage, saveGithubConnection } from "@/lib/github/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function settingsRedirect(
  request: NextRequest,
  status: "connected" | "error",
  code?: string,
) {
  const url = new URL("/settings", request.url);
  url.searchParams.set("github", status);
  if (code) url.searchParams.set("github_reason", code);
  const response = NextResponse.redirect(url);
  response.cookies.set({
    name: GITHUB_OAUTH_STATE_COOKIE,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  return response;
}

export async function GET(request: NextRequest) {
  const providerError = request.nextUrl.searchParams.get("error");
  if (providerError)
    return settingsRedirect(request, "error", "github_authorization_declined");

  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const expectedState = request.cookies.get(GITHUB_OAUTH_STATE_COOKIE)?.value;
  if (!code || code.length > 2048 || !validOAuthState(expectedState, state)) {
    return settingsRedirect(request, "error", "invalid_oauth_state");
  }

  let operation = "validating the workspace session";
  try {
    const { user } = await requireWorkspaceSession();
    operation = "exchanging the GitHub authorization code";
    const token = await exchangeGithubCode(code);
    operation = "loading the authenticated GitHub user";
    const viewer = await getGithubViewer(token.accessToken);
    operation = "checking GitHub storage tables";
    await checkGithubStorage();
    operation = "saving the GitHub connection";
    await saveGithubConnection(
      user.id,
      viewer,
      token.accessToken,
      token.scopes,
    );
    return settingsRedirect(request, "connected");
  } catch (error) {
    const code =
      error instanceof GithubIntegrationError
        ? error.code === "github_storage_unavailable" && operation === "saving the GitHub connection"
          ? "github_storage_save_failed"
          : error.code
        : "github_oauth_failed";
    console.error("[github] OAuth callback failed", {
      operation,
      code,
      message: error instanceof Error ? error.message : "unknown_error",
      stack: error instanceof Error ? error.stack : undefined,
      details: typeof error === "object" && error && "details" in error ? error.details : undefined,
    });
    return settingsRedirect(request, "error", code);
  }
}
