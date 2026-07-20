import "server-only";
import { cookies } from "next/headers";
import { AUTH_COOKIE_NAME, verifySessionToken, type AuthSession } from "@/lib/auth/session";
import { ensureWorkspaceUser } from "@/lib/auth/users";
import { GithubIntegrationError } from "./errors";

export type WorkspaceSession = AuthSession;

export async function requireWorkspaceSession(): Promise<WorkspaceSession> {
  const session = await verifySessionToken((await cookies()).get(AUTH_COOKIE_NAME)?.value);
  if (!session) {
    throw new GithubIntegrationError("sign_in_required", "Sign in to Logfound before connecting GitHub.", 401);
  }
  await ensureWorkspaceUser(session.user);
  return session;
}
