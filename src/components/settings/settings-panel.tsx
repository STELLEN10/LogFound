"use client";

import { Bell, Github, Keyboard, Lock, Mic, Palette, ShieldCheck, Sparkles, Users } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { GithubConnectionSettings } from "@/components/github/github-connection-settings";
import { AiProviderSettings } from "@/components/ai/ai-provider-settings";
import { LogoutButton } from "@/components/auth/logout-button";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const themes = [
  { id: "midnight", name: "Midnight", swatch: "bg-cyan-300" },
  { id: "obsidian", name: "Obsidian", swatch: "bg-zinc-300" },
  { id: "ocean", name: "Ocean", swatch: "bg-sky-400" },
  { id: "aurora", name: "Aurora", swatch: "bg-emerald-300" },
  { id: "graphite", name: "Graphite", swatch: "bg-slate-400" },
];

const sections = [
  { title: "Appearance", detail: "Choose the environment that helps you think clearly.", Icon: Palette },
  { title: "Keyboard shortcuts", detail: "Your workspace is designed to stay under your hands.", Icon: Keyboard },
  { title: "Voice", detail: "Wake phrase, transcription, and spoken recommendations.", Icon: Mic },
  { title: "Agents", detail: "Tune the perspectives that join your strategy room.", Icon: Users },
  { title: "GitHub", detail: "Repository context, sync health, and engineering memory.", Icon: Github },
  { title: "Notifications", detail: "Only the signals worth interrupting for.", Icon: Bell },
  { title: "Privacy", detail: "Your founder memory stays in your workspace.", Icon: Lock },
];

export function SettingsPanel() {
  const { theme, setTheme } = useTheme();
  const [demo, setDemo] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => { setDemo(localStorage.getItem("logfound-demo") !== "false"); }, []);

  const toggleDemo = () => {
    const next = !demo;
    setDemo(next);
    localStorage.setItem("logfound-demo", String(next));
  };

  const save = () => {
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1800);
  };

  return <div className="mx-auto w-full max-w-5xl px-5 py-9 sm:px-8 lg:px-10 lg:py-12">
    <section className="animate-rise border-b border-border/70 pb-9">
      <div className="flex items-center justify-between gap-4"><p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">Settings</p><div className="flex items-center gap-2 rounded-lg border border-border bg-card/55 px-2 py-1"><span className="px-1 text-xs text-muted-foreground">Workspace session</span><LogoutButton /></div></div>
      <h1 className="mt-3 text-4xl font-semibold tracking-[-0.035em] sm:text-5xl">Make the workspace yours.</h1>
      <p className="mt-4 max-w-2xl text-lg leading-8 text-muted-foreground">A calm operating system should fit the way you think, speak, decide, and return to the work.</p>
    </section>

    <section className="mt-8 animate-rise animation-delay-1 rounded-xl border border-border bg-card/55 p-6">
      <div className="flex items-start justify-between gap-6">
        <div><p className="flex items-center gap-2 text-sm font-medium"><Palette className="size-4 text-primary" />Premium themes</p><p className="mt-2 text-sm leading-6 text-muted-foreground">Each theme keeps Logfound’s identity while changing the room around your work.</p></div>
        <span className="rounded-full border border-primary/25 bg-primary/[0.08] px-2.5 py-1 text-xs text-primary">{theme || "midnight"}</span>
      </div>
      <div className="mt-6 grid gap-3 sm:grid-cols-5">{themes.map((option) => <button key={option.id} onClick={() => setTheme(option.id)} className={cn("rounded-xl border p-4 text-left transition-all hover:-translate-y-0.5", theme === option.id ? "border-primary bg-primary/[0.08]" : "border-border bg-background/40 hover:border-primary/35")}><span className={cn("block size-5 rounded-full", option.swatch)} /><p className="mt-5 text-sm font-medium">{option.name}</p></button>)}</div>
    </section>

    <section className="mt-6 animate-rise animation-delay-2 rounded-xl border border-primary/20 bg-primary/[0.05] p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="flex items-center gap-2 text-sm font-medium"><Sparkles className="size-4 text-primary" />Demo Mode</p><p className="mt-2 text-sm leading-6 text-muted-foreground">Keep a complete founder workspace filled with realistic projects, decisions, activity, and learning for a confident first look.</p></div><button onClick={toggleDemo} className={cn("relative h-7 w-12 rounded-full transition-colors", demo ? "bg-primary" : "bg-secondary")} aria-pressed={demo} aria-label="Toggle demo mode"><span className={cn("absolute top-1 size-5 rounded-full bg-white transition-transform", demo ? "translate-x-6" : "translate-x-1")} /></button></div>
    </section>

    <GithubConnectionSettings />

    <AiProviderSettings />

    <section className="mt-6 grid gap-3 sm:grid-cols-2">{sections.map(({ title, detail, Icon }) => <article key={title} className="animate-rise animation-delay-3 rounded-xl border border-border bg-card/55 p-5 transition-all hover:-translate-y-0.5 hover:border-primary/30"><Icon className="size-4 text-primary" /><h2 className="mt-6 font-medium">{title}</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">{detail}</p><button className="mt-5 flex items-center gap-1 text-sm text-primary hover:underline">Configure <span aria-hidden="true">→</span></button></article>)}</section>

    <section className="mt-6 flex items-center justify-between rounded-xl border border-border bg-card/55 p-5"><div><p className="flex items-center gap-2 text-sm font-medium"><ShieldCheck className="size-4 text-emerald-300" />Workspace health</p><p className="mt-1 text-sm text-muted-foreground">Everything is synced locally and ready for your next session.</p></div><Button onClick={save} variant="secondary">{saved ? "Saved" : "Save preferences"}</Button></section>
  </div>;
}
