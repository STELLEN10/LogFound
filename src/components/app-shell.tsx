"use client";

import {
  Bot,
  Command,
  Compass,
  Github,
  Home,
  Keyboard,
  Mic,
  PlayCircle,
  Search,
  Settings2,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Onboarding } from "@/components/experience/onboarding";
import { LogfoundLogo } from "@/components/brand/logfound-logo";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";

const commands = [
  {
    label: "Open dashboard",
    detail: "Your founder workspace",
    Icon: Compass,
    path: "/",
  },
  {
    label: "Ask Nova",
    detail: "Open the strategy room",
    Icon: Sparkles,
    path: "/intelligence",
  },
  {
    label: "Open AI workspace",
    detail: "Run the secured GPT-5.6 layer",
    Icon: Bot,
    path: "/ai",
  },
  {
    label: "Open GitHub Intelligence",
    detail: "Understand repository movement",
    Icon: Github,
    path: "/github",
  },
  {
    label: "Launch Voice Workspace",
    detail: "Think with the full context in mind",
    Icon: Mic,
    path: "/voice",
  },
  {
    label: "Replay a decision",
    detail: "Trace the story behind the work",
    Icon: PlayCircle,
    path: "/replay",
  },
  {
    label: "Open collaboration",
    detail: "Projects, people, and shared memory",
    Icon: Users,
    path: "/collaboration",
  },
  {
    label: "Open settings",
    detail: "Theme, voice, privacy, and shortcuts",
    Icon: Settings2,
    path: "/settings",
  },
  {
    label: "Start product tour",
    detail: "A guided Logfound introduction",
    Icon: Keyboard,
    path: "tour",
  },
];
const navItems = [
  { label: "Dashboard", href: "/", Icon: Home },
  { label: "Intelligence", href: "/intelligence", Icon: Sparkles },
  { label: "GitHub", href: "/github", Icon: Github },
  { label: "Voice", href: "/voice", Icon: Mic },
  { label: "Replay", href: "/replay", Icon: PlayCircle },
  { label: "Collaborate", href: "/collaboration", Icon: Users },
] as const;

