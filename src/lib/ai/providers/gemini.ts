import "server-only";
import { ApiError, GoogleGenAI } from "@google/genai";
import type { AiProvider, AiTextRequest } from "./contracts";
import { AiConfigurationError, AiProviderError } from "./errors";
import { retryableProviderError, withRetry, withTimeout } from "./runtime";

function mapGeminiError(error: unknown): AiProviderError {
  if (error instanceof AiProviderError) return error;
  if (error instanceof ApiError) {
    if (error.status === 401 || error.status === 403) return new AiProviderError("invalid_api_key", "Gemini authentication failed. Verify GEMINI_API_KEY.", 503);
    if (error.status === 429) return new AiProviderError("rate_limited", "Gemini is busy right now. Please try again shortly.", 429);
    if (error.status >= 500) return new AiProviderError("provider_unavailable", "Gemini is temporarily unavailable. Please try again.", 503);
    return new AiProviderError("provider_error", "Gemini could not complete this request.", 502);
  }
  if (error instanceof Error && (error.name === "AbortError" || error.name === "TimeoutError")) return new AiProviderError("timeout", "The Gemini request took too long. Please try again.", 504);
  return new AiProviderError("provider_unavailable", "Gemini is temporarily unavailable. Please try again.", 503);
}

function shouldRetryGemini(error: unknown) {
  const mapped = mapGeminiError(error);
  return retryableProviderError(mapped);
}

export class GeminiProvider implements AiProvider {
  readonly name = "gemini" as const;
  readonly displayName = "Gemini";
  readonly model: string;
  private readonly client: GoogleGenAI;

  constructor(model: string) {
    const apiKey = process.env.GEMINI_API_KEY?.trim();
    if (!apiKey) throw new AiConfigurationError("Gemini is not configured. Add GEMINI_API_KEY to the server environment.");
    this.model = model;
    this.client = new GoogleGenAI({ apiKey });
  }

  async generate(request: AiTextRequest) {
    try {
      const chat = this.client.chats.create({ model: this.model, config: { systemInstruction: request.systemInstruction, maxOutputTokens: request.maxOutputTokens } });
      const response = await withRetry(() => withTimeout(chat.sendMessage({ message: request.input })), shouldRetryGemini);
      return response.text || "No recommendation was generated.";
    } catch (error) {
      throw mapGeminiError(error);
    }
  }

  async *stream(request: AiTextRequest) {
    let responseStream: AsyncGenerator<{ text?: string }>;
    try {
      const chat = this.client.chats.create({ model: this.model, config: { systemInstruction: request.systemInstruction, maxOutputTokens: request.maxOutputTokens } });
      responseStream = await withRetry(() => withTimeout(chat.sendMessageStream({ message: request.input })), shouldRetryGemini);
    } catch (error) {
      throw mapGeminiError(error);
    }

    try {
      while (true) {
        const next = await withTimeout(responseStream.next());
        if (next.done) break;
        if (next.value.text) yield next.value.text;
      }
    } catch (error) {
      throw mapGeminiError(error);
    }
  }
}
