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
// Where the Carbon glyph sits in the menu bar, for the cursor and the menu.
export const GLYPH = { x: 626, y: 12 };

export const MenuBar = ({
  live,
  pressed = false,
}: {
  live: boolean;
  pressed?: boolean;
}) => {
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
          background: pressed ? COLOR.pressed : "transparent",
          borderRadius: 5,
          display: "flex",
          height: 20,
          justifyContent: "center",
          left: GLYPH.x - 13,
          position: "absolute",
          top: 2,
          width: 26,
        }}
      >
        <CarbonMark color={COLOR.label} live={live} size={18} />
      </div>
      <span style={{ fontWeight: 500 }}>Tue Oct 27&nbsp;&nbsp;10:00 AM</span>
    </div>
  );
};

export const TrafficLights = () => (
  <div style={{ display: "flex", gap: 8 }}>
    {["#ff5f57", "#febc2e", "#28c840"].map((color) => (
      <div
        key={color}
        style={{
          background: color,
          borderRadius: 6,
          boxShadow: "inset 0 0 0 0.5px rgba(0,0,0,0.12)",
          height: 12,
          width: 12,
        }}
      />
    ))}
  </div>
);
