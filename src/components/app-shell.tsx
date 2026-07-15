"use client";

import { ChevronRight, Command, Moon, Sparkles } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";

export function AppShell({ children }: Readonly<{ children: React.ReactNode }>) {
  const [commandOpen, setCommandOpen] = useState(false);
  const openCommand = useCallback(() => setCommandOpen(true), []);
  useEffect(() => {
    window.addEventListener("logfound:command", openCommand);
    return () => window.removeEventListener("logfound:command", openCommand);
  }, [openCommand]);
  useKeyboardShortcuts([{ key: "k", meta: true, handler: openCommand }, { key: "v", meta: true, shift: true, handler: () => window.location.assign("/voice") }, { key: "p", meta: true, shift: true, handler: () => window.location.assign("/replay") }, { key: "w", meta: true, shift: true, handler: () => window.location.assign("/replay#weekly-review") }, { key: "d", meta: true, shift: true, handler: () => window.location.assign("/replay#founder-dna") }, { key: "/", handler: openCommand }, { key: "Escape", handler: () => setCommandOpen(false) }]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground">Skip to content</a>
      <header className="flex h-16 items-center justify-between border-b border-border/60 px-6">
        <div className="flex items-center gap-3"><div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground"><Sparkles className="size-4" aria-hidden="true" /></div><Link href="/" className="font-semibold tracking-tight">Logfound</Link><Link href="/intelligence" className="hidden rounded-md px-2 py-1 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground sm:block">Intelligence</Link><Link href={"/github" as Route} className="hidden rounded-md px-2 py-1 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground md:block">GitHub</Link><Link href={"/voice" as Route} className="hidden rounded-md px-2 py-1 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground lg:block">Voice</Link><Link href={"/replay" as Route} className="hidden rounded-md px-2 py-1 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground lg:block">Replay</Link></div>
        <div className="flex items-center gap-2"><Button variant="ghost" size="sm" onClick={openCommand} aria-label="Open command menu"><Command className="mr-2 size-4" aria-hidden="true" />Command menu <kbd className="ml-2 rounded border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground">⌘K</kbd></Button><span className="flex size-10 items-center justify-center rounded-md text-muted-foreground" title="Dark mode"><Moon className="size-4" aria-hidden="true" /><span className="sr-only">Dark mode enabled</span></span></div>
      </header>
      <main id="main-content">{children}</main>
      {commandOpen && <div className="fixed inset-0 z-40 flex items-start justify-center bg-background/80 px-4 pt-[18vh] backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Command menu" onClick={() => setCommandOpen(false)}><div className="w-full max-w-lg rounded-xl border border-border bg-card p-3 shadow-2xl" onClick={(event) => event.stopPropagation()}><label className="flex items-center gap-2 border-b border-border px-3 pb-3 text-sm text-muted-foreground"><Command className="size-4" aria-hidden="true" /><span className="sr-only">Search commands</span><input autoFocus className="w-full bg-transparent outline-none placeholder:text-muted-foreground" placeholder="Search your workspace…" /></label><div className="p-2"><p className="px-2 pb-2 pt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Suggested actions</p>{["Log a decision", "Ask Nova", "Open timeline", "Create project"].map((action) => <button key={action} onClick={() => setCommandOpen(false)} className="flex w-full items-center justify-between rounded-md px-3 py-2.5 text-left text-sm transition-colors hover:bg-accent"><span>{action}</span><ChevronRight className="size-4 text-muted-foreground" /></button>)}</div><Button className="w-full" variant="ghost" onClick={() => setCommandOpen(false)}>Close <span className="ml-auto text-xs text-muted-foreground">Esc</span></Button></div></div>}
    </div>
  );
}
