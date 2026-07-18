import "server-only";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { GithubIntegrationError } from "./errors";

export type WorkspaceSession = { user: User; supabase: SupabaseClient };

export async function requireWorkspaceSession(): Promise<WorkspaceSession> {
  let supabase: SupabaseClient;
  try {
    supabase = await createClient();
  } catch {
    throw new GithubIntegrationError("supabase_not_configured", "Sign in to a configured Logfound workspace before connecting GitHub.", 503);
  }

  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    throw new GithubIntegrationError("sign_in_required", "Sign in to Logfound before connecting GitHub.", 401);
  }

  return { user, supabase };
}
