import "server-only";
import OpenAI from "openai";
import type { AiProvider, AiTextRequest } from "./contracts";
import { AiConfigurationError, AiProviderError } from "./errors";
import { retryableProviderError, withRetry, withTimeout } from "./runtime";

function mapOpenAiError(error: unknown): AiProviderError {
  if (error instanceof AiProviderError) return error;
  if (error instanceof OpenAI.APIError) {
    if (error.status === 401 || error.status === 403) return new AiProviderError("invalid_api_key", "OpenAI authentication failed. Verify OPENAI_API_KEY.", 503);
    if (error.status === 429) return new AiProviderError("rate_limited", "OpenAI is busy right now. Please try again shortly.", 429);
    if ((error.status || 0) >= 500) return new AiProviderError("provider_unavailable", "OpenAI is temporarily unavailable. Please try again.", 503);
    return new AiProviderError("provider_error", "OpenAI could not complete this request.", error.status || 502);
  }
  if (error instanceof Error && (error.name === "AbortError" || error.name === "TimeoutError")) return new AiProviderError("timeout", "The OpenAI request took too long. Please try again.", 504);
  return new AiProviderError("provider_unavailable", "OpenAI is temporarily unavailable. Please try again.", 503);
}

function shouldRetryOpenAi(error: unknown) {
  return retryableProviderError(mapOpenAiError(error));
}

export class OpenAiProvider implements AiProvider {
  readonly name = "openai" as const;
  readonly displayName = "OpenAI";
  readonly model: string;
  private readonly client: OpenAI;

  constructor(model: string) {
    const apiKey = process.env.OPENAI_API_KEY?.trim();
    if (!apiKey) throw new AiConfigurationError("OpenAI is not configured. Add OPENAI_API_KEY to the server environment.");
    this.model = model;
    this.client = new OpenAI({ apiKey, timeout: 30_000, maxRetries: 0 });
  }

  async generate(request: AiTextRequest) {
    try {
      const response = await withRetry(() => withTimeout(this.client.responses.create({ model: this.model, instructions: request.systemInstruction, input: request.input, max_output_tokens: request.maxOutputTokens })), shouldRetryOpenAi);
      return response.output_text || "No recommendation was generated.";
    } catch (error) {
      throw mapOpenAiError(error);
    }
  }

  async *stream(request: AiTextRequest) {
    let responseStream: AsyncIterable<{ type?: string; delta?: string }>;
    try {
      responseStream = await withRetry(() => withTimeout(this.client.responses.create({ model: this.model, instructions: request.systemInstruction, input: request.input, max_output_tokens: request.maxOutputTokens, stream: true })), shouldRetryOpenAi);
    } catch (error) {
      throw mapOpenAiError(error);
    }
    try {
      const iterator = responseStream[Symbol.asyncIterator]();
      while (true) {
        const next = await withTimeout(iterator.next());
        if (next.done) break;
        const event = next.value;
        if (event.type === "response.output_text.delta" && event.delta) yield event.delta;
      }
    } catch (error) {
      throw mapOpenAiError(error);
    }
  }
}
