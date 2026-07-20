"use client";

import type { CSSProperties } from "react";

const particles = Array.from({ length: 12 }, (_, index) => index);

export function AmbientBackground() {
  return (
    <div className="ambient-background" aria-hidden="true">
      <div className="ambient-grid" />
      <div className="ambient-glow ambient-glow-one" />
      <div className="ambient-glow ambient-glow-two" />
      <div className="ambient-noise" />
      {particles.map((particle) => (
        <span
          key={particle}
          className="ambient-particle"
          style={{ "--particle-index": particle } as CSSProperties}
        />
      ))}
    </div>
  );
}
