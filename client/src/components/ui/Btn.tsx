import React from 'react';
import { T } from '../../theme/tokens';

export function Btn({
  children, variant, size = "sm", onClick, disabled, type = "button"
}: {
  children: React.ReactNode;
  variant: "indigo" | "green" | "red-outline" | "ghost" | "danger" | "white";
  size?: "xs" | "sm" | "md" | "lg";
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
}) {
  const h  = size === "xs" ? 26 : size === "lg" ? 44 : size === "md" ? 36 : 30;
  const px = size === "xs" ? "8px" : size === "lg" ? "20px" : size === "md" ? "16px" : "12px";
  const fs = size === "xs" ? 11 : size === "lg" ? 14 : size === "md" ? 13 : 12;

  const styles: Record<string, React.CSSProperties> = {
    indigo:      { backgroundColor: T.indigo,   color: "#fff",  border: "none" },
    green:       { backgroundColor: T.green,    color: "#fff",  border: "none" },
    "red-outline": { backgroundColor: "transparent", color: T.red, border: `1.5px solid ${T.red}` },
    ghost:       { backgroundColor: "transparent", color: T.muted, border: `1px solid ${T.border}` },
    danger:      { backgroundColor: T.red,      color: "#fff",  border: "none" },
    white:       { backgroundColor: T.white,    color: T.ink,   border: `1px solid ${T.border}`, boxShadow: "0 1px 3px rgba(0,0,0,0.05)" },
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        height: h, padding: `0 ${px}`,
        borderRadius: 6, cursor: disabled ? "default" : "pointer",
        fontFamily: "Inter, sans-serif", fontSize: fs, fontWeight: 600,
        display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6,
        whiteSpace: "nowrap", opacity: disabled ? 0.45 : 1,
        transition: "all 0.15s ease",
        ...styles[variant],
      }}
      onMouseEnter={e => { if (!disabled) (e.currentTarget as HTMLElement).style.filter = "brightness(0.92)"; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.filter = "none"; }}
    >
      {children}
    </button>
  );
}
