import { GROQ_MODEL } from "@/lib/ai/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json(
    {
      provider: "groq",
      providerName: "Groq",
      model: GROQ_MODEL,
      configured: Boolean(process.env.GROQ_API_KEY?.trim()),
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
