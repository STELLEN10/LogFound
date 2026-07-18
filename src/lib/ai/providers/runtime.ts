import { AiProviderError, AiTimeoutError } from "./errors";

export const AI_TIMEOUT_MS = 30_000;
const MAX_ATTEMPTS = 2;

export function withTimeout<T>(promise: Promise<T>, timeoutMs = AI_TIMEOUT_MS) {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new AiTimeoutError()), timeoutMs);
    promise.then((value) => { clearTimeout(timer); resolve(value); }, (error: unknown) => { clearTimeout(timer); reject(error); });
  });
}

export async function withRetry<T>(operation: () => Promise<T>, shouldRetry: (error: unknown) => boolean) {
  let lastError: unknown;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (attempt === MAX_ATTEMPTS || !shouldRetry(error)) throw error;
      await new Promise((resolve) => setTimeout(resolve, 250 * attempt));
    }
  }
  throw lastError instanceof Error ? lastError : new AiProviderError("provider_unavailable", "The AI service is temporarily unavailable.", 503);
}

export function retryableProviderError(error: unknown) {
  return error instanceof AiProviderError && (error.code === "rate_limited" || error.code === "provider_unavailable");
}
