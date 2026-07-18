import type { AiProviderName } from "./errors";

export type AiTextRequest = {
  systemInstruction: string;
  input: string;
  maxOutputTokens: number;
};

export interface AiProvider {
  readonly name: AiProviderName;
  readonly displayName: string;
  readonly model: string;
  generate(request: AiTextRequest): Promise<string>;
  stream(request: AiTextRequest): AsyncIterable<string>;
}
