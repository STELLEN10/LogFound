"use client";

import {
  Activity,
  Bot,
  CheckCircle2,
  CircleAlert,
  Cpu,
  Play,
  RefreshCw,
  Send,
  Sparkles,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type {
  AgentContribution,
  AiOperation,
  AiPhase,
  AiProviderName,
  AiStreamEvent,
} from "@/lib/ai/types";

const modes: { id: AiOperation; label: string; description: string }[] = [
  {
    id: "ask",
    label: "Smart route",
    description: "The right specialist responds",
  },
  {
    id: "collaborate",
    label: "Council",
    description: "Five independent perspectives",
  },
  {
    id: "weekly_review",
    label: "Weekly review",
    description: "Pattern and momentum read",
  },
  {
    id: "replay",
    label: "Replay",
    description: "Decision history and lessons",
  },
  {
    id: "founder_dna",
    label: "Founder DNA",
    description: "Operating profile in motion",
  },
];
const phaseCopy: Record<AiPhase, string> = {
  thinking: "Thinking",
  searching: "Searching workspace",
  analyzing: "Analyzing evidence",
  collaborating: "Collaborating",
  generating: "Generating",
};

export function AiWorkspace() {
  const [question, setQuestion] = useState(
    "Should I launch onboarding this week?",
  );
  const [operation, setOperation] = useState<AiOperation>("collaborate");
  const [phase, setPhase] = useState<AiPhase | null>(null);
  const [phaseMessage, setPhaseMessage] = useState("");
  const [contributions, setContributions] = useState<AgentContribution[]>([]);
  const [output, setOutput] = useState("");
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [provider, setProvider] = useState<AiProviderName>("groq");
  const [model, setModel] = useState("llama-3.3-70b-versatile");
  const [health, setHealth] = useState<{
    status: string;
    detail: string;
    latency?: number;
    provider?: string;
    model?: string;
  } | null>(null);

  async function run() {
    if (!question.trim() || running) return;
    setRunning(true);
    setError(null);
    setPhase("thinking");
    setPhaseMessage("Understanding the founder request…");
    setContributions([]);
    setOutput("");
    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          operation,
          question,
          remember: true,
          stream: true,
        }),
      });
      if (!response.ok || !response.body) {
        const data = await response.json().catch(() => null);
        throw new Error(
          data?.error?.message ||
            "The AI service could not start this request.",
        );
      }
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const chunks = buffer.split("\n\n");
        buffer = chunks.pop() || "";
        for (const chunk of chunks) {
          const payload = chunk
            .split("\n")
            .find((line) => line.startsWith("data: "))
            ?.slice(6);
          if (!payload) continue;
          const event = JSON.parse(payload) as AiStreamEvent;
          if (event.type === "meta") {
            setProvider(event.provider);
            setModel(event.model);
          }
          if (event.type === "status") {
            setPhase(event.phase);
            setPhaseMessage(event.message);
          }
          if (event.type === "contribution")
            setContributions((existing) => [...existing, event.contribution]);
          if (event.type === "delta")
            setOutput((existing) => existing + event.text);
          if (event.type === "error") setError(event.message);
        }
      }
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "The AI service is temporarily unavailable.",
      );
    } finally {
      setRunning(false);
      setPhase(null);
    }
  }
  async function testHealth() {
    setHealth({
      status: "testing",
      detail: "Testing the secure provider connection…",
    });
    try {
      const response = await fetch("/api/ai/health", { cache: "no-store" });
      const data = await response.json();
      if (response.ok) {
        setProvider(data.provider);
        setModel(data.model);
        setHealth({
          status: "connected",
          detail: `${data.providerName || data.provider} · ${data.model} responded: ${data.output || "OK"}`,
          latency: data.latencyMs,
          provider: data.providerName || data.provider,
          model: data.model,
        });
      } else
        setHealth({
          status: "unavailable",
          detail: data.error || "The configured AI provider is not available.",
        });
    } catch {
      setHealth({
        status: "unavailable",
        detail: "Could not reach the AI health endpoint.",
      });
    }
  }
  return (
    <section
      className="mx-auto mt-10 w-full max-w-7xl border-t border-border/70 px-5 pt-10 sm:px-8 lg:px-10"
      aria-labelledby="ai-workspace-title"
    >
      <div className="grid gap-8 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.8fr)]">
        <div className="rounded-xl border border-primary/25 bg-gradient-to-br from-primary/[0.1] via-card to-card p-6 sm:p-7">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Live AI workspace
          </p>
          <h2
            id="ai-workspace-title"
            className="mt-2 text-2xl font-semibold tracking-tight"
          >
            Ask the operating system.
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
            The AI layer receives the project, timeline, GitHub evolution,
            founder history, and relevant decisions through a secured server
            route.
          </p>
          <div className="mt-6 grid gap-2 sm:grid-cols-5">
            {modes.map((mode) => (
              <button
                key={mode.id}
                onClick={() => setOperation(mode.id)}
                className={cn(
                  "rounded-lg border p-3 text-left transition-colors",
                  operation === mode.id
                    ? "border-primary/50 bg-primary/[0.08]"
                    : "border-border bg-background/35 hover:border-primary/30",
                )}
              >
                <span className="block text-xs font-medium">{mode.label}</span>
                <span className="mt-1 block text-[11px] leading-4 text-muted-foreground">
                  {mode.description}
                </span>
              </button>
            ))}
          </div>
          <textarea
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            rows={3}
            maxLength={4000}
            className="mt-5 w-full resize-none rounded-lg border border-border bg-background/45 p-4 text-base outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
            aria-label="Founder question"
          />
          <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-muted-foreground">
              Your request is remembered with workspace references when the
              response completes.
            </p>
            <Button onClick={run} disabled={running || !question.trim()}>
              {running ? (
                <>
                  <RefreshCw className="mr-2 size-4 animate-spin" />
                  Working across the room
                </>
              ) : (
                <>
                  <Send className="mr-2 size-4" />
                  Run {operation === "collaborate" ? "council" : "AI"}
                </>
              )}
            </Button>
          </div>
          {(running || phase) && (
            <div className="mt-5 flex items-center gap-3 rounded-lg border border-primary/20 bg-primary/[0.06] p-3 text-sm">
              <span className="flex size-7 items-center justify-center rounded-full bg-primary/15 text-primary">
                <Activity className="size-3.5 animate-pulse" />
              </span>
              <div>
                <p className="font-medium">
                  {phase ? phaseCopy[phase] : "Preparing"}…
                </p>
                <p className="text-xs text-muted-foreground">{phaseMessage}</p>
              </div>
            </div>
          )}
          {error && (
            <div className="mt-5 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm">
              <p className="flex items-center gap-2 font-medium text-destructive-foreground">
                <CircleAlert className="size-4" />
                AI request unavailable
              </p>
              <p className="mt-1 text-muted-foreground">{error}</p>
            </div>
          )}
          {contributions.length > 0 && (
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {contributions.map((contribution) => (
                <article
                  key={contribution.agent}
                  className="rounded-lg border border-border bg-card/65 p-4"
                >
                  <p className="flex items-center gap-2 text-sm font-medium">
                    <Bot className="size-3.5 text-primary" />
                    {contribution.name}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {contribution.content}
                  </p>
                </article>
              ))}
            </div>
          )}
          {output && (
            <article className="mt-5 rounded-xl border border-primary/25 bg-card/70 p-5">
              <p className="flex items-center gap-2 text-sm font-medium">
                <Sparkles className="size-4 text-primary" />
                {operation === "collaborate"
                  ? "Unified recommendation"
                  : "Recommendation"}
              </p>
              <div className="mt-3 whitespace-pre-wrap text-sm leading-7 text-muted-foreground">
                {output}
              </div>
            </article>
          )}
        </div>
        <aside className="space-y-5">
          <section className="rounded-xl border border-border bg-card/55 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              AI health check
            </p>
            <h3 className="mt-2 text-lg font-semibold tracking-tight">
              Verify the secure connection.
            </h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              The browser calls this application endpoint; the API key never
              leaves the server.
            </p>
            <Button
              className="mt-5 w-full"
              variant="secondary"
              onClick={testHealth}
              disabled={health?.status === "testing"}
            >
              {health?.status === "testing" ? (
                <>
                  <RefreshCw className="mr-2 size-4 animate-spin" />
                  Testing AI
                </>
              ) : (
                <>
                  <Play className="mr-2 size-4" />
                  Test AI
                </>
              )}
            </Button>
            {health && (
              <div
                className={cn(
                  "mt-4 rounded-lg border p-4 text-sm",
                  health.status === "connected"
                    ? "border-emerald-300/25 bg-emerald-300/[0.06]"
                    : "border-amber-300/25 bg-amber-300/[0.06]",
                )}
              >
                <p className="flex items-center gap-2 font-medium">
                  {health.status === "connected" ? (
                    <CheckCircle2 className="size-4 text-emerald-300" />
                  ) : (
                    <CircleAlert className="size-4 text-amber-200" />
                  )}
                  {health.status === "connected"
                    ? "AI Connected"
                    : "AI unavailable"}
                </p>
                <p className="mt-2 leading-6 text-muted-foreground">
                  {health.detail}
                </p>
                {health.latency && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    Latency: {health.latency} ms
                  </p>
                )}
              </div>
            )}
          </section>
          <section className="rounded-xl border border-border bg-card/55 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              Active provider
            </p>
            <p className="mt-2 flex items-center gap-2 text-lg font-semibold">
              <Cpu className="size-4 text-primary" />
              {provider === "groq" ? "Groq" : "OpenAI"}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">{model}</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Server-controlled through{" "}
              <code className="rounded bg-secondary px-1.5 py-0.5 text-xs">
                AI_PROVIDER
              </code>
              .
            </p>
          </section>
        </aside>
      </div>
    </section>
  );
}
