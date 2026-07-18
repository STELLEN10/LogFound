import "server-only";
import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";
import { GithubIntegrationError } from "./errors";

const ALGORITHM = "aes-256-gcm";

function encryptionKey() {
  const encoded = process.env.GITHUB_TOKEN_ENCRYPTION_KEY?.trim();
  if (!encoded) {
    throw new GithubIntegrationError("github_storage_not_configured", "GitHub token encryption is not configured. Add GITHUB_TOKEN_ENCRYPTION_KEY to the server environment.", 503);
  }

  const key = Buffer.from(encoded, "base64");
  if (key.length !== 32) {
    throw new GithubIntegrationError("github_storage_not_configured", "GITHUB_TOKEN_ENCRYPTION_KEY must be a base64-encoded 32-byte key.", 503);
  }
  return key;
}

export function encryptGithubToken(token: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGORITHM, encryptionKey(), iv);
  const ciphertext = Buffer.concat([cipher.update(token, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `v1.${iv.toString("base64url")}.${tag.toString("base64url")}.${ciphertext.toString("base64url")}`;
}

export function decryptGithubToken(payload: string) {
  const [version, ivValue, tagValue, ciphertextValue] = payload.split(".");
  if (version !== "v1" || !ivValue || !tagValue || !ciphertextValue) {
    throw new GithubIntegrationError("github_connection_invalid", "Your GitHub connection needs to be reconnected.", 401);
  }

  const key = encryptionKey();
  try {
    const decipher = createDecipheriv(ALGORITHM, key, Buffer.from(ivValue, "base64url"));
    decipher.setAuthTag(Buffer.from(tagValue, "base64url"));
    return Buffer.concat([decipher.update(Buffer.from(ciphertextValue, "base64url")), decipher.final()]).toString("utf8");
  } catch {
    throw new GithubIntegrationError("github_connection_invalid", "Your GitHub connection needs to be reconnected.", 401);
  }
}
