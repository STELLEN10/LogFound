"use client";

import {
  Check,
  CircleAlert,
  Github,
  Link2,
  LoaderCircle,
  RefreshCw,
  Search,
  Unplug,
  X,
} from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { LogfoundLogo } from "@/components/brand/logfound-logo";
import { useCurrentTime } from "@/hooks/use-current-time";
import type {
  GithubConnectionStatus,
  GithubRepository,
} from "@/lib/github/types";
import { cn } from "@/lib/utils";

const PROJECT_KEY = "logfound-activation";
const PROJECT_NAME = "Logfound activation";
const emptyStatus: GithubConnectionStatus = {
  connected: false,
  repositories: [],
};

type Notice = { tone: "success" | "error"; message: string } | null;
type RepositoriesResponse = { repositories: GithubRepository[] };

function callbackMessage(reason: string | null) {
  switch (reason) {
    case "github_not_configured":
      return "OAuth callback failed. Verify GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, and NEXTAUTH_URL in Vercel.";
    case "github_storage_not_configured":
      return "Database unavailable. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in Vercel.";
    case "github_migration_missing":
      return "Migration not applied. Apply 20260718_github_connections.sql, 20260720_demo_auth_users.sql, and 20260721_github_storage_hardening.sql in Supabase.";
    case "github_auth_migration_missing":
      return "Migration not applied. Apply 20260720_demo_auth_users.sql and 20260721_github_storage_hardening.sql so demo sessions can own GitHub connections.";
    case "github_storage_permission_denied":
      return "Database permission denied. Verify the Supabase service-role key in Vercel.";
    case "github_storage_auth_failed":
      return "Supabase rejected the server storage credentials. Verify SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY belong to the same project in Vercel.";
    case "github_storage_save_failed":
      return "Database unavailable while saving the GitHub connection. Check the Vercel Supabase credentials and confirm the GitHub migrations are applied.";
    case "github_storage_not_configured":
      return "Database configuration is incomplete. Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to the Vercel server environment.";
    case "github_storage_unavailable":
      return "Database unavailable. Verify Supabase configuration and the GitHub migrations.";
    case "github_connection_invalid":
      return "Missing GitHub token. Reconnect GitHub to issue a fresh token.";
    case "invalid_oauth_state":
      return "OAuth callback failed. The security cookie expired or was not returned; start GitHub authorization again.";
    case "github_authorization_declined":
      return "GitHub authorization was cancelled. No connection was created.";
    default:
      return "OAuth callback failed. Check the server logs and GitHub OAuth callback URL, then try again.";
  }
}

function messageFrom(response: unknown, fallback: string) {
  if (typeof response === "object" && response && "error" in response) {
    const error = response.error;
    if (
      typeof error === "object" &&
      error &&
      "message" in error &&
      typeof error.message === "string"
    )
      return error.message;
  }
  return fallback;
}

async function readJson<T>(response: Response): Promise<T> {
  const payload: unknown = await response.json().catch(() => null);
  if (!response.ok)
    throw new Error(
      messageFrom(payload, "GitHub could not complete this request."),
    );
  return payload as T;
}

