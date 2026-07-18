import "server-only";
import { AiConfigurationError } from "./errors";
import type { AiProvider } from "./contracts";
import type { AiProviderName } from "./errors";
import { GeminiProvider } from "./gemini";
import { OpenAiProvider } from "./openai";

export type { AiProvider, AiTextRequest } from "./contracts";
export type { AiProviderErrorCode, AiProviderName } from "./errors";
export { AiConfigurationError, AiProviderError, AiTimeoutError } from "./errors";

function configuredProviderName(): AiProviderName {
  const provider = process.env.AI_PROVIDER?.trim().toLowerCase();
  if (!provider || provider === "gemini") return "gemini";
  if (provider === "openai") return "openai";
  throw new AiConfigurationError(`Unsupported AI_PROVIDER '${provider}'. Choose 'gemini' or 'openai'.`, "unsupported_provider");
}

export function getAiProviderConfig() {
  const name = configuredProviderName();
  const model = process.env.AI_MODEL?.trim() || (name === "gemini" ? "gemini-2.5-flash" : process.env.OPENAI_MODEL?.trim() || "gpt-5.6");
  return { name, model };
}

let activeProvider: AiProvider | undefined;

export function getAiProvider() {
  if (activeProvider) return activeProvider;
  const config = getAiProviderConfig();
  activeProvider = config.name === "gemini" ? new GeminiProvider(config.model) : new OpenAiProvider(config.model);
  return activeProvider;
}
