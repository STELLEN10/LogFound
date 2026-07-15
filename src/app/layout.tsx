import type { Metadata } from "next";
import { AppShell } from "@/components/app-shell";
import { Providers } from "@/components/providers";
import "./globals.css";

export const metadata: Metadata = { title: "Logfound", description: "A focused workspace for thinking with AI agents.", applicationName: "Logfound" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" suppressHydrationWarning><body><Providers><AppShell>{children}</AppShell></Providers></body></html>;
}
