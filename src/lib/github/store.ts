import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { decryptGithubToken, encryptGithubToken } from "./crypto";
import { GithubIntegrationError } from "./errors";
import type { GithubViewer } from "./client";
import type {
  GithubConnectedRepository,
  GithubConnectionStatus,
  GithubRepository,
} from "./types";

type GithubConnectionRow = {
  id: string;
  user_id: string;
  github_user_id: number;
  github_login: string;
  avatar_url: string | null;
  encrypted_access_token: string;
  scopes: string[];
  reauth_required: boolean;
  connected_at: string;
};

type GithubProjectRepositoryRow = {
  project_key: string;
  repository_id: number;
  repository_name: string;
  repository_full_name: string;
  repository_owner: string;
  description: string | null;
  is_private: boolean;
  visibility: "public" | "private" | "internal";
  primary_language: string | null;
  default_branch: string;
  updated_at_github: string;
  pushed_at_github: string | null;
  html_url: string;
  stars_count: number;
  avatar_url: string | null;
  connected_at: string;
};

function storageError(
  error: {
    code?: string;
    status?: number;
    message?: string;
    details?: string;
    hint?: string;
  } | null,
  operation = "GitHub connection storage",
) {
  const code = error?.code;
  const providerMessage = error?.message;
  console.error("[github] storage failed", {
    operation,
    code,
    status: error?.status,
    message: providerMessage,
    details: error?.details,
    hint: error?.hint,
  });
  if (code === "42P01" || code === "PGRST205" || code === "PGRST204" || code === "42703")
    return new GithubIntegrationError(
      "github_migration_missing",
      `Database schema is incomplete while ${operation.toLowerCase()}. Apply 20260718_github_connections.sql, 20260720_demo_auth_users.sql, and 20260721_github_storage_hardening.sql, then retry.`,
      503,
    );
  if (code === "401" || code === "403" || code === "PGRST301")
    return new GithubIntegrationError(
      "github_storage_auth_failed",
      `Supabase rejected the server storage credentials while ${operation.toLowerCase()}. Verify SUPABASE_SERVICE_ROLE_KEY belongs to the configured Supabase project.`,
      503,
    );
  if (code === "42501")
    return new GithubIntegrationError(
      "github_storage_permission_denied",
      "Database permission denied. Verify SUPABASE_SERVICE_ROLE_KEY is configured for the server and has access to the GitHub tables.",
      503,
    );
  if (code === "23503")
    return new GithubIntegrationError(
      "github_auth_migration_missing",
      "The demo auth migration is missing. Apply 20260720_demo_auth_users.sql so the authenticated workspace user can own GitHub connections.",
      503,
    );
  return new GithubIntegrationError(
    "github_storage_unavailable",
    `Database unavailable while ${operation.toLowerCase()}${code ? ` (Supabase ${code})` : ""}. Verify SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, and the GitHub migrations.`,
    503,
  );
}

function adminClient(operation = "initializing the Supabase server client") {
  try {
    return createAdminClient();
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Supabase server configuration is missing.";
    console.error("[github] storage client initialization failed", {
      operation,
      message,
    });
    throw new GithubIntegrationError(
      "github_storage_not_configured",
      `Database unavailable while ${operation.toLowerCase()}. ${message} Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in the server environment.`,
      503,
    );
  }
}

function toConnectedRepository(
  row: GithubProjectRepositoryRow,
): GithubConnectedRepository {
  return {
    id: row.repository_id,
    name: row.repository_name,
    fullName: row.repository_full_name,
    owner: row.repository_owner,
    description: row.description,
    private: row.is_private,
    visibility: row.visibility,
    language: row.primary_language,
    defaultBranch: row.default_branch,
    updatedAt: row.updated_at_github,
    pushedAt: row.pushed_at_github,
    htmlUrl: row.html_url,
    stars: row.stars_count,
    avatarUrl: row.avatar_url,
    projectKey: row.project_key,
    connectedAt: row.connected_at,
  };
}

export async function getGithubConnection(
  userId: string,
): Promise<GithubConnectionRow | null> {
  const { data, error } = await adminClient("loading the GitHub connection")
    .from("github_connections")
    .select(
      "id,user_id,github_user_id,github_login,avatar_url,encrypted_access_token,scopes,reauth_required,connected_at",
    )
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw storageError(error, "loading the GitHub connection");
  return data as GithubConnectionRow | null;
}

export async function checkGithubStorage() {
  const admin = adminClient("checking GitHub storage tables");
  const requiredSchema = [
    ["logfound_users", "id,username,display_name"],
    ["github_connections", "id,user_id,encrypted_access_token,scopes,reauth_required"],
    ["github_project_repositories", "id,user_id,connection_id,project_key,repository_id"],
  ] as const;
  for (const [table, columns] of requiredSchema) {
    const { error } = await admin.from(table).select(columns).limit(0);
    if (error) throw storageError(error, `checking the ${table} table`);
  }
}

