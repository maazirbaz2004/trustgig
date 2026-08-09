import React from 'react';

export function Pill({ cfg }: { cfg: { label: string; color: string; bg: string } }) {
  return (
    <span style={{
      display: "inline-block", padding: "2px 9px",
      borderRadius: 4, backgroundColor: cfg.bg,
      fontFamily: "IBM Plex Mono, monospace",
      fontSize: 10.5, fontWeight: 700, color: cfg.color,
      letterSpacing: "0.04em",
    }}>
      {cfg.label}
    </span>
  );
}
