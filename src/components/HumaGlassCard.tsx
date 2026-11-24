import type { ReactNode } from "react";

interface HumaGlassCardProps {
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  showWeave?: boolean;
  showCorners?: boolean;
}

/**
 * Exact SVG translation of `HumaFoldShape` from BeBaduy's `HumaGlassCard.swift`
 * (132x88 coordinate space with dual concentric gold strokes).
 */
function HumaCornerOrnament({ rotated = false }: { rotated?: boolean }) {
  return (
    <svg
      viewBox="0 0 132 88"
      width="132"
      height="88"
      aria-hidden="true"
      className={`pointer-events-none absolute h-[66px] w-[99px] sm:h-[84px] sm:w-[126px] ${
        rotated
          ? "right-0 bottom-0 rotate-180"
          : "top-0 left-0"
      }`}
    >
      {/* Translucent warm gold fill */}
      <path
        d="M0 88 L0 26 Q0 0 26 0 L132 0 C108.24 40.48 87.12 28.16 55.44 36.96 C19.8 42.24 17.16 88 0 88 Z"
        fill="rgba(245, 166, 64, 0.11)"
      />
      {/* Outer gold border */}
      <path
        d="M0.75 87 L0.75 26 Q0.75 0.75 26 0.75 L130.5 0.75 C107.2 40.1 86.4 28.2 55.2 36.8 C20.1 42.0 17.5 86.2 0.75 87 Z"
        fill="none"
        stroke="rgba(245, 166, 64, 0.82)"
        strokeWidth="1"
      />
      {/* Inset secondary gold thread */}
      <path
        d="M4.5 76 L4.5 26 Q4.5 4.5 26 4.5 L118 4.5 C99 34.5 82 25.5 54 33.2 C25 38.2 19 69 4.5 76 Z"
        fill="none"
        stroke="rgba(245, 166, 64, 0.50)"
        strokeWidth="0.75"
      />
    </svg>
  );
}

/**
 * Crisp geometric Baduy tenun dashed-cross pattern inspired by `HumaTenunPattern/tenun.png`.
 */
function HumaTenunWeave() {
  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.13]"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern
          id="huma-tenun-motif"
          width="44"
          height="52"
          patternUnits="userSpaceOnUse"
        >
          {/* Twin vertical woven threads */}
          <line
            x1="20"
            y1="2"
            x2="20"
            y2="50"
            stroke="#F5A640"
            strokeWidth="1.4"
            strokeDasharray="4 3 1.5 3"
            strokeLinecap="round"
          />
          <line
            x1="24"
            y1="2"
            x2="24"
            y2="50"
            stroke="#F5A640"
            strokeWidth="1.4"
            strokeDasharray="4 3 1.5 3"
            strokeLinecap="round"
          />
          {/* Cross-arm woven motifs */}
          <path
            d="M8 24 H16 M28 24 H36 M8 28 H16 M28 28 H36"
            stroke="#F5A640"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
          <circle cx="4" cy="26" r="1" fill="#F5A640" />
          <circle cx="40" cy="26" r="1" fill="#F5A640" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#huma-tenun-motif)" />
    </svg>
  );
}

export function HumaGlassCard({
  children,
  className = "",
  contentClassName = "",
  showWeave = true,
  showCorners = true,
}: HumaGlassCardProps) {
  return (
    <div
      className={`relative overflow-hidden rounded-[26px] border border-[#f5a640]/70 bg-[#2a1d13]/84 shadow-[0_24px_60px_-20px_rgba(12,7,4,0.78),inset_0_1px_0_rgba(255,232,198,0.14)] backdrop-blur-[18px] ${className}`}
    >
      {showWeave ? <HumaTenunWeave /> : null}
      {showCorners ? (
        <>
          <HumaCornerOrnament />
          <HumaCornerOrnament rotated />
        </>
      ) : null}
      <div className={`relative z-10 ${contentClassName}`}>{children}</div>
    </div>
  );
}
