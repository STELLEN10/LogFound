import "server-only";
import { GithubIntegrationError } from "./errors";
import type { GithubBranch, GithubCommit, GithubContributor, GithubIssue, GithubPullRequest, GithubRepository, GithubRepositoryActivity } from "./types";

const API_URL = "https://api.github.com";
const API_VERSION = "2022-11-28";
const REQUEST_TIMEOUT_MS = 15_000;

type GithubUser = { login: string; id: number; avatar_url?: string | null };
type GithubRepositoryResponse = {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
  visibility?: string | null;
  description?: string | null;
  language?: string | null;
  default_branch?: string | null;
  updated_at: string;
  pushed_at?: string | null;
  html_url: string;
  stargazers_count?: number;
  owner: GithubUser;
};
type GithubCommitResponse = { sha: string; html_url: string; commit: { message: string; author?: { name?: string | null; date?: string | null } | null } };
type GithubPullRequestResponse = { id: number; number: number; title: string; state: string; draft?: boolean; updated_at: string; html_url: string; user?: GithubUser | null };
type GithubIssueResponse = GithubPullRequestResponse & { pull_request?: unknown };
type GithubBranchResponse = { name: string; protected: boolean; commit: { sha: string } };
type GithubContributorResponse = { login: string; avatar_url?: string | null; contributions: number; html_url: string };

export type GithubViewer = { id: number; login: string; avatarUrl: string | null };

function apiPath(path: string) {
  return new URL(path, API_URL).toString();
}

