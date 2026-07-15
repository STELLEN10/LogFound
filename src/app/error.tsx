"use client";

import { RefreshCw, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ErrorPage({ reset }: { reset: () => void }) { return <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-2xl items-center px-6"><section className="animate-rise"><span className="flex size-12 items-center justify-center rounded-xl border border-amber-300/25 bg-amber-300/[0.08] text-amber-200"><WifiOff className="size-6" /></span><p className="mt-8 text-xs font-semibold uppercase tracking-[0.22em] text-amber-200">Connection interrupted</p><h1 className="mt-3 text-4xl font-semibold tracking-tight">The workspace lost its signal.</h1><p className="mt-4 max-w-lg leading-7 text-muted-foreground">Logfound kept your local context safe. Try reconnecting; if the service is offline, your recent workspace will remain available.</p><Button className="mt-7" onClick={reset}>Reconnect <RefreshCw className="ml-2 size-4" /></Button></section></div>; }
