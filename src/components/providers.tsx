"use client";

import { ThemeProvider } from "next-themes";
import { TimeProvider } from "@/components/time/time-provider";

export function Providers({ children }: Readonly<{ children: React.ReactNode }>) {
  return <ThemeProvider attribute="class" defaultTheme="midnight" themes={["midnight", "obsidian", "ocean", "aurora", "graphite"]} enableSystem={false} disableTransitionOnChange><TimeProvider>{children}</TimeProvider></ThemeProvider>;
}
