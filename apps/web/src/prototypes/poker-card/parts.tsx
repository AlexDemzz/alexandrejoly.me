// PROTOTYPE, throw me away: the gauge, card corners and card back of "All in".
import { useEffect, useState } from "react";
import type { CSSProperties, ReactNode } from "react";

// U+FE0E keeps the suits as text glyphs, not emoji.
export const AUDITS = [
  { label: "Performance", suit: "♠︎" },
  { label: "Accessibility", suit: "♥︎" },
  { label: "Best Practices", suit: "♦︎" },
  { label: "SEO", suit: "♣︎" },
] as const;

export const MarkGlyph = ({ className }: { className?: string }) => (
  <svg
    aria-hidden
    className={className}
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeWidth={1.5}
    viewBox="0 0 24 24"
  >
    <path d="M3 12A9 9 0 1 1 12 21" />
    <path d="M9.5 12H14.5" />
  </svg>
);

// Vercel's mark, from svgl.app: is-agentic is Vercel's audit.
export const VercelLogo = ({ className }: { className?: string }) => (
  <svg
    aria-hidden
    className={className}
    fill="currentColor"
    viewBox="0 0 256 222"
  >
    <path d="m128 0 128 221.705H0z" />
  </svg>
);

export const useCountUp = (active: boolean, delay: number, duration = 900) => {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!active) {
      setValue(0);
      return;
    }
    let frame = 0;
    const start = performance.now() + delay;
    const tick = (now: number) => {
      const progress = Math.min(1, Math.max(0, (now - start) / duration));
      setValue(Math.round((1 - (1 - progress) ** 4) * 100));
      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      }
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [active, delay, duration]);
  return value;
};

export const Gauge = ({
  active,
  delay = 0,
  size,
  label,
}: {
  active: boolean;
  delay?: number;
  size: string;
  label?: string;
}) => {
  const value = useCountUp(active, delay);
  const landed = active && value === 100;
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative" style={{ height: size, width: size }}>
        <svg className="size-full -rotate-90" viewBox="0 0 36 36">
          <circle
            cx="18"
            cy="18"
            fill="none"
            r="16"
            stroke="var(--pk-line)"
            strokeDasharray="0.6 1.4"
            strokeWidth="0.75"
          />
          <circle
            cx="18"
            cy="18"
            fill="none"
            pathLength={100}
            r="16"
            stroke="currentColor"
            strokeDasharray="100"
            strokeDashoffset={active ? 0 : 100}
            strokeLinecap="round"
            strokeOpacity={value > 0 ? 1 : 0}
            strokeWidth="1.25"
            style={{
              transition: active
                ? `stroke-dashoffset 900ms var(--ease-settle) ${delay}ms`
                : "none",
            }}
          />
        </svg>
        <svg
          aria-hidden
          className="ease-settle absolute inset-0 size-full transition-opacity duration-300"
          style={{ opacity: landed ? 1 : 0 }}
          viewBox="0 0 36 36"
        >
          <circle
            cx="18"
            cy="18"
            fill="none"
            r="16"
            stroke="var(--pk-hi)"
            strokeWidth="1.25"
          />
        </svg>
        {landed ? <span aria-hidden className="pk-ping" /> : null}
        <span
          className="text-foreground absolute inset-0 grid place-items-center tabular-nums"
          style={{ fontSize: `calc(${size} * 0.3)` }}
        >
          {value}
        </span>
      </div>
      {label ? (
        <span className="pk-caps text-[clamp(8px,5cqw,14px)] leading-none whitespace-nowrap">
          {label}
        </span>
      ) : null}
    </div>
  );
};

export const CornerIndex = ({
  rank = "100",
  suit,
  flipped = false,
}: {
  rank?: string;
  suit: ReactNode;
  flipped?: boolean;
}) => (
  <div
    className={`absolute flex flex-col items-center gap-[1.5cqw] leading-none ${
      flipped
        ? "end-[5cqw] bottom-[5cqw] rotate-180"
        : "start-[5cqw] top-[5cqw]"
    }`}
  >
    <span className="text-foreground text-[9cqw] tracking-tight tabular-nums">
      {rank}
    </span>
    <span className="text-muted-foreground text-[7cqw]">{suit}</span>
  </div>
);

export const CardBack = ({
  children,
  style,
}: {
  children?: ReactNode;
  style?: CSSProperties;
}) => (
  <div className="pk-face pk-back" style={style}>
    <div className="pk-blueprint absolute inset-[8cqw] rounded-md">
      <div className="pk-axis-x" />
      <div className="pk-axis-y" />
    </div>
    {children}
    <div className="absolute inset-0 grid place-items-center">
      <div className="text-foreground grid size-[30cqw] place-items-center rounded-full bg-[var(--pk-back)] shadow-[0_0_0_1px_var(--pk-line)]">
        <MarkGlyph className="size-[14cqw]" />
      </div>
    </div>
  </div>
);
