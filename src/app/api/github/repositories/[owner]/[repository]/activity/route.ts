import { requireWorkspaceSession } from "@/lib/github/auth";
import { getGithubRepositoryActivity } from "@/lib/github/client";
import { toGithubErrorResponse } from "@/lib/github/errors";
import { assertGithubRepositoryConnected, withGithubAccessToken } from "@/lib/github/store";

export const dynamic = "force-dynamic";

type Context = { params: Promise<{ owner: string; repository: string }> };

export async function GET(_request: Request, { params }: Context) {
  try {
    const { user } = await requireWorkspaceSession();
    const { owner, repository } = await params;
    await assertGithubRepositoryConnected(user.id, `${owner}/${repository}`);
    return Response.json(await withGithubAccessToken(user.id, (accessToken) => getGithubRepositoryActivity(accessToken, owner, repository)), { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return toGithubErrorResponse(error);
  }
}
