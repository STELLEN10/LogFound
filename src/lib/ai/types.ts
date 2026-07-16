export const agentIds = ["nova", "atlas", "echo", "pulse", "compass"] as const;
export type AiAgentId = (typeof agentIds)[number];
export type AiOperation = "ask" | "collaborate" | "summary" | "weekly_review" | "replay" | "founder_dna";
export type AiPhase = "thinking" | "searching" | "analyzing" | "collaborating" | "generating";

export type WorkspaceContext = {
  project: string;
  repository: string;
  branch: string;
  timeline: string[];
  recentCommits: string[];
  founderHistory: string[];
  previousDecisions: string[];
  relevantMemories: string[];
};

export type AiRequest = {
  operation: AiOperation;
  question: string;
  agent?: AiAgentId;
  context?: Partial<WorkspaceContext>;
  remember?: boolean;
  stream?: boolean;
};

export type AgentContribution = { agent: AiAgentId; name: string; content: string };
export type AiMemoryRecord = {
  id: string;
  question: string;
  operation: AiOperation;
  project: string;
  repository: string;
  agentIds: AiAgentId[];
  decision?: string;
  timelineReference?: string;
  createdAt: string;
};

export type AiStreamEvent =
  | { type: "meta"; model: string; operation: AiOperation; agents: AiAgentId[] }
  | { type: "status"; phase: AiPhase; message: string }
  | { type: "contribution"; contribution: AgentContribution }
  | { type: "delta"; text: string }
  | { type: "complete"; memoryId?: string }
  | { type: "error"; code: string; message: string };