async function githubRequest<T>(accessToken: string, path: string): Promise<T> {
  let response: Response;
  try {
    response = await fetch(apiPath(path), {
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${accessToken}`,
        "X-GitHub-Api-Version": API_VERSION,
      },
      cache: "no-store",
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch (error) {
    if (error instanceof Error && error.name === "TimeoutError") {
      throw new GithubIntegrationError("github_timeout", "GitHub took too long to respond. Please try again.", 504);
    }
    throw new GithubIntegrationError("github_network_error", "GitHub could not be reached. Please try again.", 503);
  }

  if (!response.ok) {
    if (response.status === 401) throw new GithubIntegrationError("github_reconnect_required", "Your GitHub connection has expired or was revoked. Reconnect GitHub to continue.", 401);
    if (response.status === 429 || (response.status === 403 && response.headers.get("x-ratelimit-remaining") === "0")) {
      throw new GithubIntegrationError("github_rate_limited", "GitHub rate limit reached. Please try again shortly.", 429);
    }
    if (response.status === 404) throw new GithubIntegrationError("github_not_found", "GitHub could not find that repository or resource.", 404);
    if (response.status === 403) throw new GithubIntegrationError("github_access_denied", "GitHub denied access to this resource. Check the repository permissions and reconnect if needed.", 403);
    throw new GithubIntegrationError("github_api_error", "GitHub could not complete this request. Please try again.", 502);
  }

  return response.json() as Promise<T>;
}

function asVisibility(value: string | null | undefined, isPrivate: boolean): GithubRepository["visibility"] {
  return value === "internal" || value === "private" || value === "public" ? value : isPrivate ? "private" : "public";
}

function mapRepository(repository: GithubRepositoryResponse): GithubRepository {
  if (!Number.isSafeInteger(repository.id) || !repository.name || !repository.full_name || !repository.owner?.login || !repository.html_url || !repository.updated_at) {
    throw new GithubIntegrationError("github_response_invalid", "GitHub returned incomplete repository data. Please try again.", 502);
  }

  return {
    id: repository.id,
    name: repository.name,
    fullName: repository.full_name,
    owner: repository.owner.login,
    description: repository.description || null,
    private: Boolean(repository.private),
    visibility: asVisibility(repository.visibility, repository.private),
    language: repository.language || null,
    defaultBranch: repository.default_branch || "main",
    updatedAt: repository.updated_at,
    pushedAt: repository.pushed_at || null,
    htmlUrl: repository.html_url,
    stars: repository.stargazers_count || 0,
    avatarUrl: repository.owner.avatar_url || null,
  };
}

function mapCommit(commit: GithubCommitResponse): GithubCommit {
  return { sha: commit.sha, message: commit.commit.message, authorName: commit.commit.author?.name || null, authoredAt: commit.commit.author?.date || null, htmlUrl: commit.html_url };
}

function mapPullRequest(pullRequest: GithubPullRequestResponse): GithubPullRequest {
  return { id: pullRequest.id, number: pullRequest.number, title: pullRequest.title, state: pullRequest.state === "open" ? "open" : "closed", draft: Boolean(pullRequest.draft), author: pullRequest.user?.login || null, updatedAt: pullRequest.updated_at, htmlUrl: pullRequest.html_url };
}

function mapIssue(issue: GithubIssueResponse): GithubIssue {
  return { id: issue.id, number: issue.number, title: issue.title, state: issue.state === "open" ? "open" : "closed", author: issue.user?.login || null, updatedAt: issue.updated_at, htmlUrl: issue.html_url };
}

function mapBranch(branch: GithubBranchResponse): GithubBranch {
  return { name: branch.name, protected: Boolean(branch.protected), sha: branch.commit.sha };
}

function mapContributor(contributor: GithubContributorResponse): GithubContributor {
  return { login: contributor.login, avatarUrl: contributor.avatar_url || null, contributions: contributor.contributions, htmlUrl: contributor.html_url };
}

function repositoryPath(owner: string, repository: string) {
  if (!/^[A-Za-z0-9_.-]+$/.test(owner) || !/^[A-Za-z0-9_.-]+$/.test(repository)) {
    throw new GithubIntegrationError("invalid_repository", "Repository owner and name contain unsupported characters.", 400);
  }
  return `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repository)}`;
}

export async function getGithubViewer(accessToken: string): Promise<GithubViewer> {
  const user = await githubRequest<GithubUser>(accessToken, "/user");
  if (!Number.isSafeInteger(user.id) || !user.login) throw new GithubIntegrationError("github_response_invalid", "GitHub returned incomplete account data. Please try again.", 502);
  return { id: user.id, login: user.login, avatarUrl: user.avatar_url || null };
}

export async function listGithubRepositories(accessToken: string, page = 1, perPage = 100) {
  const safePage = Math.max(1, Math.min(page, 1000));
  const safePerPage = Math.max(1, Math.min(perPage, 100));
  const repositories = await githubRequest<GithubRepositoryResponse[]>(accessToken, `/user/repos?affiliation=owner%2Ccollaborator%2Corganization_member&sort=updated&direction=desc&page=${safePage}&per_page=${safePerPage}`);
  return repositories.map(mapRepository);
}

export async function getGithubRepository(accessToken: string, repositoryId: number) {
  if (!Number.isSafeInteger(repositoryId) || repositoryId < 1) throw new GithubIntegrationError("invalid_repository", "Choose a valid GitHub repository.", 400);
  return mapRepository(await githubRequest<GithubRepositoryResponse>(accessToken, `/repositories/${repositoryId}`));
}

export async function getGithubRepositoryActivity(accessToken: string, owner: string, repository: string): Promise<GithubRepositoryActivity> {
  const path = repositoryPath(owner, repository);
  const [repositoryData, commits, pullRequests, issues, branches, contributors] = await Promise.all([
    githubRequest<GithubRepositoryResponse>(accessToken, path),
    githubRequest<GithubCommitResponse[]>(accessToken, `${path}/commits?per_page=20`),
    githubRequest<GithubPullRequestResponse[]>(accessToken, `${path}/pulls?state=all&sort=updated&direction=desc&per_page=20`),
    githubRequest<GithubIssueResponse[]>(accessToken, `${path}/issues?state=all&sort=updated&direction=desc&per_page=20`),
    githubRequest<GithubBranchResponse[]>(accessToken, `${path}/branches?per_page=100`),
    githubRequest<GithubContributorResponse[]>(accessToken, `${path}/contributors?per_page=20`),
  ]);

  return {
    repository: mapRepository(repositoryData),
    commits: commits.map(mapCommit),
    pullRequests: pullRequests.map(mapPullRequest),
    issues: issues.filter((issue) => !issue.pull_request).map(mapIssue),
    branches: branches.map(mapBranch),
    contributors: contributors.map(mapContributor),
  };
}
