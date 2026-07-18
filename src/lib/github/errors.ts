export class GithubIntegrationError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status: number = 500,
  ) {
    super(message);
    this.name = "GithubIntegrationError";
  }
}

export function toGithubErrorResponse(error: unknown) {
  if (error instanceof GithubIntegrationError) {
    return Response.json({ error: { code: error.code, message: error.message } }, { status: error.status, headers: { "Cache-Control": "no-store" } });
  }

  console.error("[github] request failed", error instanceof Error ? { name: error.name, message: error.message } : { error: "unknown" });
  return Response.json({ error: { code: "github_unavailable", message: "GitHub is temporarily unavailable. Please try again." } }, { status: 503, headers: { "Cache-Control": "no-store" } });
}
