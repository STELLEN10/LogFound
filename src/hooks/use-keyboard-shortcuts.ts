"use client";

import { useEffect } from "react";

type Shortcut = { key: string; meta?: boolean; shift?: boolean; handler: () => void };

export function useKeyboardShortcuts(shortcuts: Shortcut[]) {
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.defaultPrevented) return;
      const modifier = event.metaKey || event.ctrlKey;
      const shortcut = shortcuts.find((item) => item.key.toLowerCase() === event.key.toLowerCase() && Boolean(item.meta) === modifier && Boolean(item.shift) === event.shiftKey);
      if (shortcut) { event.preventDefault(); shortcut.handler(); }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [shortcuts]);
}
