import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import type { AuthUser } from "./session";

export async function ensureWorkspaceUser(user: AuthUser) {
  try {
    const { error } = await createAdminClient().from("logfound_users").upsert({ id: user.id, username: user.username, display_name: user.name }, { onConflict: "id" });
    if (error) console.error("[auth] workspace user sync failed", { code: error.code });
  } catch {
    // Demo authentication is independent from Supabase; GitHub persistence reports its own configuration error.
  }
}
