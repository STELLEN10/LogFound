import "server-only";
import OpenAI from "openai";

export const AI_MODEL = process.env.OPENAI_MODEL?.trim() || "gpt-5.6";
const TIMEOUT_MS = 30_000;

export class AiConfigurationError extends Error { constructor() { super("OpenAI is not configured. Add OPENAI_API_KEY to your server environment."); this.name = "AiConfigurationError"; } }

let openai: OpenAI | undefined;
export function getOpenAiClient() { if (!process.env.OPENAI_API_KEY) throw new AiConfigurationError(); openai ??= new OpenAI({ apiKey: process.env.OPENAI_API_KEY, timeout: TIMEOUT_MS, maxRetries: 1 }); return openai; }

export function toSafeAiError(error: unknown) {
  if (error instanceof AiConfigurationError) return { code: "missing_api_key", message: error.message, status: 503 };
  if (error instanceof OpenAI.APIError) {
    if (error.status === 401 || error.status === 403) return { code: "invalid_api_key", message: "OpenAI authentication failed. Verify the server API key.", status: 503 };
    if (error.status === 429) return { code: "rate_limited", message: "The AI service is busy. Please try again shortly.", status: 429 };
    return { code: "openai_error", message: "The AI service could not complete this request.", status: error.status || 502 };
  }
  if (error instanceof Error && error.name === "AbortError") return { code: "timeout", message: "The AI request took too long. Please try again.", status: 504 };
  return { code: "network_error", message: "The AI service is temporarily unavailable.", status: 503 };
}
