"use client";

import { motion } from "framer-motion";

const nodes = [
  ["Nova", 22, 24],
  ["Atlas", 78, 23],
  ["Echo", 16, 72],
  ["Replay", 84, 72],
  ["GitHub", 30, 86],
  ["Timeline", 70, 86],
  ["Insights", 50, 10],
] as const;

export function ReasoningNetwork() {
  return (
    <div
      className="reasoning-network relative mt-5 min-h-[230px] overflow-hidden rounded-xl border border-primary/20 bg-background/35 p-4"
      aria-label="Founder intelligence network"
      role="img"
    >
      <svg
        className="absolute inset-0 size-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        {nodes.map(([name, x, y]) => (
          <motion.line
            key={name}
            x1="50"
            y1="50"
            x2={x}
            y2={y}
            className="reasoning-link"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: [0.12, 0.65, 0.22] }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              repeatType: "reverse",
              delay: x / 100,
            }}
          />
        ))}
      </svg>
      <div className="absolute left-1/2 top-1/2 flex size-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-primary/60 bg-primary/15 text-center text-[10px] font-semibold uppercase tracking-[0.13em] text-primary shadow-[0_0_30px_hsl(var(--primary)/.18)]">
        Founder
      </div>
      {nodes.map(([name, x, y]) => (
        <motion.div
          key={name}
          className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full border border-border/90 bg-card/90 px-2.5 py-1.5 text-[10px] font-medium text-muted-foreground shadow-lg backdrop-blur-sm"
          style={{ left: `${x}%`, top: `${y}%` }}
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: [0.55, 1, 0.65], scale: [0.96, 1.03, 0.96] }}
          transition={{ duration: 2.2, repeat: Infinity, delay: y / 100 }}
        >
          {name}
        </motion.div>
      ))}
    </div>
  );
}
