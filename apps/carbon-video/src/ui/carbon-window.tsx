import type { CSSProperties, ReactNode } from "react";

import type { Dot } from "../data";
import {
  ATTENDEES,
  DOT_COLORS,
  ROWS,
  SUBTITLE,
  TITLE,
  TRANSCRIPT,
  isUnnamed,
} from "../data";
import { mix, settle } from "../motion";
import { TrafficLights } from "./screen";
import { usePalette } from "./theme";

export const WINDOW = { height: 396, left: 40, top: 36, width: 720 };
export const SIDEBAR_WIDTH = 236;
const ROW_HEIGHT = 46;
const ROWS_TOP = 84;

const TRUNCATE: CSSProperties = {
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};

/** Where a sidebar row sits on the stage, for the cursor and the context menu. */
export const rowCenter = (index: number) => ({
  x: WINDOW.left + SIDEBAR_WIDTH / 2,
  y: WINDOW.top + ROWS_TOP + ROW_HEIGHT * index + ROW_HEIGHT / 2,
});

const Icon = ({ children }: { children: ReactNode }) => {
  const COLOR = usePalette();
  return (
    <svg
      fill="none"
      height={15}
      stroke={COLOR.label}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      viewBox="0 0 16 16"
      width={15}
    >
      {children}
    </svg>
  );
};

const ToolbarButton = ({ children }: { children: ReactNode }) => {
  const COLOR = usePalette();
  return (
    <div
      style={{
        alignItems: "center",
        background: COLOR.toolbar,
        borderRadius: 999,
        boxShadow: `0 0 0 0.5px ${COLOR.separator}, 0 1px 3px rgba(0,0,0,0.08)`,
        display: "flex",
        height: 30,
        justifyContent: "center",
        width: 34,
      }}
    >
      {children}
    </div>
  );
};

const dotColor = (dot: Dot | undefined, selected: boolean) => {
  if (!dot) {
    return "transparent";
  }
  return selected ? "#fff" : DOT_COLORS[dot];
};

