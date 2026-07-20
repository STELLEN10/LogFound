import { Dashboard } from "@/components/dashboard/dashboard";
import { AUTH_COOKIE_NAME, verifySessionToken } from "@/lib/auth/session";
import { cookies } from "next/headers";

async function getUsername() {
  try {
    const session = await verifySessionToken((await cookies()).get(AUTH_COOKIE_NAME)?.value);
    return session?.user.name || session?.user.username || "there";
  } catch {
    return "there";
  }
}

export default async function Home() {
  return <Dashboard username={await getUsername()} />;
}
