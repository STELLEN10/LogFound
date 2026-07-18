import { NextRequest } from "next/server";
import { requireWorkspaceSession } from "@/lib/github/auth";
import { listGithubRepositories } from "@/lib/github/client";
import { toGithubErrorResponse } from "@/lib/github/errors";
import { withGithubAccessToken } from "@/lib/github/store";

export const dynamic = "force-dynamic";

function boundedInteger(value: string | null, fallback: number, maximum: number) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? Math.min(parsed, maximum) : fallback;
}

export async function GET(request: NextRequest) {
  try {
    const { user } = await requireWorkspaceSession();
    const page = boundedInteger(request.nextUrl.searchParams.get("page"), 1, 1000);
    const perPage = boundedInteger(request.nextUrl.searchParams.get("per_page"), 100, 100);
    const query = request.nextUrl.searchParams.get("query")?.trim().slice(0, 120).toLowerCase();
    const repositories = await withGithubAccessToken(user.id, (accessToken) => listGithubRepositories(accessToken, page, perPage));
    const results = query ? repositories.filter((repository) => `${repository.fullName} ${repository.description || ""}`.toLowerCase().includes(query)) : repositories;
    return Response.json({ repositories: results, page, perPage }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return toGithubErrorResponse(error);
  }
}
