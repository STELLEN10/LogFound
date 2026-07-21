"use client";

import { CalendarDays, Clock3 } from "lucide-react";
import { useCurrentTime } from "@/hooks/use-current-time";
import { formatDate, formatDayOfWeek, formatTime } from "@/lib/time";

export function LiveClock({ compact = false }: { compact?: boolean }) {
  const { now, timezone, ready } = useCurrentTime();
  if (!ready || !now) {
    return <div className={compact ? "text-right" : "space-y-1"} aria-live="polite" aria-label="Loading local time">--:--:--</div>;
  }

  if (compact) {
    return (
      <div className="text-right" aria-live="polite">
        <p className="flex items-center justify-end gap-1.5 text-xs text-muted-foreground">
          <CalendarDays className="size-3.5 text-primary" />
          {formatDayOfWeek(now)}, {formatDate(now)}
        </p>
        <p className="mt-1 flex items-center justify-end gap-1.5 font-mono text-xs text-foreground">
          <Clock3 className="size-3.5 text-primary" />
          {formatTime(now)} {timezone}
        </p>
      </div>
    );
  }

  return (
    <div aria-live="polite">
      <p className="text-sm font-medium">{formatDayOfWeek(now)}</p>
      <p className="text-xs text-muted-foreground">{formatDate(now)}</p>
      <p className="mt-1 font-mono text-sm text-primary">{formatTime(now)} {timezone}</p>
    </div>
  );
}

