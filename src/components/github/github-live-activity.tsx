"use client";

import { AlertTriangle, GitBranch, GitCommitHorizontal, Github, GitPullRequest, GitPullRequestClosed, LoaderCircle, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { useCurrentTime } from "@/hooks/use-current-time";
import type { GithubConnectionStatus, GithubRepositoryActivity } from "@/lib/github/types";

type State = { kind: "loading" } | { kind: "disconnected" } | { kind: "error"; message: string } | { kind: "ready"; activity: GithubRepositoryActivity };

function errorMessage(payload: unknown) {
  if (typeof payload === "object" && payload && "error" in payload && typeof payload.error === "object" && payload.error && "message" in payload.error && typeof payload.error.message === "string") return payload.error.message;
  return "GitHub activity could not be loaded.";
}

async function request<T>(url: string) {
  const response = await fetch(url, { cache: "no-store" });
  const payload: unknown = await response.json().catch(() => null);
  if (!response.ok) throw new Error(errorMessage(payload));
  return payload as T;
}

export function GithubLiveActivity() {
  const { relative } = useCurrentTime();
  const [state, setState] = useState<State>({ kind: "loading" });

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const status = await request<GithubConnectionStatus>("/api/github/status");
        const repository = status.repositories.find((item) => item.projectKey === "logfound-activation");
        if (!status.connected || !repository) {
          if (active) setState({ kind: "disconnected" });
          return;
        }
        const activity = await request<GithubRepositoryActivity>(`/api/github/repositories/${encodeURIComponent(repository.owner)}/${encodeURIComponent(repository.name)}/activity`);
        if (active) setState({ kind: "ready", activity });
      } catch (error) {
        if (active) setState({ kind: "error", message: error instanceof Error ? error.message : "GitHub activity could not be loaded." });
      }
    };
    void load();
    return () => { active = false; };
  }, []);

  if (state.kind === "loading") return <section className="mt-8 animate-rise rounded-xl border border-border bg-card/55 p-6" aria-live="polite"><div className="flex items-center gap-3 text-sm text-muted-foreground"><LoaderCircle className="size-4 animate-spin text-primary" />Checking the secure GitHub connection…</div></section>;

  if (state.kind === "disconnected") return <section className="mt-8 animate-rise rounded-xl border border-dashed border-primary/30 bg-primary/[0.04] p-6"><div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Live repository context</p><h2 className="mt-2 text-xl font-semibold tracking-tight">Connect the work behind your decisions.</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">Connect GitHub in Settings and select a repository for Logfound activation to replace this live layer with commits, pull requests, issues, branches, and contributors.</p></div><a href="/settings" className="inline-flex h-10 shrink-0 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"><Github className="mr-2 size-4" />Connect GitHub</a></div></section>;

  if (state.kind === "error") return <section className="mt-8 animate-rise rounded-xl border border-amber-300/25 bg-amber-300/[0.06] p-5" role="alert"><p className="flex items-center gap-2 text-sm font-medium text-amber-200"><AlertTriangle className="size-4" />Live GitHub context is unavailable</p><p className="mt-2 text-sm leading-6 text-muted-foreground">{state.message}</p><a href="/settings" className="mt-4 inline-flex text-sm text-primary hover:underline">Review GitHub connection settings</a></section>;

  const { activity } = state;
  return <section className="mt-8 animate-rise rounded-xl border border-primary/25 bg-gradient-to-br from-primary/[0.08] via-card to-card p-6" aria-labelledby="live-github-title">
    <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Live repository context</p><h2 id="live-github-title" className="mt-2 text-2xl font-semibold tracking-tight">{activity.repository.fullName}</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">{activity.repository.description || "GitHub activity is now connected to this founder workspace."}</p></div><a href={activity.repository.htmlUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm text-primary hover:underline"><Github className="size-4" />Open repository</a></div>
    <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5"><LiveMetric Icon={GitCommitHorizontal} value={String(activity.commits.length)} label="recent commits" /><LiveMetric Icon={GitPullRequest} value={String(activity.pullRequests.length)} label="pull requests" /><LiveMetric Icon={GitPullRequestClosed} value={String(activity.issues.length)} label="issues" /><LiveMetric Icon={GitBranch} value={String(activity.branches.length)} label="branches" /><LiveMetric Icon={Users} value={String(activity.contributors.length)} label="contributors" /></div>
    <div className="mt-6 grid gap-5 lg:grid-cols-2"><LiveList title="Recent commits" items={activity.commits.slice(0, 5).map((commit) => ({ title: commit.message.split("\n")[0], meta: `${commit.sha.slice(0, 7)} · ${commit.authorName || "Unknown author"} · ${commit.authoredAt ? relative(commit.authoredAt) : "time unavailable"}`, href: commit.htmlUrl }))} empty="No commits were returned by GitHub." /><LiveList title="Pull requests and issues" items={[...activity.pullRequests.slice(0, 3).map((item) => ({ title: `#${item.number} ${item.title}`, meta: `${item.state} pull request · updated ${relative(item.updatedAt)}`, href: item.htmlUrl })), ...activity.issues.slice(0, 3).map((item) => ({ title: `#${item.number} ${item.title}`, meta: `${item.state} issue · updated ${relative(item.updatedAt)}`, href: item.htmlUrl }))]} empty="No recent pull requests or issues were returned." /></div>
    <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-primary/15 pt-5 text-xs text-muted-foreground"><span>Default branch: <strong className="font-medium text-foreground">{activity.repository.defaultBranch}</strong></span><span>Last pushed: <strong className="font-medium text-foreground">{activity.repository.pushedAt ? relative(activity.repository.pushedAt) : "No recent push"}</strong></span><span>{activity.contributors.slice(0, 4).map((contributor) => contributor.login).join(" · ") || "No contributors returned"}</span></div>
  </section>;
}

function LiveMetric({ Icon, value, label }: { Icon: typeof GitCommitHorizontal; value: string; label: string }) {
  return <article className="rounded-lg border border-border bg-background/35 p-4"><Icon className="size-4 text-primary" /><p className="mt-5 text-2xl font-semibold tracking-tight">{value}</p><p className="mt-1 text-xs text-muted-foreground">{label}</p></article>;
}

function LiveList({ title, items, empty }: { title: string; items: { title: string; meta: string; href: string }[]; empty: string }) {
  return <article className="rounded-lg border border-border bg-background/35 p-4"><h3 className="text-sm font-medium">{title}</h3><div className="mt-3 divide-y divide-border">{items.length === 0 ? <p className="py-4 text-sm text-muted-foreground">{empty}</p> : items.map((item) => <a key={item.href} href={item.href} target="_blank" rel="noreferrer" className="block py-3 first:pt-0 transition-colors hover:text-primary"><p className="truncate text-sm font-medium">{item.title}</p><p className="mt-1 truncate text-xs text-muted-foreground">{item.meta}</p></a>)}</div></article>;
}
