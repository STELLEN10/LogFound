import "server-only";
import { randomBytes, timingSafeEqual } from "node:crypto";
import { getGithubOAuthConfig, githubCallbackUrl } from "./config";
import { GithubIntegrationError } from "./errors";

export const GITHUB_OAUTH_STATE_COOKIE = "logfound_github_oauth_state";

type OAuthTokenResponse = { access_token?: string; scope?: string; token_type?: string; error?: string; error_description?: string };

export function createOAuthState() {
  return randomBytes(32).toString("base64url");
}

export function createAuthorizationUrl(state: string) {
  const config = getGithubOAuthConfig();
  const url = new URL("https://github.com/login/oauth/authorize");
  url.searchParams.set("client_id", config.clientId);
  url.searchParams.set("redirect_uri", githubCallbackUrl(config));
  url.searchParams.set("scope", config.scopes.join(" "));
  url.searchParams.set("state", state);
  return url.toString();
}

export function validOAuthState(expected: string | undefined, received: string | null) {
  if (!expected || !received) return false;
  const expectedValue = Buffer.from(expected);
  const receivedValue = Buffer.from(received);
  return expectedValue.length === receivedValue.length && timingSafeEqual(expectedValue, receivedValue);
}

export async function exchangeGithubCode(code: string) {
  const config = getGithubOAuthConfig();
  let response: Response;
  try {
    response = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify({ client_id: config.clientId, client_secret: config.clientSecret, code, redirect_uri: githubCallbackUrl(config) }),
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
    });
  } catch {
    throw new GithubIntegrationError("github_oauth_unavailable", "GitHub authorization could not be completed. Please try again.", 503);
  }

  const body = await response.json().catch(() => ({})) as OAuthTokenResponse;
  if (!response.ok || !body.access_token) {
    throw new GithubIntegrationError("github_oauth_failed", body.error_description || "GitHub did not issue an access token. Please try again.", 502);
  }

  return { accessToken: body.access_token, scopes: body.scope?.split(",").map((scope) => scope.trim()).filter(Boolean) || config.scopes };
}
