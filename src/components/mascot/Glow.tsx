"use client";

import { cn } from "@/lib/utils";

export type GlowState = "idle" | "thinking" | "celebrating";

interface GlowProps {
  state?: GlowState;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const SIZE_PX = { sm: 32, md: 56, lg: 88 };

export function Glow({ state = "idle", size = "md", className }: GlowProps) {
  const box = SIZE_PX[size];

  return (
    <div
      className={cn("relative flex items-center justify-center", className)}
      style={{ width: box, height: box }}
      aria-hidden="true"
    >
      <div
        className={cn(
          "absolute rounded-full",
          state === "idle" && "animate-glow-pulse",
          state === "thinking" && "animate-glow-pulse [animation-duration:0.9s]"
        )}
        style={{
          width: box,
          height: box,
          background: "radial-gradient(circle, color-mix(in oklab, var(--accent) 55%, transparent) 0%, transparent 72%)",
        }}
      />
      <div
        className={cn(
          "relative flex items-center justify-center rounded-full",
          state === "celebrating" && "animate-glow-celebrate"
        )}
        style={{
          width: box * 0.62,
          height: box * 0.62,
          background: "radial-gradient(circle at 35% 30%, #fff8e0, var(--accent) 55%, #b8860b 100%)",
          boxShadow: "0 0 18px color-mix(in oklab, var(--accent) 60%, transparent)",
          fontSize: box * 0.34,
        }}
      >
        🐝
      </div>

      {state === "celebrating" &&
        Array.from({ length: 6 }).map((_, i) => {
          const angle = (i / 6) * Math.PI * 2;
          const radius = box * 0.75;
          const tx = Math.cos(angle) * radius;
          const ty = Math.sin(angle) * radius;
          return (
            <span
              key={i}
              className="absolute rounded-full bg-accent animate-particle-burst"
              style={
                {
                  width: 5,
                  height: 5,
                  left: "50%",
                  top: "50%",
                  "--tx": `${tx}px`,
                  "--ty": `${ty}px`,
                } as React.CSSProperties
              }
            />
          );
        })}
    </div>
  );
}
