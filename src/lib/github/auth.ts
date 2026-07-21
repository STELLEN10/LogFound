import "server-only";
import { cookies } from "next/headers";
import { AUTH_COOKIE_NAME, verifySessionToken, type AuthSession } from "@/lib/auth/session";
import { ensureWorkspaceUser, WorkspaceUserStorageError } from "@/lib/auth/users";
import { GithubIntegrationError } from "./errors";

export type WorkspaceSession = AuthSession;

export async function requireWorkspaceSession(): Promise<WorkspaceSession> {
  const session = await verifySessionToken((await cookies()).get(AUTH_COOKIE_NAME)?.value);
  if (!session) {
    throw new GithubIntegrationError("sign_in_required", "Sign in to Logfound before connecting GitHub.", 401);
  }
  try {
    const workspaceUser = await ensureWorkspaceUser(session.user, { required: true });
    return { ...session, user: workspaceUser };
  } catch (error) {
    const storageError = error instanceof WorkspaceUserStorageError ? error : undefined;
    const code = storageError?.code;
    const detail = storageError?.message || (error instanceof Error ? error.message : "Supabase workspace-user synchronization failed.");
    console.error("[github] workspace session initialization failed", {
      operation: "ensureWorkspaceUser",
      code,
      message: detail,
      details: storageError?.details,
      hint: storageError?.hint,
      stack: error instanceof Error ? error.stack : undefined,
    });
    if (code === "42P01" || code === "PGRST205" || code === "PGRST204" || code === "42703") {
      throw new GithubIntegrationError(
        "github_migration_missing",
        "Workspace-user storage schema is incomplete. Apply 20260720_demo_auth_users.sql and 20260721_github_storage_hardening.sql, then retry.",
        503,
      );
    }
    if (code === "401" || code === "403" || code === "PGRST301") {
      throw new GithubIntegrationError(
        "github_storage_auth_failed",
        "Supabase rejected the server storage credentials while preparing the workspace user. Verify SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY belong to the same project.",
        503,
      );
    }
    if (code === "42501") {
      throw new GithubIntegrationError(
        "github_storage_permission_denied",
        "Supabase denied the workspace-user write. Verify the Service Role key and table grants/RLS migration.",
        503,
      );
    }
    if (code === "23503") {
      throw new GithubIntegrationError(
        "github_auth_migration_missing",
        "Workspace-user foreign-key storage is incomplete. Apply 20260720_demo_auth_users.sql, then retry.",
        503,
      );
    }
    if (error instanceof Error && error.message.includes("server storage is not configured")) {
      throw new GithubIntegrationError("github_storage_not_configured", detail, 503);
    }
    throw new GithubIntegrationError(
      "github_storage_unavailable",
      `Database unavailable while preparing the workspace user. ${detail}`,
      503,
    );
  }
}
