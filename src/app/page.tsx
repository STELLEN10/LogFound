import { Dashboard } from "@/components/dashboard/dashboard";
import { createClient } from "@/lib/supabase/server";

async function getUsername() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const fullName = user?.user_metadata.full_name;
    if (typeof fullName === "string" && fullName.trim()) return fullName.trim().split(" ")[0];
    return user?.email?.split("@")[0] || "there";
  } catch {
    return "there";
  }
}

export default async function Home() {
  return <Dashboard username={await getUsername()} />;
}