const Sidebar = () => {
  const COLOR = usePalette();
  return (
    <div
      style={{
        background: COLOR.sidebar,
        borderRight: `0.5px solid ${COLOR.separator}`,
        flexShrink: 0,
        position: "relative",
        width: SIDEBAR_WIDTH,
      }}
    >
      <div style={{ left: 16, position: "absolute", top: 17 }}>
        <TrafficLights />
      </div>
      <div
        style={{
          alignItems: "center",
          background: COLOR.tertiaryFill,
          borderRadius: 8,
          color: COLOR.secondary,
          display: "flex",
          gap: 6,
          height: 26,
          left: 10,
          padding: "0 8px",
          position: "absolute",
          right: 10,
          top: 46,
        }}
      >
        <Icon>
          <circle cx={7} cy={7} r={4.5} stroke={COLOR.secondary} />
          <path d="m10.5 10.5 3 3" stroke={COLOR.secondary} />
        </Icon>
        Search Meetings
      </div>
      <div style={{ left: 8, position: "absolute", right: 8, top: ROWS_TOP }}>
        {ROWS.map((row, index) => {
          const selected = index === 0;
          return (
            <div
              key={row.title}
              style={{
                alignItems: "baseline",
                background: selected ? COLOR.accent : "transparent",
                borderRadius: 8,
                color: selected ? "#fff" : COLOR.label,
                display: "flex",
                gap: 8,
                height: ROW_HEIGHT,
                padding: "6px 10px",
              }}
            >
              <span
                style={{
                  background: dotColor(row.dot, selected),
                  borderRadius: 4,
                  flexShrink: 0,
                  height: 8,
                  width: 8,
                }}
              />
              <div
                style={{ lineHeight: 1.35, minWidth: 0, overflow: "hidden" }}
              >
                <div style={{ ...TRUNCATE, fontWeight: 600 }}>{row.title}</div>
                <div
                  style={{
                    color: selected
                      ? "rgba(255,255,255,0.85)"
                      : COLOR.secondary,
                    fontSize: 11,
                    ...TRUNCATE,
                  }}
                >
                  {row.metadata}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const Token = ({ name }: { name: string }) => (
  <div
    style={{
      alignItems: "center",
      background: "rgba(118,118,128,0.14)",
      borderRadius: 999,
      display: "flex",
      gap: 6,
      padding: "2px 10px 2px 2px",
    }}
  >
    <span
      style={{
        alignItems: "center",
        background: "rgba(118,118,128,0.28)",
        borderRadius: 999,
        display: "flex",
        fontSize: 8.5,
        fontWeight: 600,
        height: 20,
        justifyContent: "center",
        width: 20,
      }}
    >
      {name
        .split(" ")
        .map((part) => part[0])
        .join("")}
    </span>
    <span style={{ fontSize: 12 }}>{name}</span>
  </div>
);

const HEADING: CSSProperties = {
  fontSize: 15,
  fontWeight: 600,
  margin: "0 0 6px",
};

/**
 * The main window: Meetings in the sidebar, the selected one's participants,
 * then the Transcript in the panel. `reveal` is the frame the panel's
 * content starts to appear, in step order; `scroll` moves the panel up, in pt.
 */
export const CarbonWindow = ({
  frame,
  reveal = -1000,
  scroll = 0,
}: {
  frame: number;
  reveal?: number;
  scroll?: number;
}) => {
  const COLOR = usePalette();
  // Each call reveals the next piece, 6 frames after the one before.
  const steps = { next: 0 };
  const appear = (): CSSProperties => {
    const start = reveal + steps.next * 6;
    steps.next += 1;
    const progress = settle(frame, start, start + 16);
    return {
      opacity: progress,
      transform: `translateY(${mix(4, 0, progress)}px)`,
    };
  };

  return (
    <div
      style={{
        ...WINDOW,
        background: COLOR.window,
        borderRadius: 14,
        boxShadow: COLOR.windowShadow,
        display: "flex",
        overflow: "hidden",
        position: "absolute",
      }}
    >
      <Sidebar />
      <div style={{ flex: 1, minWidth: 0, position: "relative" }}>
        <div
          style={{
            alignItems: "center",
            background: COLOR.toolbarBar,
            backdropFilter: "blur(20px)",
            display: "flex",
            height: 52,
            justifyContent: "space-between",
            left: 0,
            padding: "0 14px 0 22px",
            position: "absolute",
            right: 0,
            top: 0,
            zIndex: 1,
          }}
        >
          <div style={{ lineHeight: 1.25 }}>
            <div style={{ fontSize: 14, fontWeight: 700 }}>{TITLE}</div>
            <div style={{ color: COLOR.secondary, fontSize: 11 }}>
              {SUBTITLE}
            </div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <ToolbarButton>
              <Icon>
                <path d="M8.5 3H4a1.5 1.5 0 0 0-1.5 1.5v7.5A1.5 1.5 0 0 0 4 13.5h7.5A1.5 1.5 0 0 0 13 12V7.5" />
                <path d="m7 9 .5-2L12.5 2l1.5 1.5-5 5z" />
              </Icon>
            </ToolbarButton>
            <ToolbarButton>
              <Icon>
                <circle cx={3.5} cy={8} fill={COLOR.label} r={0.6} />
                <circle cx={8} cy={8} fill={COLOR.label} r={0.6} />
                <circle cx={12.5} cy={8} fill={COLOR.label} r={0.6} />
              </Icon>
            </ToolbarButton>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 14,
            maxWidth: 440,
            padding: "68px 24px 24px",
            transform: `translateY(${-scroll}px)`,
          }}
        >
          <div
            style={{ ...appear(), display: "flex", flexWrap: "wrap", gap: 6 }}
          >
            {ATTENDEES.map((name) => (
              <Token key={name} name={name} />
            ))}
          </div>
          <p style={{ ...HEADING, ...appear(), marginTop: 10 }}>Transcript</p>
          {TRANSCRIPT.map((line) => (
            <div key={`${line.elapsed}-${line.speaker}`} style={appear()}>
              <div
                style={{
                  alignItems: "center",
                  display: "flex",
                  fontSize: 12,
                  gap: 6,
                  marginBottom: 2,
                }}
              >
                <span
                  style={{
                    color: isUnnamed(line.speaker)
                      ? COLOR.accent
                      : COLOR.secondary,
                    fontWeight: 600,
                  }}
                >
                  {line.speaker}
                  {line.speaker === "Me" ? null : (
                    <span style={{ fontSize: 9, marginLeft: 3 }}>⌄</span>
                  )}
                </span>
                <span
                  style={{
                    color: COLOR.secondary,
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {line.elapsed}
                </span>
              </div>
              <div style={{ lineHeight: 1.45 }}>{line.text}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
