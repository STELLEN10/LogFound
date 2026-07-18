import "server-only";
import { getAiProvider, getAiProviderConfig } from "./providers";
import { AiProviderError } from "./providers";

export { getAiProviderConfig } from "./providers";

export function getAiClient() {
  return getAiProvider();
}

export function getAiRuntime() {
  const config = getAiProviderConfig();
  return { ...config, displayName: config.name === "gemini" ? "Gemini" : "OpenAI" };
}

export function toSafeAiError(error: unknown) {
  if (error instanceof AiProviderError) return { code: error.code, message: error.message, status: error.status };
  if (error instanceof Error && (error.name === "AbortError" || error.name === "TimeoutError")) return { code: "timeout", message: "The AI request took too long. Please try again.", status: 504 };
  return { code: "network_error", message: "The AI service is temporarily unavailable.", status: 503 };
}
