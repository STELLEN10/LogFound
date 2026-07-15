import type { AgentDefinition, AgentId } from "./types";

export const agents: Record<AgentId, AgentDefinition> = {
  nova: { id: "nova", name: "Nova", description: "Turns ambiguous ideas into clear next steps.", capabilities: ["reasoning"] },
  atlas: { id: "atlas", name: "Atlas", description: "Maps context, sources, and dependencies.", capabilities: ["research"] },
  echo: { id: "echo", name: "Echo", description: "Distills complex work into useful summaries.", capabilities: ["synthesis"] },
};

export const agentList = Object.values(agents);
