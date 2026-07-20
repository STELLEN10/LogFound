export type AiProviderName = "groq" | "openai";

export type AiProviderErrorCode = "missing_api_key" | "invalid_api_key" | "rate_limited" | "quota_exceeded" | "model_not_found" | "timeout" | "network_error" | "provider_unavailable" | "provider_error" | "unsupported_provider";

export class AiProviderError extends Error {
  constructor(public readonly code: AiProviderErrorCode, message: string, public readonly status = 503, public readonly cause?: unknown) {
    super(message);
    this.name = "AiProviderError";
  }
}

export class AiConfigurationError extends AiProviderError {
  constructor(message: string, code: "missing_api_key" | "unsupported_provider" = "missing_api_key") {
    super(code, message, 503);
    this.name = "AiConfigurationError";
  }
}

export class AiTimeoutError extends AiProviderError {
  constructor() {
    super("timeout", "The AI request took too long. Please try again.", 504);
    this.name = "AiTimeoutError";
  }
}
