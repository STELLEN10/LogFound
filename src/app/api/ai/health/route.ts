import { AI_MODEL, getOpenAiClient, toSafeAiError } from "@/lib/ai/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() { const started = performance.now(); try { const response = await getOpenAiClient().responses.create({ model: AI_MODEL, input: "Reply with exactly: OK", max_output_tokens: 16 }); return Response.json({ status: "connected", model: AI_MODEL, latencyMs: Math.round(performance.now() - started), output: response.output_text }); } catch (error) { const safe = toSafeAiError(error); return Response.json({ status: "unavailable", model: AI_MODEL, error: safe.message, code: safe.code }, { status: safe.status }); } }
