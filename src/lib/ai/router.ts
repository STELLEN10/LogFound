import { aiAgents } from "./agents";
import { getAiClient } from "./client";
import { buildAgentInstructions, buildConsensusInstructions } from "./prompts";
import type { AgentContribution, AiAgentId, AiOperation, WorkspaceContext } from "./types";

const engineering = /\b(code|engineering|commit|github|repository|test|auth|supabase|bug|api|deploy|refactor|technical)\b/i;
const memory = /\b(remember|history|previous|last week|when did|lesson|decision|timeline|happened)\b/i;
const market = /\b(customer|market|feedback|pricing|position|competitor|demand)\b/i;
const strategy = /\b(product|launch|onboarding|feature|ship|priority|build|activation)\b/i;
const vision = /\b(long.term|vision|direction|moat|durable|future)\b/i;

export function selectAgents(question: string, operation: AiOperation, requested?: AiAgentId): AiAgentId[] {
  if (requested) return [requested];
  if (operation === "collaborate") return ["nova", "atlas", "echo", "pulse", "compass"];
  if (operation !== "ask") return operation === "replay" ? ["echo", "atlas", "nova"] : operation === "founder_dna" ? ["echo", "compass"] : ["nova", "atlas", "echo"];
  const found = ([engineering.test(question) && "atlas", memory.test(question) && "echo", market.test(question) && "pulse", strategy.test(question) && "nova", vision.test(question) && "compass"].filter(Boolean) as AiAgentId[]);
  return found.length === 1 ? found : found.length > 1 ? found : ["nova"];
}

export async function generateAgentContribution(agentId: AiAgentId, question: string, context: WorkspaceContext): Promise<AgentContribution> {
  const agent = aiAgents[agentId];
  const response = await getAiClient().generate({ systemInstruction: buildAgentInstructions(agent.systemPrompt, context), input: question, maxOutputTokens: 700 });
  return { agent: agentId, name: agent.name, content: response };
}

export async function* streamSingleAgent(agentId: AiAgentId, question: string, context: WorkspaceContext) {
  const agent = aiAgents[agentId];
  yield* getAiClient().stream({ systemInstruction: buildAgentInstructions(agent.systemPrompt, context), input: question, maxOutputTokens: 900 });
}

export async function generateConsensus(question: string, context: WorkspaceContext, contributions: AgentContribution[]) {
  return getAiClient().generate({ systemInstruction: buildConsensusInstructions(context, contributions), input: `Founder question: ${question}`, maxOutputTokens: 1_000 });
}