export function AppShell({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();
  const reducedMotion = useReducedMotion();
  const [commandOpen, setCommandOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const openCommand = useCallback(() => {
    setQuery("");
    setCommandOpen(true);
  }, []);
  const openTour = useCallback(() => setOnboardingOpen(true), []);
  const results = useMemo(() => {
    const term = query.toLowerCase();
    return commands.filter((item) =>
      `${item.label} ${item.detail}`.toLowerCase().includes(term),
    );
  }, [query]);
  useEffect(() => {
    if (!localStorage.getItem("logfound-onboarded")) setOnboardingOpen(true);
    window.addEventListener("logfound:command", openCommand);
    window.addEventListener("logfound:onboarding", openTour);
    return () => {
      window.removeEventListener("logfound:command", openCommand);
      window.removeEventListener("logfound:onboarding", openTour);
    };
  }, [openCommand, openTour]);
  const go = (path: string) => {
    setCommandOpen(false);
    if (path === "tour") {
      openTour();
      return;
    }
    window.location.assign(path);
  };
  useKeyboardShortcuts([
    { key: "k", meta: true, handler: openCommand },
    {
      key: "v",
      meta: true,
      shift: true,
      handler: () => window.location.assign("/voice"),
    },
    {
      key: "p",
      meta: true,
      shift: true,
      handler: () => window.location.assign("/replay"),
    },
    {
      key: "w",
      meta: true,
      shift: true,
      handler: () => window.location.assign("/replay#weekly-review"),
    },
    {
      key: "d",
      meta: true,
      shift: true,
      handler: () => window.location.assign("/replay#founder-dna"),
    },
    {
      key: "f",
      meta: true,
      shift: true,
      handler: () => window.location.assign("/collaboration"),
    },
    {
      key: "l",
      meta: true,
      shift: true,
      handler: () => window.location.assign("/collaboration"),
    },
    {
      key: "t",
      meta: true,
      shift: true,
      handler: () => window.location.assign("/collaboration"),
    },
    { key: "/", handler: openCommand },
    { key: "Escape", handler: () => setCommandOpen(false) },
  ]);
  if (pathname === "/login") return <>{children}</>;
  return (
    <div className="min-h-screen bg-background text-foreground">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
      >
        Skip to content
      </a>
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border/60 bg-background/75 px-5 backdrop-blur-xl sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            href="/"
            className="rounded-lg transition-transform duration-300 hover:scale-[1.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Logfound home"
          >
            <LogfoundLogo />
          </Link>
          <span className="hidden rounded-full border border-primary/20 bg-primary/[0.07] px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.14em] text-primary sm:block">
            Demo
          </span>
          <nav
            className="hidden items-center gap-1 xl:flex"
            aria-label="Primary navigation"
          >
            {navItems.map(({ label, href, Icon }) => {
              const active =
                href === "/" ? pathname === href : pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href as Route}
                  aria-current={active ? "page" : undefined}
                  className={`group relative flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${active ? "bg-primary/[0.1] text-primary shadow-[inset_0_0_18px_hsl(var(--primary)/.06)]" : "text-muted-foreground hover:bg-accent/70 hover:text-foreground"}`}
                >
                  <Icon className="size-3.5 transition-transform duration-300 group-hover:-rotate-3 group-hover:scale-110" />
                  {label}
                  <span
                    className={`absolute inset-x-2 -bottom-[1px] h-px origin-center rounded-full bg-primary transition-transform duration-300 ${active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-70"}`}
                  />
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={openCommand}
            aria-label="Open Command Center"
            className="command-pulse"
          >
            <Command className="mr-2 size-4" />
            Command{" "}
            <kbd className="ml-2 rounded border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground">
              Ctrl K
            </kbd>
          </Button>
          <Link
            href={"/settings" as Route}
            className="flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            aria-label="Open settings"
          >
            <Settings2 className="size-4" />
          </Link>
        </div>
      </header>
      <nav
        className="sticky top-16 z-20 flex gap-1 overflow-x-auto border-b border-border/50 bg-background/70 px-4 py-2 backdrop-blur-xl xl:hidden"
        aria-label="Mobile navigation"
      >
        {navItems.map(({ label, href, Icon }) => {
          const active =
            href === "/" ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href as Route}
              aria-current={active ? "page" : undefined}
              className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${active ? "bg-primary/[0.1] text-primary" : "text-muted-foreground hover:bg-accent/70 hover:text-foreground"}`}
            >
              <Icon className="size-3.5" />
              {label}
            </Link>
          );
        })}
      </nav>
      <motion.main
        key={pathname}
        id="main-content"
        initial={reducedMotion ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={
          reducedMotion
            ? { duration: 0 }
            : { duration: 0.3, ease: [0.22, 1, 0.36, 1] }
        }
      >
        {children}
      </motion.main>
      <Onboarding
        open={onboardingOpen}
        close={() => setOnboardingOpen(false)}
      />
      {commandOpen && (
        <div
          className="fixed inset-0 z-40 flex items-start justify-center bg-background/80 p-4 pt-[12vh] backdrop-blur-md"
          role="dialog"
          aria-modal="true"
          aria-label="Command Center"
          onClick={() => setCommandOpen(false)}
        >
          <section
            className="w-full max-w-2xl overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center gap-3 border-b border-border px-5 py-4">
              <Search className="size-5 text-primary" />
              <input
                autoFocus
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="w-full bg-transparent text-base outline-none placeholder:text-muted-foreground"
                placeholder="Search your workspace, navigate, or run a command…"
              />
              <button
                onClick={() => setCommandOpen(false)}
                aria-label="Close Command Center"
              >
                <X className="size-4 text-muted-foreground" />
              </button>
            </div>
            <div className="p-3">
              <p className="px-2 pb-2 pt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Command Center
              </p>
              {results.map((item) => (
                <button
                  key={item.label}
                  onClick={() => go(item.path)}
                  className="group flex w-full items-center gap-3 rounded-xl p-3 text-left transition-colors hover:bg-accent"
                >
                  <span className="flex size-9 items-center justify-center rounded-lg border border-border bg-background text-primary">
                    <item.Icon className="size-4" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-medium">
                      {item.label}
                    </span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">
                      {item.detail}
                    </span>
                  </span>
                  <span className="ml-auto text-xs text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
                    Open
                  </span>
                </button>
              ))}
              {results.length === 0 && (
                <p className="px-3 py-10 text-center text-sm text-muted-foreground">
                  No matching command. Try “voice”, “replay”, “settings”, or
                  “GitHub”.
                </p>
              )}
            </div>
            <div className="flex items-center justify-between border-t border-border px-5 py-3 text-xs text-muted-foreground">
              <span>Search · navigate · run actions</span>
              <span>Esc to close</span>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