export function GithubConnectionSettings() {
  const [status, setStatus] = useState<GithubConnectionStatus | null>(null);
  const [notice, setNotice] = useState<Notice>(null);
  const [connecting, setConnecting] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [repositories, setRepositories] = useState<GithubRepository[]>([]);
  const [loadingRepositories, setLoadingRepositories] = useState(false);
  const [savingSelection, setSavingSelection] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [query, setQuery] = useState("");

  const loadStatus = useCallback(async () => {
    try {
      const next = await readJson<GithubConnectionStatus>(
        await fetch("/api/github/status", { cache: "no-store" }),
      );
      setStatus(next);
    } catch (error) {
      setStatus(emptyStatus);
      setNotice({
        tone: "error",
        message:
          error instanceof Error
            ? error.message
            : "GitHub connection status could not be loaded.",
      });
    }
  }, []);

  useEffect(() => {
    void loadStatus();
  }, [loadStatus]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const outcome = params.get("github");
    if (!outcome) return;
    const reason = params.get("github_reason");
    setNotice(
      outcome === "connected"
        ? {
            tone: "success",
            message:
              "GitHub is connected securely. Choose the repositories that belong in this project.",
          }
        : { tone: "error", message: callbackMessage(reason) },
    );
    window.history.replaceState({}, "", window.location.pathname);
    void loadStatus();
  }, [loadStatus]);

  const beginConnection = async () => {
    setConnecting(true);
    setNotice(null);
    try {
      const result = await readJson<{ authorizationUrl: string }>(
        await fetch("/api/github/oauth/start", { method: "POST" }),
      );
      window.location.assign(result.authorizationUrl);
    } catch (error) {
      setNotice({
        tone: "error",
        message:
          error instanceof Error
            ? error.message
            : "GitHub authorization could not be started.",
      });
      setConnecting(false);
    }
  };

  const openPicker = async () => {
    setPickerOpen(true);
    setQuery("");
    setSelectedIds(
      new Set(
        (status?.repositories || [])
          .filter((repository) => repository.projectKey === PROJECT_KEY)
          .map((repository) => repository.id),
      ),
    );
    setLoadingRepositories(true);
    setNotice(null);
    try {
      const result = await readJson<RepositoriesResponse>(
        await fetch("/api/github/repositories?per_page=100", {
          cache: "no-store",
        }),
      );
      setRepositories(result.repositories);
    } catch (error) {
      setNotice({
        tone: "error",
        message:
          error instanceof Error
            ? error.message
            : "Repositories could not be loaded.",
      });
      setPickerOpen(false);
    } finally {
      setLoadingRepositories(false);
    }
  };

  const saveRepositories = async () => {
    setSavingSelection(true);
    try {
      const result = await readJson<{
        repositories: GithubConnectionStatus["repositories"];
      }>(
        await fetch(`/api/github/projects/${PROJECT_KEY}/repositories`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ repositoryIds: [...selectedIds] }),
        }),
      );
      setStatus((current) =>
        current ? { ...current, repositories: result.repositories } : current,
      );
      setPickerOpen(false);
      setNotice({
        tone: "success",
        message: `${result.repositories.length} ${result.repositories.length === 1 ? "repository is" : "repositories are"} now connected to ${PROJECT_NAME}.`,
      });
    } catch (error) {
      setNotice({
        tone: "error",
        message:
          error instanceof Error
            ? error.message
            : "Repository selection could not be saved.",
      });
    } finally {
      setSavingSelection(false);
    }
  };

  const disconnect = async () => {
    setDisconnecting(true);
    setNotice(null);
    try {
      await readJson<{ ok: true }>(
        await fetch("/api/github/connection", { method: "DELETE" }),
      );
      setStatus(emptyStatus);
      setNotice({
        tone: "success",
        message:
          "GitHub was disconnected and the encrypted connection record was removed.",
      });
    } catch (error) {
      setNotice({
        tone: "error",
        message:
          error instanceof Error
            ? error.message
            : "GitHub could not be disconnected.",
      });
    } finally {
      setDisconnecting(false);
    }
  };

  const connectedCount =
    status?.repositories.filter(
      (repository) => repository.projectKey === PROJECT_KEY,
    ).length || 0;
  const isConnected = Boolean(status?.connected);

  return (
    <section
      className="mt-6 animate-rise animation-delay-3 rounded-xl border border-border bg-card/55 p-6"
      aria-labelledby="github-connection-title"
    >
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-xl">
          <p className="flex items-center gap-2 text-sm font-medium">
            <LogfoundLogo compact />
            <Github className="size-4 text-primary" />
            GitHub connection
          </p>
          <h2
            id="github-connection-title"
            className="mt-3 text-xl font-semibold tracking-tight"
          >
            Bring engineering context into the room.
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Authorize GitHub once, then choose the repositories Logfound can use
            for project history, engineering memory, and agent context.
            Credentials remain server-side and encrypted at rest.
          </p>
        </div>
        <span
          className={cn(
            "inline-flex w-fit items-center gap-2 rounded-full border px-2.5 py-1 text-xs",
            isConnected
              ? "border-emerald-300/25 bg-emerald-300/[0.08] text-emerald-300"
              : status?.reauthRequired
                ? "border-amber-300/25 bg-amber-300/[0.08] text-amber-200"
                : "border-border bg-background/50 text-muted-foreground",
          )}
        >
          <span
            className={cn(
              "size-1.5 rounded-full",
              isConnected
                ? "bg-emerald-300"
                : status?.reauthRequired
                  ? "bg-amber-200"
                  : "bg-muted-foreground",
            )}
          />
          {isConnected
            ? "Connected"
            : status?.reauthRequired
              ? "Reconnect required"
              : "Not connected"}
        </span>
      </div>

      {notice && (
        <div
          className={cn(
            "mt-5 flex items-start gap-3 rounded-lg border p-4 text-sm",
            notice.tone === "success"
              ? "animate-success border-emerald-300/25 bg-emerald-300/[0.06]"
              : "border-destructive/30 bg-destructive/10",
          )}
          role="status"
          aria-live="polite"
        >
          {notice.tone === "success" ? (
            <Check className="mt-0.5 size-4 shrink-0 text-emerald-300" />
          ) : (
            <CircleAlert className="mt-0.5 size-4 shrink-0 text-destructive-foreground" />
          )}
          <p className="leading-6 text-muted-foreground">{notice.message}</p>
        </div>
      )}

      {isConnected ? (
        <div className="mt-6 rounded-lg border border-border bg-background/35 p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              {status?.avatarUrl ? (
                <Image
                  src={status.avatarUrl}
                  alt=""
                  width={36}
                  height={36}
                  className="size-9 rounded-full border border-border"
                />
              ) : (
                <span className="flex size-9 items-center justify-center rounded-full border border-border bg-secondary">
                  <Github className="size-4 text-primary" />
                </span>
              )}
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">
                  Connected as {status?.login}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {connectedCount === 0
                    ? "No repositories are connected to the active project yet."
                    : `${connectedCount} ${connectedCount === 1 ? "repository" : "repositories"} connected to ${PROJECT_NAME}.`}
                </p>
              </div>
            </div>
            <div className="flex shrink-0 gap-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => void openPicker()}
              >
                <Search className="mr-2 size-3.5" />
                Manage repositories
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => void disconnect()}
                disabled={disconnecting}
              >
                {disconnecting ? (
                  <LoaderCircle className="size-3.5 animate-spin" />
                ) : (
                  <>
                    <Unplug className="mr-2 size-3.5" />
                    Disconnect
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-6 flex flex-col gap-4 rounded-lg border border-border bg-background/35 p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-xl text-sm leading-6 text-muted-foreground">
            {status?.reauthRequired
              ? "GitHub rejected the previous token. Reconnect to refresh access; no token is ever sent to this browser."
              : "Use your GitHub account to grant Logfound access to the repositories you choose."}
          </p>
          <Button onClick={() => void beginConnection()} disabled={connecting}>
            {connecting ? (
              <>
                <LoaderCircle className="mr-2 size-4 animate-spin" />
                Opening GitHub
              </>
            ) : (
              <>
                <Link2 className="mr-2 size-4" />
                {status?.reauthRequired ? "Reconnect GitHub" : "Connect GitHub"}
              </>
            )}
          </Button>
        </div>
      )}

      {pickerOpen && (
        <RepositoryPicker
          repositories={repositories}
          query={query}
          onQueryChange={setQuery}
          selectedIds={selectedIds}
          toggle={(id) =>
            setSelectedIds((current) => {
              const next = new Set(current);
              if (next.has(id)) next.delete(id);
              else next.add(id);
              return next;
            })
          }
          loading={loadingRepositories}
          saving={savingSelection}
          onClose={() => !savingSelection && setPickerOpen(false)}
          onSave={() => void saveRepositories()}
        />
      )}
    </section>
  );
}

