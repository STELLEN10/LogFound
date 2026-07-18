export type GithubRepository = {
  id: number;
  name: string;
  fullName: string;
  owner: string;
  description: string | null;
  private: boolean;
  visibility: "public" | "private" | "internal";
  language: string | null;
  defaultBranch: string;
  updatedAt: string;
  pushedAt: string | null;
  htmlUrl: string;
  stars: number;
  avatarUrl: string | null;
};

export type GithubCommit = {
  sha: string;
  message: string;
  authorName: string | null;
  authoredAt: string | null;
  htmlUrl: string;
};

export type GithubPullRequest = {
  id: number;
  number: number;
  title: string;
  state: "open" | "closed";
  draft: boolean;
  author: string | null;
  updatedAt: string;
  htmlUrl: string;
};

export type GithubIssue = {
  id: number;
  number: number;
  title: string;
  state: "open" | "closed";
  author: string | null;
  updatedAt: string;
  htmlUrl: string;
};

export type GithubBranch = {
  name: string;
  protected: boolean;
  sha: string;
};

export type GithubContributor = {
  login: string;
  avatarUrl: string | null;
  contributions: number;
  htmlUrl: string;
};

export type GithubRepositoryActivity = {
  repository: GithubRepository;
  commits: GithubCommit[];
  pullRequests: GithubPullRequest[];
  issues: GithubIssue[];
  branches: GithubBranch[];
  contributors: GithubContributor[];
};

export type GithubConnectedRepository = GithubRepository & {
  projectKey: string;
  connectedAt: string;
};

export type GithubConnectionStatus = {
  connected: boolean;
  reauthRequired?: boolean;
  login?: string;
  avatarUrl?: string | null;
  connectedAt?: string;
  scopes?: string[];
  repositories: GithubConnectedRepository[];
};
