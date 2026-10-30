import type { CSSProperties, ReactNode } from "react";

import type { Dot } from "../data";
import {
  ATTENDEES,
  DOT_COLORS,
  HEADER_DETAILS,
  ROWS,
  TITLE,
  TRANSCRIPT,
  isUnnamed,
} from "../data";
import { mix, settle } from "../motion";
import { Glass } from "./glass";
import { TrafficLights } from "./screen";
import { SFSymbol } from "./symbols";
import { usePalette } from "./theme";

export const WINDOW = { height: 396, left: 40, top: 36, width: 720 };
export const SIDEBAR_WIDTH = 236;
const ROW_HEIGHT = 47;
const ROWS_TOP = 98;
// macOS 26 toolbar controls: 36 pt glass circles, 8 pt apart and from the edge.
const CONTROL = 36;
const CONTROL_INSET = 8;

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
      <div style={{ left: 19, position: "absolute", top: 19 }}>
        <TrafficLights gap={9} size={14} />
      </div>
      <Glass
        height={CONTROL}
        style={{
          position: "absolute",
          right: CONTROL_INSET,
          top: CONTROL_INSET,
        }}
        width={CONTROL}
      >
        <SFSymbol name="sidebar.left" />
      </Glass>
      <Glass
        height={28}
        kind="field"
        style={{
          color: COLOR.secondary,
          justifyContent: "flex-start",
          left: 10,
          paddingLeft: 8.5,
          position: "absolute",
          top: 61,
        }}
        width={SIDEBAR_WIDTH - 20}
      >
        <SFSymbol name="magnifyingglass" />
        Search Meetings
      </Glass>
      <div style={{ left: 10, position: "absolute", right: 10, top: ROWS_TOP }}>
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
                padding: "6px 10px 6px 6px",
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

// How far a badge's name sits inside its border, for lining it up with text.
const BADGE_INSET = 6;

/** A person's name in a bordered badge, as in the header and the Transcript. */
const Badge = ({
  bordered = true,
  color,
  name,
  weight = 400,
}: {
  bordered?: boolean;
  color: string;
  name: string;
  weight?: number;
}) => {
  const COLOR = usePalette();
  return (
    <span
      style={{
        border: `1px solid ${bordered ? COLOR.quaternary : "transparent"}`,
        borderRadius: 5,
        color,
        fontWeight: weight,
        padding: `0 ${BADGE_INSET - 1}px`,
      }}
    >
      {name}
    </span>
  );
};

const HeaderLine = ({
  children,
  label,
}: {
  children: ReactNode;
  label: string;
}) => {
  const COLOR = usePalette();
  return (
    <div style={{ alignItems: "baseline", display: "flex", gap: 7 }}>
      <span>{label}:</span>
      <div style={{ color: COLOR.secondary }}>{children}</div>
    </div>
  );
};

const HEADING: CSSProperties = {
  fontSize: 15,
  fontWeight: 600,
  margin: "0 0 6px",
};

/**
 * The main window: Meetings in the sidebar, the selected one's header (its
 * details and participants), then the Transcript in the panel. `reveal` is the frame the panel's
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
            padding: `0 ${CONTROL_INSET}px 0 22px`,
            position: "absolute",
            right: 0,
            top: 0,
            zIndex: 1,
          }}
        >
          <div style={{ fontSize: 14, fontWeight: 700 }}>{TITLE}</div>
          <div style={{ color: COLOR.controlLabel, display: "flex", gap: 8 }}>
            <Glass height={CONTROL} width={CONTROL}>
              <SFSymbol name="square.and.pencil" />
            </Glass>
            <Glass height={CONTROL} width={CONTROL}>
              <SFSymbol name="ellipsis" />
            </Glass>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 16,
            maxWidth: 440,
            padding: "62px 24px 24px",
            transform: `translateY(${-scroll}px)`,
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              fontSize: 12,
              gap: 4,
            }}
          >
            <div
              style={{
                ...appear(),
                display: "flex",
                flexDirection: "column",
                gap: 4,
              }}
            >
              {HEADER_DETAILS.map((detail) => (
                <HeaderLine key={detail.label} label={detail.label}>
                  {detail.value}
                </HeaderLine>
              ))}
            </div>
            <div style={appear()}>
              <HeaderLine label="With">
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                  {ATTENDEES.map((name) => (
                    <Badge color={COLOR.secondary} key={name} name={name} />
                  ))}
                </div>
              </HeaderLine>
            </div>
            <div
              style={{
                ...appear(),
                borderTop: `1px solid ${COLOR.separator}`,
                marginTop: 12,
              }}
            />
          </div>
          <p style={{ ...HEADING, ...appear() }}>Transcript</p>
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
                <span style={{ marginLeft: -BADGE_INSET }}>
                  <Badge
                    bordered={line.speaker !== "Me"}
                    color={isUnnamed(line.speaker) ? COLOR.accent : COLOR.label}
                    name={line.speaker}
                    weight={600}
                  />
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
