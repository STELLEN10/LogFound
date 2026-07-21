import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import type { AuthUser } from "./session";

export async function ensureWorkspaceUser(user: AuthUser, options: { required?: boolean } = {}) {
  try {
    const { error } = await createAdminClient()
      .from("logfound_users")
      .upsert(
        { id: user.id, username: user.username, display_name: user.name },
        { onConflict: "id" },
      );
    if (error) {
      console.error("[auth] workspace user sync failed", { code: error.code });
      if (options.required) throw error;
    }
  } catch (error) {
    console.error("[auth] workspace user storage unavailable", {
      operation: "upsert logfound_users",
      code: typeof error === "object" && error && "code" in error ? error.code : undefined,
      message: error instanceof Error ? error.message : "unknown_error",
    });
    if (options.required) throw error;
  }
}