function RepositoryPicker({
  repositories,
  query,
  onQueryChange,
  selectedIds,
  toggle,
  loading,
  saving,
  onClose,
  onSave,
}: {
  repositories: GithubRepository[];
  query: string;
  onQueryChange: (value: string) => void;
  selectedIds: Set<number>;
  toggle: (id: number) => void;
  loading: boolean;
  saving: boolean;
  onClose: () => void;
  onSave: () => void;
}) {
  const { relative } = useCurrentTime();
  const filtered = useMemo(() => {
    const term = query.toLowerCase().trim();
    return term
      ? repositories.filter((repository) =>
          `${repository.fullName} ${repository.description || ""} ${repository.language || ""}`
            .toLowerCase()
            .includes(term),
        )
      : repositories;
  }, [query, repositories]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-background/80 p-4 pt-[8vh] backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-labelledby="github-repository-picker-title"
      onMouseDown={onClose}
    >
      <section
        className="w-full max-w-3xl overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-border p-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              Repository connection
            </p>
            <h2
              id="github-repository-picker-title"
              className="mt-2 text-xl font-semibold tracking-tight"
            >
              Choose repositories for {PROJECT_NAME}.
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Select one or more repositories. Logfound will read activity
              through its secure server connection.
            </p>
          </div>
          <button
            className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            onClick={onClose}
            aria-label="Close repository picker"
            disabled={saving}
          >
            <X className="size-4" />
          </button>
        </div>
        <div className="border-b border-border p-4">
          <label className="flex items-center gap-3 rounded-lg border border-border bg-background/50 px-3 py-2.5 focus-within:ring-2 focus-within:ring-ring">
            <Search className="size-4 text-primary" />
            <span className="sr-only">Search repositories</span>
            <input
              autoFocus
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              placeholder="Search repositories by name, language, or description…"
            />
          </label>
        </div>
        <div className="max-h-[48vh] overflow-y-auto p-3" aria-busy={loading}>
          {loading ? (
            <div className="flex min-h-48 items-center justify-center gap-3 text-sm text-muted-foreground">
              <LoaderCircle className="size-4 animate-spin text-primary" />
              Loading repositories…
            </div>
          ) : filtered.length === 0 ? (
            <div className="px-4 py-14 text-center">
              <p className="text-sm font-medium">No repositories found.</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Try a different search or check the GitHub account permissions.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map((repository) => {
                const selected = selectedIds.has(repository.id);
                return (
                  <button
                    key={repository.id}
                    onClick={() => toggle(repository.id)}
                    className={cn(
                      "flex w-full items-start gap-3 rounded-xl border p-4 text-left transition-all",
                      selected
                        ? "border-primary/50 bg-primary/[0.08]"
                        : "border-border bg-background/30 hover:border-primary/30 hover:bg-accent/50",
                    )}
                    aria-pressed={selected}
                  >
                    <span
                      className={cn(
                        "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded border",
                        selected
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-background",
                      )}
                    >
                      {selected && <Check className="size-3.5" />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="font-medium">
                          {repository.fullName}
                        </span>
                        <span className="rounded border border-border px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
                          {repository.visibility}
                        </span>
                        {repository.language && (
                          <span className="text-xs text-primary">
                            {repository.language}
                          </span>
                        )}
                      </span>
                      <span className="mt-1 block truncate text-sm text-muted-foreground">
                        {repository.description || "No description provided."}
                      </span>
                    </span>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      Updated {relative(repository.updatedAt)}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
        <div className="flex flex-col gap-3 border-t border-border p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            {selectedIds.size}{" "}
            {selectedIds.size === 1 ? "repository" : "repositories"} selected
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={onSave} disabled={loading || saving}>
              {saving ? (
                <>
                  <LoaderCircle className="mr-2 size-4 animate-spin" />
                  Saving selection
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 size-4" />
                  Connect repositories
                </>
              )}
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
