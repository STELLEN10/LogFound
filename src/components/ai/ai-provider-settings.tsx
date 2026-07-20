"use client";

import {
  CheckCircle2,
  CircleAlert,
  Cpu,
  LoaderCircle,
  Play,
  Sparkles,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ProviderConfig = {
  model: string;
  configured: boolean;
};
type Health = {
  status: "idle" | "testing" | "connected" | "unavailable";
  detail?: string;
  latencyMs?: number;
};

export function AiProviderSettings() {
  const [config, setConfig] = useState<ProviderConfig>({
    model: "llama-3.3-70b-versatile",
    configured: false,
  });
  const [health, setHealth] = useState<Health>({ status: "idle" });

  useEffect(() => {
    let active = true;
    fetch("/api/ai/config", { cache: "no-store" })
      .then(async (response) => {
        const data = await response.json();
        if (active && response.ok) setConfig(data as ProviderConfig);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  const test = async () => {
    setHealth({ status: "testing", detail: "Sending a secure test prompt…" });
    try {
      const response = await fetch("/api/ai/health", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok)
        throw new Error(
          data.error ||
            "Groq request failed. Please verify your API key and model.",
        );
      setConfig((current) => ({
        ...current,
        model: data.model,
        configured: true,
      }));
      setHealth({
        status: "connected",
        detail: `Response received: ${data.output || "OK"}`,
        latencyMs: data.latencyMs,
      });
    } catch (error) {
      setHealth({
        status: "unavailable",
        detail:
          error instanceof Error
            ? error.message
            : "Groq request failed. Please verify your API key and model.",
      });
    }
  };

  const statusLabel =
    health.status === "connected"
      ? "Connected"
      : health.status === "testing"
        ? "Testing"
        : config.configured
          ? "Configured"
          : "Missing API Key";
  return (
    <section
      className="mt-6 animate-rise animation-delay-3 rounded-xl border border-border bg-card/55 p-6"
      aria-labelledby="ai-provider-title"
    >
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="flex items-center gap-2 text-sm font-medium">
            <Sparkles className="size-4 text-primary" />
            Groq AI Engine
          </p>
          <h2
            id="ai-provider-title"
            className="mt-3 text-xl font-semibold tracking-tight"
          >
            A focused intelligence layer for your founder workspace.
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
            Logfound routes every agent request through one server-side AI
            Logfound routes every agent request through the secure server-side
            Groq client. Your API key never reaches the browser.
          </p>
        </div>
        <Button
          variant="secondary"
          onClick={() => void test()}
          disabled={health.status === "testing"}
        >
          {health.status === "testing" ? (
            <>
              <LoaderCircle className="mr-2 size-4 animate-spin" />
              Testing connection
            </>
          ) : (
            <>
              <Play className="mr-2 size-4" />
              Test Connection
            </>
          )}
        </Button>
      </div>
      <div className="mt-6 grid gap-3 sm:grid-cols-4">
        <ProviderMetric label="Current Provider" value="Groq" />
        <ProviderMetric label="Model" value={config.model} />
        <ProviderMetric
          label="Status"
          value={statusLabel}
          tone={
            health.status === "connected"
              ? "success"
              : config.configured
                ? "neutral"
                : "warning"
          }
        />
        <ProviderMetric
          label="API health"
          value={
            health.status === "connected"
              ? `Healthy · ${health.latencyMs} ms`
              : health.status === "unavailable"
                ? "Unavailable"
                : !config.configured
                  ? "Missing API Key"
                  : "Not tested"
          }
          tone={
            health.status === "connected"
              ? "success"
              : health.status === "unavailable"
                ? "warning"
                : "neutral"
          }
        />
      </div>
      {health.detail && (
        <div
          className={cn(
            "mt-4 flex items-start gap-2 rounded-lg border p-3 text-sm",
            health.status === "connected"
              ? "border-emerald-300/25 bg-emerald-300/[0.06]"
              : "border-amber-300/25 bg-amber-300/[0.06]",
          )}
          role="status"
          aria-live="polite"
        >
          {health.status === "connected" ? (
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-300" />
          ) : (
            <CircleAlert className="mt-0.5 size-4 shrink-0 text-amber-200" />
          )}
          <span className="leading-6 text-muted-foreground">
            {health.detail}
          </span>
        </div>
      )}
    </section>
  );
}

function ProviderMetric({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: string;
  tone?: "success" | "warning" | "neutral";
}) {
  return (
    <article className="rounded-lg border border-border bg-background/35 p-4">
      <Cpu
        className={cn(
          "size-4",
          tone === "success"
            ? "text-emerald-300"
            : tone === "warning"
              ? "text-amber-200"
              : "text-primary",
        )}
      />
      <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 truncate text-sm font-medium">{value}</p>
    </article>
  );
}
