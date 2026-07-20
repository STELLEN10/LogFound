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
  const configuredUrl =
    process.env.NEXT_PUBLIC_APP_URL?.trim() || process.env.NEXTAUTH_URL?.trim();
  const appUrl =
    configuredUrl ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined);
  if (!appUrl)
    throw new GithubIntegrationError(
      "github_not_configured",
      "GitHub callback URL is not configured. Set NEXTAUTH_URL (or NEXT_PUBLIC_APP_URL) to your deployed Logfound URL.",
      503,
    );
  try {
    return new URL(appUrl).origin;
  } catch {
    throw new GithubIntegrationError(
      "github_not_configured",
      "GitHub callback URL is invalid. NEXTAUTH_URL must be an absolute URL such as https://your-app.vercel.app.",
      503,
    );
  }
}

export function getGithubOAuthConfig(): GithubOAuthConfig {
  const clientId = process.env.GITHUB_CLIENT_ID?.trim();
  const clientSecret = process.env.GITHUB_CLIENT_SECRET?.trim();

  if (!clientId || !clientSecret) {
    throw new GithubIntegrationError(
      "github_not_configured",
      "GitHub OAuth is not configured. Add GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, and NEXTAUTH_URL to the server environment.",
      503,
    );
  }

  return {
    clientId,
    clientSecret,
    appUrl: getAppUrl(),
    scopes: DEFAULT_SCOPES,
  };
}

export function githubCallbackUrl(config = getGithubOAuthConfig()) {
  return new URL("/api/github/oauth/callback", config.appUrl).toString();
}

export function assertTrustedOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return;
  if (origin !== getAppUrl()) {
    throw new GithubIntegrationError(
      "invalid_origin",
      "This GitHub request did not originate from Logfound.",
      403,
    );
  }
}
