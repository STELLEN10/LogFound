import { requireWorkspaceSession } from "@/lib/github/auth";
import { toGithubErrorResponse } from "@/lib/github/errors";
import { githubConnectionStatus } from "@/lib/github/store";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { user } = await requireWorkspaceSession();
    return Response.json(await githubConnectionStatus(user.id), { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return toGithubErrorResponse(error);
  }
}
