import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { isUuid, userIdForUsername, type AuthUser } from "./session";

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
  // Demo sessions created by older builds may contain a username or a
  // provider subject in `id`. Never send that arbitrary value to a UUID
  // column; derive the stable demo identity instead.
  const normalizedUser = isUuid(user.id)
    ? user
    : { ...user, id: await userIdForUsername(user.username) };
  if (normalizedUser.id !== user.id) {
    console.warn("[auth] normalized a non-UUID workspace subject before Supabase write", {
      operation: "upsert logfound_users",
      source: "username-derived UUID",
    });
  }
  if (!isUuid(normalizedUser.id)) {
    const failure = storageFailure(
      "validating the workspace UUID",
      new Error("The workspace identity generator returned a non-UUID value."),
    );
    if (options.required) throw failure;
    return normalizedUser;
  }
  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("logfound_users")
      .upsert(
        { id: normalizedUser.id, username: normalizedUser.username, display_name: normalizedUser.name },
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
        if (!lookupError && existing) return toAuthUser(existing as WorkspaceUserRow, normalizedUser);
        if (lookupError) {
          const failure = storageFailure("loading an existing workspace user", lookupError);
          if (options.required) throw failure;
          return normalizedUser;
        }
      }
      const failure = storageFailure("upserting logfound_users", error);
      if (options.required) throw failure;
      return normalizedUser;
    }
    if (data) return toAuthUser(data as WorkspaceUserRow, normalizedUser);
    const failure = storageFailure("reading the upserted workspace user", new Error("Supabase returned no workspace user row."));
    if (options.required) throw failure;
    return normalizedUser;
  } catch (error) {
    const failure = error instanceof WorkspaceUserStorageError ? error : storageFailure("initializing workspace-user storage", error);
    if (options.required) throw failure;
    return normalizedUser;
  }
}