export async function saveGithubConnection(
  userId: string,
  viewer: GithubViewer,
  accessToken: string,
  scopes: string[],
) {
  const { data, error } = await adminClient("saving the GitHub connection")
    .from("github_connections")
    .upsert(
      {
        user_id: userId,
        github_user_id: viewer.id,
        github_login: viewer.login,
        avatar_url: viewer.avatarUrl,
        encrypted_access_token: encryptGithubToken(accessToken),
        scopes,
        reauth_required: false,
        connected_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" },
    )
    .select(
      "id,user_id,github_user_id,github_login,avatar_url,encrypted_access_token,scopes,reauth_required,connected_at",
    )
    .single();
  if (error || !data) throw storageError(error, "saving the GitHub connection");
  return data as GithubConnectionRow;
}

export async function getGithubAccessToken(userId: string) {
  const connection = await getGithubConnection(userId);
  if (!connection)
    throw new GithubIntegrationError(
      "github_not_connected",
      "Connect GitHub before loading repository data.",
      404,
    );
  if (connection.reauth_required)
    throw new GithubIntegrationError(
      "github_reconnect_required",
      "Your GitHub connection needs to be reconnected.",
      401,
    );
  return decryptGithubToken(connection.encrypted_access_token);
}

export async function markGithubConnectionForReauth(userId: string) {
  const { error } = await adminClient("marking the GitHub connection for reauthorization")
    .from("github_connections")
    .update({ reauth_required: true, updated_at: new Date().toISOString() })
    .eq("user_id", userId);
  if (error)
    console.error("[github] could not mark connection for reauthorization", {
      code: error.code,
    });
}

export async function removeGithubConnection(userId: string) {
  const { error } = await adminClient("removing the GitHub connection")
    .from("github_connections")
    .delete()
    .eq("user_id", userId);
  if (error) throw storageError(error, "removing the GitHub connection");
}

export async function listConnectedGithubRepositories(
  userId: string,
  projectKey?: string,
) {
  let query = adminClient("loading connected repositories")
    .from("github_project_repositories")
    .select(
      "project_key,repository_id,repository_name,repository_full_name,repository_owner,description,is_private,visibility,primary_language,default_branch,updated_at_github,pushed_at_github,html_url,stars_count,avatar_url,connected_at",
    )
    .eq("user_id", userId)
    .order("updated_at_github", { ascending: false });
  if (projectKey) query = query.eq("project_key", projectKey);
  const { data, error } = await query;
  if (error) throw storageError(error, "loading connected repositories");
  return ((data || []) as GithubProjectRepositoryRow[]).map(
    toConnectedRepository,
  );
}

export async function githubConnectionStatus(
  userId: string,
): Promise<GithubConnectionStatus> {
  await checkGithubStorage();
  const connection = await getGithubConnection(userId);
  if (!connection) return { connected: false, repositories: [] };
  const repositories = await listConnectedGithubRepositories(userId);
  return {
    connected: !connection.reauth_required,
    reauthRequired: connection.reauth_required,
    login: connection.github_login,
    avatarUrl: connection.avatar_url,
    connectedAt: connection.connected_at,
    scopes: connection.scopes,
    repositories,
  };
}

function validProjectKey(projectKey: string) {
  if (!/^[a-z0-9][a-z0-9-]{0,119}$/i.test(projectKey)) {
    throw new GithubIntegrationError(
      "invalid_project",
      "Choose a valid project before connecting repositories.",
      400,
    );
  }
  return projectKey;
}

export async function replaceProjectRepositories(
  userId: string,
  projectKey: string,
  repositories: GithubRepository[],
) {
  const connection = await getGithubConnection(userId);
  if (!connection)
    throw new GithubIntegrationError(
      "github_not_connected",
      "Connect GitHub before selecting repositories.",
      404,
    );
  const safeProjectKey = validProjectKey(projectKey);
  const admin = adminClient("saving project repositories");

  if (repositories.length === 0) {
    const { error } = await admin
      .from("github_project_repositories")
      .delete()
      .eq("user_id", userId)
      .eq("project_key", safeProjectKey);
    if (error) throw storageError(error, "removing project repositories");
    return [];
  }

  const timestamp = new Date().toISOString();
  const rows = repositories.map((repository) => ({
    user_id: userId,
    connection_id: connection.id,
    project_key: safeProjectKey,
    repository_id: repository.id,
    repository_full_name: repository.fullName,
    repository_name: repository.name,
    repository_owner: repository.owner,
    description: repository.description,
    is_private: repository.private,
    visibility: repository.visibility,
    primary_language: repository.language,
    default_branch: repository.defaultBranch,
    updated_at_github: repository.updatedAt,
    pushed_at_github: repository.pushedAt,
    html_url: repository.htmlUrl,
    stars_count: repository.stars,
    avatar_url: repository.avatarUrl,
    updated_at: timestamp,
  }));
  const { error: upsertError } = await admin
    .from("github_project_repositories")
    .upsert(rows, { onConflict: "user_id,project_key,repository_id" });
  if (upsertError) throw storageError(upsertError, "saving project repositories");

  const selectedIds = repositories.map((repository) => repository.id).join(",");
  const { error: removeError } = await admin
    .from("github_project_repositories")
    .delete()
    .eq("user_id", userId)
    .eq("project_key", safeProjectKey)
    .not("repository_id", "in", `(${selectedIds})`);
  if (removeError) throw storageError(removeError, "removing unselected project repositories");
  return listConnectedGithubRepositories(userId, safeProjectKey);
}

export async function assertGithubRepositoryConnected(
  userId: string,
  fullName: string,
) {
  const { data, error } = await adminClient("checking the connected repository")
    .from("github_project_repositories")
    .select("repository_id")
    .eq("user_id", userId)
    .eq("repository_full_name", fullName)
    .maybeSingle();
  if (error) throw storageError(error, "checking the connected repository");
  if (!data)
    throw new GithubIntegrationError(
      "repository_not_connected",
      "Connect this repository to a Logfound project before loading its activity.",
      404,
    );
}

export async function withGithubAccessToken<T>(
  userId: string,
  operation: (accessToken: string) => Promise<T>,
) {
  const accessToken = await getGithubAccessToken(userId);
  try {
    return await operation(accessToken);
  } catch (error) {
    if (
      error instanceof GithubIntegrationError &&
      error.code === "github_reconnect_required"
    ) {
      await markGithubConnectionForReauth(userId);
    }
    throw error;
  }
}
