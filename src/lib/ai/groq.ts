import "server-only";

import Groq from "groq-sdk";

export const GROQ_PROVIDER = "groq" as const;
export const GROQ_MODEL = "llama-3.3-70b-versatile" as const;

export type AiTextRequest = {
  systemInstruction: string;
  input: string;
  maxOutputTokens: number;
};

export type AiErrorCode =
  | "missing_api_key"
  | "invalid_api_key"
  | "rate_limited"
  | "quota_exceeded"
  | "model_not_found"
  | "timeout"
  | "network_error"
  | "provider_unavailable"
  | "provider_error";

export class AiError extends Error {
  constructor(
    public readonly code: AiErrorCode,
    message: string,
    public readonly status = 503,
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = "AiError";
  }
}

export class AiConfigurationError extends AiError {
  constructor() {
    super(
      "missing_api_key",
      "Groq API key missing. Add GROQ_API_KEY to your environment variables.",
      503,
    );
    this.name = "AiConfigurationError";
  }
}

export interface AiClient {
  readonly name: typeof GROQ_PROVIDER;
  readonly displayName: "Groq";
  readonly model: typeof GROQ_MODEL;
  generate(request: AiTextRequest): Promise<string>;
  stream(request: AiTextRequest): AsyncIterable<string>;
}

function detail(error: unknown) {
  if (error instanceof Error && error.message.trim())
    return error.message.trim();
  if (typeof error === "string" && error.trim()) return error.trim();
  return "The Groq SDK did not provide an error message.";
}

function mapError(error: unknown): AiError {
  if (error instanceof AiError) return error;
  const message = detail(error);
  if (error instanceof Groq.APIError) {
    if (error.status === 401 || error.status === 403)
      return new AiError(
        "invalid_api_key",
        `Invalid Groq API key. ${message}`,
        503,
        error,
      );
    if (error.status === 404)
      return new AiError(
        "model_not_found",
        `Groq model not found: ${GROQ_MODEL}. ${message}`,
        502,
        error,
      );
    if (error.status === 429)
      return new AiError(
        "quota_exceeded",
        `Groq quota exceeded or rate limit reached. ${message}`,
        429,
        error,
      );
    if ((error.status || 0) >= 500)
      return new AiError(
        "provider_unavailable",
        `Groq is unavailable. ${message}`,
        503,
        error,
      );
    return new AiError(
      "provider_error",
      `Groq request failed. ${message}`,
      error.status || 502,
      error,
    );
  }
  if (
    error instanceof Error &&
    (error.name === "AbortError" || error.name === "TimeoutError")
  )
    return new AiError(
      "timeout",
      `Groq network timeout. ${message}`,
      504,
      error,
    );
  return new AiError(
    "network_error",
    `Groq request failed. ${message}`,
    503,
    error,
  );
}

function retryable(error: unknown) {
  const mapped = mapError(error);
  return (
    mapped.code === "quota_exceeded" || mapped.code === "provider_unavailable"
  );
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs = 30_000) {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<never>((_, reject) => {
        timer = setTimeout(
          () =>
            reject(
              new AiError(
                "timeout",
                "Groq network timeout. Please try again.",
                504,
              ),
            ),
          timeoutMs,
        );
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

async function withRetry<T>(operation: () => Promise<T>) {
  let lastError: unknown;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (!retryable(error) || attempt === 1) throw error;
      await new Promise((resolve) => setTimeout(resolve, 250 * (attempt + 1)));
    }
  }
  throw lastError;
}

let client: Groq | undefined;

function getSdk() {
  const apiKey = process.env.GROQ_API_KEY?.trim();
  if (!apiKey) throw new AiConfigurationError();
  client ??= new Groq({ apiKey, timeout: 30_000, maxRetries: 0 });
  return client;
}

export function getAiClient(): AiClient {
  return {
    name: GROQ_PROVIDER,
    displayName: "Groq",
    model: GROQ_MODEL,
    async generate(request) {
      try {
        const response = await withRetry(() =>
          withTimeout(
            getSdk().chat.completions.create({
              model: GROQ_MODEL,
              temperature: 0.7,
              max_tokens: request.maxOutputTokens,
              messages: [
                { role: "system", content: request.systemInstruction },
                { role: "user", content: request.input },
              ],
            }),
          ),
        );
        return (
          response.choices[0]?.message?.content ||
          "No recommendation was generated."
        );
      } catch (error) {
        throw mapError(error);
      }
    },
    async *stream(request) {
      try {
        const response = await withRetry(() =>
          withTimeout(
            getSdk().chat.completions.create({
              model: GROQ_MODEL,
              temperature: 0.7,
              max_tokens: request.maxOutputTokens,
              stream: true,
              messages: [
                { role: "system", content: request.systemInstruction },
                { role: "user", content: request.input },
              ],
            }),
          ),
        );
        for await (const chunk of response) {
          const delta = chunk.choices[0]?.delta?.content;
          if (delta) yield delta;
        }
      } catch (error) {
        throw mapError(error);
      }
    },
  };
}

export function toSafeAiError(error: unknown) {
  logGroqError(error);
  if (error instanceof AiError)
    return { code: error.code, message: error.message, status: error.status };
  return {
    code: "network_error" as const,
    message: "Groq request failed. Please verify your API key and model.",
    status: 503,
  };
}

function logGroqError(error: unknown) {
  const source = error instanceof AiError && error.cause ? error.cause : error;
  const details =
    typeof source === "object" && source !== null
      ? (source as Record<string, unknown>)
      : undefined;
  const response =
    details?.response && typeof details.response === "object"
      ? (details.response as Record<string, unknown>)
      : undefined;
  const responseBody =
    details?.responseBody ??
    details?.body ??
    details?.error ??
    response?.body ??
    response?.data;
  console.error("[ai] Groq SDK error", {
    name: source instanceof Error ? source.name : details?.name,
    statusCode: details?.status ?? details?.statusCode ?? response?.status,
    message: source instanceof Error ? source.message : details?.message,
    responseBody,
    stack: source instanceof Error ? source.stack : undefined,
  });
}
