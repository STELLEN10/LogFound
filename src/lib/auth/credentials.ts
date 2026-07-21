import bcrypt from "bcryptjs";
import { createWorkspaceUuid, type AuthUser } from "./session";

const DEFAULT_USERNAME = "founder";
const DEFAULT_DEMO_PASSWORD = "logfound-demo";

function configuredUsername() { return (process.env.LOGFOUND_DEMO_USERNAME?.trim() || DEFAULT_USERNAME).toLowerCase(); }

function timingSafePasswordMatch(input: string, expected: string) {
  const encoder = new TextEncoder();
  const inputBytes = encoder.encode(input);
  const expectedBytes = encoder.encode(expected);
  if (inputBytes.length !== expectedBytes.length) return false;
  let result = 0;
  for (let index = 0; index < inputBytes.length; index += 1) result |= inputBytes[index] ^ expectedBytes[index];
  return result === 0;
}

export async function authenticateCredentials(usernameInput: string, password: string): Promise<AuthUser | null> {
  const username = usernameInput.trim().toLowerCase();
  if (!username || username.length > 64 || !/^[a-z0-9][a-z0-9._-]*$/.test(username) || password.length < 1 || password.length > 256) return null;
  if (username !== configuredUsername()) return null;

  const passwordHash = process.env.LOGFOUND_DEMO_PASSWORD_HASH?.trim();
  const matches = passwordHash ? await bcrypt.compare(password, passwordHash) : timingSafePasswordMatch(password, process.env.LOGFOUND_DEMO_PASSWORD || (process.env.NODE_ENV === "production" ? "" : DEFAULT_DEMO_PASSWORD));
  if (!matches) return null;

  return { id: createWorkspaceUuid(), username, name: username === "founder" ? "Founder" : username };
}

export function demoCredentialHint() {
  if (process.env.NODE_ENV === "production") return undefined;
  return { username: configuredUsername(), password: process.env.LOGFOUND_DEMO_PASSWORD || DEFAULT_DEMO_PASSWORD };
}
