import { getAiProviderConfig, toSafeAiError } from "@/lib/ai/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const config = getAiProviderConfig();
    const configured = config.name === "gemini" ? Boolean(process.env.GEMINI_API_KEY?.trim()) : Boolean(process.env.OPENAI_API_KEY?.trim());
    return Response.json({ provider: config.name, providerName: config.name === "gemini" ? "Gemini" : "OpenAI", model: config.model, configured }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const safe = toSafeAiError(error);
    return Response.json({ provider: "gemini", providerName: "Gemini", model: "gemini-2.5-flash", configured: false, error: safe.message, code: safe.code }, { status: safe.status, headers: { "Cache-Control": "no-store" } });
  }
}
