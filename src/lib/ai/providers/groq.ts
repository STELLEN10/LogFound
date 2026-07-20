import "server-only";
import Groq from "groq-sdk";
import type { AiProvider, AiTextRequest } from "./contracts";
import { AiConfigurationError, AiProviderError } from "./errors";
import { retryableProviderError, withRetry, withTimeout } from "./runtime";

function sdkDetail(error: unknown) {
  if (error instanceof Error && error.message.trim()) return error.message.trim();
  if (typeof error === "string" && error.trim()) return error.trim();
  return "The Groq SDK did not provide an error message.";
}

function mapGroqError(error: unknown, model: string): AiProviderError {
  if (error instanceof AiProviderError) return error;
  const detail = sdkDetail(error);
  if (error instanceof Groq.APIError) {
    if (error.status === 401 || error.status === 403) return new AiProviderError("invalid_api_key", `Invalid Groq API key. Verify GROQ_API_KEY. ${detail}`, 503, error);
    if (error.status === 404) return new AiProviderError("model_not_found", `Groq model not found: ${model}. ${detail}`, 502, error);
    if (error.status === 429) return new AiProviderError("quota_exceeded", `Groq quota exceeded or rate limit reached. ${detail}`, 429, error);
    if ((error.status || 0) >= 500) return new AiProviderError("provider_unavailable", `Groq is unavailable. ${detail}`, 503, error);
    return new AiProviderError("provider_error", `Groq request failed (${error.status || "unknown status"}). ${detail}`, error.status || 502, error);
  }
  if (error instanceof Error && (error.name === "AbortError" || error.name === "TimeoutError")) return new AiProviderError("timeout", `Groq network timeout. ${detail}`, 504, error);
  return new AiProviderError("network_error", `Groq network request failed. ${detail}`, 503, error);
}

function shouldRetryGroq(error: unknown) {
  return retryableProviderError(mapGroqError(error, "configured model"));
}

export class GroqProvider implements AiProvider {
  readonly name = "groq" as const;
  readonly displayName = "Groq";
  readonly model: string;
  private readonly client: Groq;

  constructor(model: string) {
    const apiKey = process.env.GROQ_API_KEY?.trim();
    if (!apiKey) throw new AiConfigurationError("Groq is not configured. Add GROQ_API_KEY to the server environment.");
    this.model = model;
    this.client = new Groq({ apiKey, timeout: 30_000, maxRetries: 0 });
  }

  async generate(request: AiTextRequest) {
    try {
      const response = await withRetry(() => withTimeout(this.client.chat.completions.create({ model: this.model, temperature: 0.7, max_tokens: 1500, messages: [{ role: "system", content: request.systemInstruction }, { role: "user", content: request.input }] })), shouldRetryGroq);
      return response.choices[0]?.message?.content || "No recommendation was generated.";
    } catch (error) {
      throw mapGroqError(error, this.model);
    }
  }

  async *stream(request: AiTextRequest) {
    try {
      const response = await withRetry(() => withTimeout(this.client.chat.completions.create({ model: this.model, temperature: 0.7, max_tokens: 1500, stream: true, messages: [{ role: "system", content: request.systemInstruction }, { role: "user", content: request.input }] })), shouldRetryGroq);
      for await (const chunk of response) {
        const delta = chunk.choices[0]?.delta?.content;
        if (delta) yield delta;
      }
    } catch (error) {
      throw mapGroqError(error, this.model);
    }
  }
}
