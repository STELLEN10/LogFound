"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { formatRelativeTime, formatTimezone, type TimeInput } from "@/lib/time";

type TimeContextValue = {
  now: Date | null;
  ready: boolean;
  sessionStartedAt: Date | null;
  timezone: string;
  relative: (value: TimeInput) => string;
};

const TimeContext = createContext<TimeContextValue | null>(null);
const SESSION_KEY = "logfound-session-started-at";

export function TimeProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const [now, setNow] = useState<Date | null>(null);
  const [sessionStartedAt, setSessionStartedAt] = useState<Date | null>(null);

  useEffect(() => {
    const current = new Date();
    setNow(current);

    const stored = window.sessionStorage.getItem(SESSION_KEY);
    const sessionDate = stored ? new Date(stored) : current;
    const session = Number.isNaN(sessionDate.getTime()) ? current : sessionDate;
    if (!stored) window.sessionStorage.setItem(SESSION_KEY, session.toISOString());
    setSessionStartedAt(session);

    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const value = useMemo<TimeContextValue>(() => ({
    now,
    ready: now !== null,
    sessionStartedAt,
    timezone: now ? formatTimezone(now) : "Local time",
    relative: (input) => (now ? formatRelativeTime(input, now) : "just now"),
  }), [now, sessionStartedAt]);

  return <TimeContext.Provider value={value}>{children}</TimeContext.Provider>;
}

export function useCurrentTime(): TimeContextValue {
  const context = useContext(TimeContext);
  if (!context) throw new Error("useCurrentTime must be used inside TimeProvider");
  return context;
}

