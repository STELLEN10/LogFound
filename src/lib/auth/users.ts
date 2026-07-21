import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import type { AuthUser } from "./session";

type SupabaseError = {
  code?: string;
  status?: number;
  message?: string;
  details?: string;
  hint?: string;
};

type WorkspaceUserRow = {
  id: string;
  username: string;
  display_name: string;
};

export class WorkspaceUserStorageError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly details?: string,
    public readonly hint?: string,
  ) {
    super(message);
    this.name = "WorkspaceUserStorageError";
  }
}

function storageFailure(operation: string, error: unknown) {
  const supabaseError =
    typeof error === "object" && error !== null ? (error as SupabaseError) : undefined;
  const message = error instanceof Error ? error.message : supabaseError?.message || "Unknown Supabase error.";
  console.error("[auth] workspace user storage failed", {
    operation,
    code: supabaseError?.code,
    status: supabaseError?.status,
    message,
    details: supabaseError?.details,
    hint: supabaseError?.hint,
    stack: error instanceof Error ? error.stack : undefined,
  });
  return new WorkspaceUserStorageError(
    `Supabase workspace-user synchronization failed while ${operation.toLowerCase()}${supabaseError?.code ? ` (Supabase ${supabaseError.code})` : ""}: ${message}`,
    supabaseError?.code,
    supabaseError?.details,
    supabaseError?.hint,
  );
}

function toAuthUser(row: WorkspaceUserRow, fallback: AuthUser): AuthUser {
  return {
    id: row.id,
    username: row.username || fallback.username,
    name: row.display_name || fallback.name,
  };
}

export async function ensureWorkspaceUser(user: AuthUser, options: { required?: boolean } = {}): Promise<AuthUser> {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("logfound_users")
      .upsert(
        { id: user.id, username: user.username, display_name: user.name },
        { onConflict: "id" },
      )
      .select("id,username,display_name")
      .maybeSingle();
    if (error) {
      // A legacy Supabase user may already own this username under another id.
      // Load that canonical workspace identity instead of bypassing the FK.
      if (error.code === "23505") {
        const { data: existing, error: lookupError } = await admin
          .from("logfound_users")
          .select("id,username,display_name")
          .eq("username", user.username)
          .maybeSingle();
        if (!lookupError && existing) return toAuthUser(existing as WorkspaceUserRow, user);
        if (lookupError) {
          const failure = storageFailure("loading an existing workspace user", lookupError);
          if (options.required) throw failure;
          return user;
        }
      }
      const failure = storageFailure("upserting logfound_users", error);
      if (options.required) throw failure;
      return user;
    }
    if (data) return toAuthUser(data as WorkspaceUserRow, user);
    const failure = storageFailure("reading the upserted workspace user", new Error("Supabase returned no workspace user row."));
    if (options.required) throw failure;
    return user;
  } catch (error) {
    const failure = error instanceof WorkspaceUserStorageError ? error : storageFailure("initializing workspace-user storage", error);
    if (options.required) throw failure;
    return user;
  }
}
