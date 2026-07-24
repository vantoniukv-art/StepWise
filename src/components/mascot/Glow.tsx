"use client";

import { cn } from "@/lib/utils";

export type GlowState = "neutral" | "thinking" | "celebrating";

interface GlowProps {
  state?: GlowState;
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
}

const SIZE_PX = { xs: 18, sm: 32, md: 56, lg: 88 };

const EYE_COLOR = "#332a4d";

const MASK_IMAGE = "radial-gradient(circle, black 0%, black 60%, transparent 87%)";

function GlowFace({ state }: { state: GlowState }) {
  if (state === "thinking") {
    return (
      <>
        <ellipse cx="41" cy="48.5" rx="3.4" ry="2.3" fill={EYE_COLOR} />
        <ellipse cx="59" cy="48.5" rx="3.4" ry="2.3" fill={EYE_COLOR} />
        <circle cx="50" cy="59" r="2.1" fill={EYE_COLOR} />
      </>
    );
  }

  if (state === "celebrating") {
    return (
      <>
        <path d="M 36.5 49 Q 41 44 45.5 49" stroke={EYE_COLOR} strokeWidth="2.4" fill="none" strokeLinecap="round" />
        <path d="M 54.5 49 Q 59 44 63.5 49" stroke={EYE_COLOR} strokeWidth="2.4" fill="none" strokeLinecap="round" />
        <path d="M 41 56.5 Q 50 66 59 56.5 Q 50 61.5 41 56.5 Z" fill={EYE_COLOR} />
      </>
    );
  }

  return (
    <>
      <circle cx="41" cy="49" r="4.3" fill={EYE_COLOR} />
      <circle cx="39.4" cy="47.3" r="1.3" fill="#fff" />
      <circle cx="59" cy="49" r="4.3" fill={EYE_COLOR} />
      <circle cx="57.4" cy="47.3" r="1.3" fill="#fff" />
      <path d="M 44 58 Q 50 62.5 56 58" stroke={EYE_COLOR} strokeWidth="2.2" fill="none" strokeLinecap="round" />
    </>
  );
}

/**
 * Hand-drawn SVG fallback, kept in code but not rendered by default —
 * the app uses the illustrated glow-mascot.png cropped from the design
 * reference instead. Swap Glow's body back to this if the image asset
 * is ever removed.
 */
export function GlowSvgFallback({ state = "neutral", size = "md", className }: GlowProps) {
  const box = SIZE_PX[size];
  const svgSize = box * 0.94;

  return (
    <div
      className={cn("relative flex items-center justify-center", className)}
      style={{ width: box, height: box }}
      aria-hidden="true"
    >
      <div
        className={cn(
          "absolute rounded-full",
          state === "neutral" && "animate-glow-pulse",
          state === "thinking" && "animate-glow-pulse [animation-duration:0.9s]",
          state === "celebrating" && "animate-glow-celebrate"
        )}
        style={{
          width: state === "celebrating" ? box * 1.25 : box,
          height: state === "celebrating" ? box * 1.25 : box,
          background:
            state === "celebrating"
              ? "radial-gradient(circle, color-mix(in oklab, var(--accent) 75%, transparent) 0%, transparent 70%)"
              : "radial-gradient(circle, color-mix(in oklab, var(--accent) 50%, transparent) 0%, transparent 72%)",
        }}
      />

      <svg
        width={svgSize}
        height={svgSize}
        viewBox="0 0 100 100"
        className={cn("relative", state === "celebrating" && "animate-glow-celebrate")}
      >
        <defs>
          <radialGradient id="glow-body-grad" cx="42%" cy="32%" r="75%">
            <stop offset="0%" stopColor="#fff6dc" />
            <stop offset="55%" stopColor="#f6c94a" />
            <stop offset="100%" stopColor="#e0a53a" />
          </radialGradient>
          <radialGradient id="glow-bottom-grad" cx="50%" cy="45%" r="55%">
            <stop offset="0%" stopColor="#fffbe8" stopOpacity="0.95" />
            <stop offset="60%" stopColor="#ffe27a" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#ffe27a" stopOpacity="0" />
          </radialGradient>
          <clipPath id="glow-body-clip">
            <circle cx="50" cy="50" r="26" />
          </clipPath>
        </defs>

        {/* wings */}
        <ellipse cx="27" cy="34" rx="13" ry="8" fill="#ffffff" opacity="0.32" transform="rotate(-24 27 34)" />
        <ellipse cx="73" cy="34" rx="13" ry="8" fill="#ffffff" opacity="0.32" transform="rotate(24 73 34)" />

        {/* antennae */}
        <path d="M 41 26 Q 34 16 30 9" stroke="#c98a2e" strokeWidth="2" fill="none" strokeLinecap="round" />
        <circle cx="30" cy="9" r="1.6" fill="#c98a2e" />
        <path d="M 59 26 Q 66 16 70 9" stroke="#c98a2e" strokeWidth="2" fill="none" strokeLinecap="round" />
        <circle cx="70" cy="9" r="1.6" fill="#c98a2e" />

        {/* body */}
        <circle cx="50" cy="50" r="26" fill="url(#glow-body-grad)" />
        <g clipPath="url(#glow-body-clip)">
          <ellipse cx="50" cy="68" rx="18" ry="13" fill="url(#glow-bottom-grad)" />
        </g>

        <GlowFace state={state} />
      </svg>

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

export function Glow({ state = "neutral", size = "md", className }: GlowProps) {
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
          state === "neutral" && "animate-glow-pulse",
          state === "thinking" && "animate-glow-pulse [animation-duration:0.9s]",
          state === "celebrating" && "animate-glow-celebrate"
        )}
        style={{
          width: state === "celebrating" ? box * 1.25 : box,
          height: state === "celebrating" ? box * 1.25 : box,
          background:
            state === "celebrating"
              ? "radial-gradient(circle, color-mix(in oklab, var(--accent) 75%, transparent) 0%, transparent 70%)"
              : "radial-gradient(circle, color-mix(in oklab, var(--accent) 50%, transparent) 0%, transparent 72%)",
        }}
      />

      {/* eslint-disable-next-line @next/next/no-img-element -- needs CSS mask-image, which next/image's wrapper markup doesn't play nicely with */}
      <img
        src="/glow-mascot.png"
        alt=""
        className={cn(
          "relative object-cover",
          state === "neutral" && "animate-glow-pulse",
          state === "thinking" && "animate-glow-pulse [animation-duration:0.9s]",
          state === "celebrating" && "animate-glow-celebrate"
        )}
        style={{
          width: box,
          height: box,
          maskImage: MASK_IMAGE,
          WebkitMaskImage: MASK_IMAGE,
        }}
      />

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
