import "server-only";
import { GithubIntegrationError } from "./errors";

const DEFAULT_SCOPES = ["read:user", "repo"];

export type GithubOAuthConfig = {
  clientId: string;
  clientSecret: string;
  appUrl: string;
  scopes: string[];
};

function getAppUrl() {
  const configuredUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();
  const appUrl = configuredUrl || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined);
  if (!appUrl) throw new GithubIntegrationError("github_not_configured", "NEXT_PUBLIC_APP_URL must be configured before GitHub can be connected.", 503);
  try {
    return new URL(appUrl).origin;
  } catch {
    throw new GithubIntegrationError("github_not_configured", "NEXT_PUBLIC_APP_URL must be a valid absolute URL.", 503);
  }
}

export function getGithubOAuthConfig(): GithubOAuthConfig {
  const clientId = process.env.GITHUB_CLIENT_ID?.trim();
  const clientSecret = process.env.GITHUB_CLIENT_SECRET?.trim();

  if (!clientId || !clientSecret) {
    throw new GithubIntegrationError(
      "github_not_configured",
      "GitHub connection is not configured. Add GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, and NEXT_PUBLIC_APP_URL to the server environment.",
      503,
    );
  }

  return { clientId, clientSecret, appUrl: getAppUrl(), scopes: DEFAULT_SCOPES };
}

export function githubCallbackUrl(config = getGithubOAuthConfig()) {
  return new URL("/api/github/oauth/callback", config.appUrl).toString();
}

export function assertTrustedOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return;
  if (origin !== getAppUrl()) {
    throw new GithubIntegrationError("invalid_origin", "This GitHub request did not originate from Logfound.", 403);
  }
}
