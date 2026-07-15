export type AgentId = "nova" | "atlas" | "echo";

export type AgentCapability = "reasoning" | "research" | "synthesis";

export type AgentDefinition = {
  id: AgentId;
  name: string;
  description: string;
  capabilities: readonly AgentCapability[];
};

export type AgentMessage = {
  id: string;
  role: "user" | "assistant" | "system" | "tool";
  content: string;
  agentId?: AgentId;
  createdAt: string;
};
