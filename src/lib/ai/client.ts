import "server-only";
import { getAiProvider, getAiProviderConfig } from "./providers";
import { AiProviderError } from "./providers";

export { getAiProviderConfig } from "./providers";

export function getAiClient() {
  return getAiProvider();
}

export function getAiRuntime() {
  const config = getAiProviderConfig();
  return { ...config, displayName: config.name === "groq" ? "Groq" : "OpenAI" };
}

function isRecord(value: unknown): value is Record<string, unknown> { return typeof value === "object" && value !== null; }
function parseDebugBody(value: unknown) {
  if (value === undefined || value === null) return undefined;
  if (typeof value !== "string") return value;
  try { return JSON.parse(value) as unknown; } catch { return value; }
}
function logProviderError(error: unknown) {
  const provider = process.env.AI_PROVIDER?.trim().toLowerCase() || "groq";
  const source = error instanceof AiProviderError && error.cause ? error.cause : error;
  const details = isRecord(source) ? source : undefined;
  const response = details && isRecord(details.response) ? details.response : undefined;
  const message = source instanceof Error ? source.message : details && typeof details.message === "string" ? details.message : String(source);
  const responseBody = parseDebugBody(details?.responseBody ?? details?.body ?? details?.error ?? response?.body ?? response?.data ?? message);
  console.error(`[ai] ${provider} SDK error`, {
    name: source instanceof Error ? source.name : details?.name,
    statusCode: details?.status ?? details?.statusCode ?? details?.code,
    message,
    responseBody,
    stack: source instanceof Error ? source.stack : undefined,
  });
}

export function toSafeAiError(error: unknown) {
  logProviderError(error);
  if (error instanceof AiProviderError) return { code: error.code, message: error.message, status: error.status };
  if (error instanceof Error && (error.name === "AbortError" || error.name === "TimeoutError")) return { code: "timeout", message: "The AI request took too long. Please try again.", status: 504 };
  return { code: "network_error", message: "The AI service is temporarily unavailable.", status: 503 };
}
