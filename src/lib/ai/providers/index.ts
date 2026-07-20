import "server-only";
import { AiConfigurationError } from "./errors";
import type { AiProvider } from "./contracts";
import type { AiProviderName } from "./errors";
import { GroqProvider } from "./groq";
import { OpenAiProvider } from "./openai";

export type { AiProvider, AiTextRequest } from "./contracts";
export type { AiProviderErrorCode, AiProviderName } from "./errors";
export { AiConfigurationError, AiProviderError, AiTimeoutError } from "./errors";

function configuredProviderName(): AiProviderName {
  const provider = process.env.AI_PROVIDER?.trim().toLowerCase();
  if (!provider || provider === "groq") return "groq";
  if (provider === "openai") return "openai";
  throw new AiConfigurationError(`Unsupported AI_PROVIDER '${provider}'. Choose 'groq' or 'openai'.`, "unsupported_provider");
}

export function getAiProviderConfig() {
  const name = configuredProviderName();
  const model = process.env.AI_MODEL?.trim() || (name === "groq" ? process.env.GROQ_MODEL?.trim() || "llama-3.3-70b-versatile" : process.env.OPENAI_MODEL?.trim() || "gpt-5.6");
  return { name, model };
}

let activeProvider: AiProvider | undefined;

export function getAiProvider() {
  if (activeProvider) return activeProvider;
  const config = getAiProviderConfig();
  activeProvider = config.name === "groq" ? new GroqProvider(config.model) : new OpenAiProvider(config.model);
  return activeProvider;
}
