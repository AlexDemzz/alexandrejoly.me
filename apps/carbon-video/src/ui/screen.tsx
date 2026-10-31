import type { ReactNode } from "react";
import { AbsoluteFill } from "remotion";

import { CarbonMark } from "./mark";
import { FONT, POINTS, SCALE, usePalette } from "./theme";

/** An 800 × 450 pt stage, scaled to fill the frame; the desktop wallpaper unless told otherwise. */
export const Stage = ({
  children,
  background,
}: {
  children: ReactNode;
  background?: string;
}) => {
  const COLOR = usePalette();
  return (
    <AbsoluteFill style={{ background: background ?? COLOR.wallpaper }}>
      <div
        style={{
          color: COLOR.label,
          fontFamily: FONT,
          fontSize: 13,
          height: POINTS.height,
          left: 0,
          position: "absolute",
          top: 0,
          transform: `scale(${SCALE})`,
          transformOrigin: "0 0",
          WebkitFontSmoothing: "antialiased",
          width: POINTS.width,
        }}
      >
        {children}
      </div>
    </AbsoluteFill>
  );
};

export const MENU_BAR_HEIGHT = 24;
// Carbon's status item grows leftward from this edge, like any status item.
const ITEM_RIGHT = 639;
const ITEM_PADDING = 4;
// The glyph, or the mic meter while live.
const SIDE = 18;

/** Three 2 pt bars that follow the mic; at rest, 2 pt dots. */
const MicMeter = ({ levels }: { levels: readonly number[] }) => {
  const COLOR = usePalette();
  return (
    <svg height={SIDE} viewBox={`0 0 ${SIDE} ${SIDE}`} width={SIDE}>
      {levels.map((level, index) => {
        const height = 2 + level * 10;
        return (
          <rect
            fill={COLOR.label}
            height={height}
            // The bars only differ by position.
            key={index}
            rx={1}
            width={2}
            x={4 + index * 4}
            y={(SIDE - height) / 2}
          />
        );
      })}
    </svg>
  );
};

/**
 * Carbon's status item as of 0.5.0: the glyph when idle, a mic meter while a
 * Meeting is live.
 */
export const MenuBar = ({ live }: { live?: { levels: readonly number[] } }) => {
  const COLOR = usePalette();
  return (
    <div
      style={{
        alignItems: "center",
        backdropFilter: "blur(30px)",
        background: COLOR.menuBar,
        display: "flex",
        fontSize: 13,
        gap: 14,
        height: MENU_BAR_HEIGHT,
        justifyContent: "flex-end",
        left: 0,
        padding: "0 12px",
        position: "absolute",
        right: 0,
        top: 0,
      }}
    >
      <div
        style={{
          alignItems: "center",
          display: "flex",
          height: 20,
          padding: `0 ${ITEM_PADDING}px`,
          position: "absolute",
          right: POINTS.width - ITEM_RIGHT,
          top: 2,
        }}
      >
        {live ? (
          <MicMeter levels={live.levels} />
        ) : (
          <CarbonMark color={COLOR.label} size={SIDE} stroke={1.5} />
        )}
      </div>
      <span style={{ fontWeight: 500 }}>Tue Oct 27&nbsp;&nbsp;10:00 AM</span>
    </div>
  );
};

export const TrafficLights = ({
  gap = 8,
  size = 12,
}: {
  gap?: number;
  size?: number;
}) => (
  <div style={{ display: "flex", gap }}>
    {["#ff5f57", "#febc2e", "#28c840"].map((color) => (
      <div
        key={color}
        style={{
          background: color,
          borderRadius: size / 2,
          boxShadow: "inset 0 0 0 0.5px rgba(0,0,0,0.12)",
          height: size,
          width: size,
        }}
      />
    ))}
  </div>
);
