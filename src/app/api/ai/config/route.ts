import { getAiProviderConfig, toSafeAiError } from "@/lib/ai/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const config = getAiProviderConfig();
    const configured = config.name === "groq" ? Boolean(process.env.GROQ_API_KEY?.trim()) : Boolean(process.env.OPENAI_API_KEY?.trim());
    return Response.json({ provider: config.name, providerName: config.name === "groq" ? "Groq" : "OpenAI", model: config.model, configured }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const safe = toSafeAiError(error);
    return Response.json({ provider: "groq", providerName: "Groq", model: process.env.GROQ_MODEL?.trim() || "llama-3.3-70b-versatile", configured: false, error: safe.message, code: safe.code }, { status: safe.status, headers: { "Cache-Control": "no-store" } });
  }
}
