import { useContext } from "react";
import type { CSSProperties, ReactNode } from "react";

import { ThemeContext } from "./theme";

// Liquid Glass as macOS 26 draws a toolbar control, measured from SwiftUI
// captures in both appearances: the backdrop blurred and pulled toward a tint
// (dark: 0.6 × backdrop + 41, light: 0.45 × backdrop + 135), a specular rim
// brightest at the top and bottom, a hairline darkest at the sides, and a sheen
// along the top and bottom edges.
const BLUR = 7.5;

const TINT = {
  dark: { control: "rgba(102,102,102,0.4)", field: "rgba(158,158,158,0.4)" },
  light: { control: "rgba(245,245,245,0.55)", field: "rgba(230,230,230,0.55)" },
};

// Alpha at a distance from the edge, as a fraction of the corner radius, from
// the rim's brightest point to where it fades out.
const RIM_STOPS = [0, 0.134, 0.293, 0.5, 1];
const RIM = {
  dark: [0.235, 0.1, 0.066, 0.04, 0],
  light: [1, 0.8, 0.8, 0.5, 0],
};
const HAIRLINE_STOPS = [0, 0.134, 0.293];
const HAIRLINE = { dark: [0.67, 0.18, 0], light: [0.23, 0.13, 0] };
const HAIRLINE_BASE = { dark: 0, light: 0.08 };

/** A gradient that mirrors `alphas` from both ends of an axis `length` long. */
const mirrored = (
  direction: string,
  color: string,
  stops: number[],
  alphas: number[],
  radius: number,
  length: number
) => {
  const edge = stops.map(
    (stop, index) => `rgba(${color},${alphas[index]}) ${stop * radius}px`
  );
  const far = stops
    .map(
      (stop, index) =>
        `rgba(${color},${alphas[index]}) ${length - stop * radius}px`
    )
    .toReversed();
  return `linear-gradient(${direction}, ${[...edge, ...far].join(", ")})`;
};

const SHEEN = {
  dark: (height: number) =>
    `linear-gradient(rgba(255,255,255,0.06) 1px, transparent 7px, transparent ${height - 7}px, rgba(255,255,255,0.06) ${height - 1}px)`,
  light: (height: number) =>
    `linear-gradient(#fff 3px, transparent 7.5px, transparent ${height - 9}px, #fff ${height - 4}px), radial-gradient(closest-side, rgba(255,255,255,0.5), transparent)`,
};

const RING_MASK: CSSProperties = {
  mask: "linear-gradient(#000 0 0) content-box exclude, linear-gradient(#000 0 0)",
};

/** A capsule of Liquid Glass; a circle when `width` equals `height`. */
export const Glass = ({
  children,
  height,
  kind = "control",
  style,
  width,
}: {
  children: ReactNode;
  height: number;
  kind?: "control" | "field";
  style?: CSSProperties;
  width: number;
}) => {
  const theme = useContext(ThemeContext);
  const radius = height / 2;
  const layer: CSSProperties = {
    borderRadius: radius,
    inset: 0,
    pointerEvents: "none",
    position: "absolute",
  };

  return (
    <div
      style={{
        alignItems: "center",
        borderRadius: radius,
        boxShadow: theme === "light" ? "0 1px 6px rgba(0,0,0,0.03)" : undefined,
        display: "flex",
        flexShrink: 0,
        height,
        justifyContent: "center",
        position: "relative",
        width,
        ...style,
      }}
    >
      <div
        style={{
          ...layer,
          backdropFilter: `blur(${BLUR}px)`,
          background: TINT[theme][kind],
        }}
      />
      <div style={{ ...layer, background: SHEEN[theme](height) }} />
      <div
        style={{
          ...layer,
          ...RING_MASK,
          background: mirrored(
            "to bottom",
            "255,255,255",
            RIM_STOPS,
            RIM[theme],
            radius,
            height
          ),
          padding: 1,
        }}
      />
      <div
        style={{
          ...layer,
          ...RING_MASK,
          background: `${mirrored(
            "to right",
            "0,0,0",
            HAIRLINE_STOPS,
            HAIRLINE[theme],
            radius,
            width + 1
          )}, rgba(0,0,0,${HAIRLINE_BASE[theme]})`,
          borderRadius: radius + 0.5,
          inset: -0.5,
          padding: 0.5,
        }}
      />
      <div
        style={{
          alignItems: "center",
          display: "flex",
          gap: 4.5,
          position: "relative",
        }}
      >
        {children}
      </div>
    </div>
  );
};
