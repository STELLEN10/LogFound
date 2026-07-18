import { getAiClient, toSafeAiError } from "@/lib/ai/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const started = performance.now();
  try {
    const client = getAiClient();
    const output = await client.generate({ systemInstruction: "Reply with exactly: OK", input: "Reply with exactly: OK", maxOutputTokens: 16 });
    return Response.json({ status: "connected", provider: client.name, providerName: client.displayName, model: client.model, latencyMs: Math.round(performance.now() - started), output }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const safe = toSafeAiError(error);
    let provider = "gemini";
    let model = "gemini-2.5-flash";
    try { const client = getAiClient(); provider = client.name; model = client.model; } catch { /* Keep safe fallback metadata when configuration is missing. */ }
    return Response.json({ status: "unavailable", provider, model, error: safe.message, code: safe.code }, { status: safe.status, headers: { "Cache-Control": "no-store" } });
  }
}
