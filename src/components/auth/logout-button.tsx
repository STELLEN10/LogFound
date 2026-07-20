"use client";

import { LogOut, LoaderCircle } from "lucide-react";
import { useState } from "react";

export function LogoutButton() {
  const [loading, setLoading] = useState(false);
  async function logout() {
    setLoading(true);
    try { await fetch("/api/auth/logout", { method: "POST" }); } finally { window.location.assign("/login"); }
  }
  return <button type="button" onClick={() => void logout()} disabled={loading} className="flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-60" aria-label="Sign out" title="Sign out">{loading ? <LoaderCircle className="size-4 animate-spin" /> : <LogOut className="size-4" />}</button>;
}
