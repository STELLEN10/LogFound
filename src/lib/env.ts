import { z } from "zod";

const publicEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1).optional(),
});

function firstConfigured(...values: Array<string | undefined>) {
  return values.map((value) => value?.trim()).find(Boolean);
}

export const publicEnv = publicEnvSchema.parse({
  // Support both the existing browser-safe names and the server deployment aliases.
  NEXT_PUBLIC_SUPABASE_URL: firstConfigured(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_URL),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: firstConfigured(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, process.env.SUPABASE_ANON_KEY),
});

export function hasSupabaseConfig() {
  return Boolean(publicEnv.NEXT_PUBLIC_SUPABASE_URL && publicEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}
