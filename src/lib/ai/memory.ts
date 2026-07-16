import type { AiMemoryRecord, AiOperation, WorkspaceContext } from "./types";

export interface AiMemoryStore { remember(record: Omit<AiMemoryRecord, "id" | "createdAt">): Promise<AiMemoryRecord>; recent(project: string, limit?: number): Promise<AiMemoryRecord[]>; }

class InMemoryAiMemoryStore implements AiMemoryStore {
  private records: AiMemoryRecord[] = [];
  async remember(record: Omit<AiMemoryRecord, "id" | "createdAt">) { const saved = { ...record, id: crypto.randomUUID(), createdAt: new Date().toISOString() }; this.records.unshift(saved); this.records = this.records.slice(0, 100); return saved; }
  async recent(project: string, limit = 8) { return this.records.filter((record) => record.project === project).slice(0, limit); }
}

export const aiMemory: AiMemoryStore = new InMemoryAiMemoryStore();

export function defaultWorkspaceContext(memories: AiMemoryRecord[] = []): WorkspaceContext {
  return { project: "Logfound activation", repository: "logfound-web", branch: "main", timeline: ["Customer interviews identified first-session confidence as the main activation gap.", "Onboarding cohort decision selected a ten-founder release."], recentCommits: ["e1e13f4 · Build founder dashboard workspace", "b5ac90d · Add Supabase auth boundary"], founderHistory: ["Testing has been delayed in late launch phases.", "Strongest feature decisions began with customer interviews."], previousDecisions: ["Launch onboarding to a small cohort after authentication validation.", "Protect the first-session learning loop over feature breadth."], relevantMemories: memories.map((memory) => `${memory.agentIds.join(", ")} considered: ${memory.question}`).slice(0, 6) };
}

export function memoryRecord(question: string, operation: AiOperation, context: WorkspaceContext, agentIds: AiMemoryRecord["agentIds"], decision?: string): Omit<AiMemoryRecord, "id" | "createdAt"> { return { question, operation, project: context.project, repository: context.repository, agentIds, decision, timelineReference: context.timeline[0] }; }
