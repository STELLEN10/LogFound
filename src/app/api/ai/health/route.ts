import { getAiClient, toSafeAiError } from "@/lib/ai/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const started = performance.now();
  const provider = "groq";
  const model = "llama-3.3-70b-versatile";
  try {
    console.info("[ai] health check", { provider, model });
    const client = getAiClient();
    const output = await client.generate({
      systemInstruction: "Reply with exactly: OK",
      input: "Reply with exactly: OK",
      maxOutputTokens: 16,
    });
    return Response.json(
      {
        status: "available",
        provider: client.name,
        providerName: client.displayName,
        model: client.model,
        latencyMs: Math.round(performance.now() - started),
        output,
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    const safe = toSafeAiError(error);
    console.error("[ai] health check failed", {
      provider,
      model,
      code: safe.code,
      error: safe.message,
    });
    return Response.json(
      {
        status: "unavailable",
        provider,
        model,
        error: safe.message,
        code: safe.code,
      },
      { status: safe.status, headers: { "Cache-Control": "no-store" } },
    );
  }
}
