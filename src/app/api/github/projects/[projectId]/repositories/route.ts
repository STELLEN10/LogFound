import { z } from "zod";
import { requireWorkspaceSession } from "@/lib/github/auth";
import { assertTrustedOrigin } from "@/lib/github/config";
import { getGithubRepository } from "@/lib/github/client";
import { GithubIntegrationError, toGithubErrorResponse } from "@/lib/github/errors";
import { listConnectedGithubRepositories, replaceProjectRepositories, withGithubAccessToken } from "@/lib/github/store";

export const dynamic = "force-dynamic";

const selectionSchema = z.object({ repositoryIds: z.array(z.number().int().positive()).max(20).refine((ids) => new Set(ids).size === ids.length) });

type Context = { params: Promise<{ projectId: string }> };

export async function GET(_request: Request, { params }: Context) {
  try {
    const { user } = await requireWorkspaceSession();
    const { projectId } = await params;
    return Response.json({ repositories: await listConnectedGithubRepositories(user.id, projectId) }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return toGithubErrorResponse(error);
  }
}

export async function POST(request: Request, { params }: Context) {
  try {
    assertTrustedOrigin(request);
    const { user } = await requireWorkspaceSession();
    const parsed = selectionSchema.safeParse(await request.json());
    if (!parsed.success) throw new GithubIntegrationError("invalid_repository_selection", "Choose up to 20 valid GitHub repositories.", 400);
    const payload = parsed.data;
    const { projectId } = await params;
    if (!/^[a-z0-9][a-z0-9-]{0,119}$/i.test(projectId)) throw new GithubIntegrationError("invalid_project", "Choose a valid project before connecting repositories.", 400);
    const repositories = await withGithubAccessToken(user.id, (accessToken) => Promise.all(payload.repositoryIds.map((repositoryId) => getGithubRepository(accessToken, repositoryId))));
    return Response.json({ repositories: await replaceProjectRepositories(user.id, projectId, repositories) }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return toGithubErrorResponse(error);
  }
}
