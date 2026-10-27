import { useCurrentFrame } from "remotion";

import { DOT_COLORS, MARKDOWN_PATH } from "../data";
import { mix, settle, visible } from "../motion";
import { CarbonWindow, rowCenter } from "../ui/carbon-window";
import { Cursor, cursorAt } from "../ui/cursor";
import { MenuBar, Stage } from "../ui/screen";
import { MONO, menuSurface, usePalette } from "../ui/theme";

export const AGENT_FRAMES = 240;

const RIGHT_CLICK = 30;
const COPY_PATH = 66;
const TERMINAL_IN = 82;
const TYPE_FROM = 100;
const PASTE = 150;
const READING = 172;

const ROW = rowCenter(0);
const MENU = { left: ROW.x + 2, top: ROW.y + 2, width: 220 };
const ITEM = 22;

const PROMPT = "Draft the follow-up email from ";
const PATH = MARKDOWN_PATH.replace("~", "/Users/alex");
const FILE_NAME = PATH.split("/").at(-1) ?? PATH;
const CHARS_PER_FRAME = 1;

const CURSOR_PATH = [
  { at: 0, x: 420, y: 320 },
  { at: RIGHT_CLICK - 2, x: ROW.x, y: ROW.y },
  { at: COPY_PATH - 4, x: MENU.left + 60, y: MENU.top + 5 + ITEM / 2 },
];

const ContextItem = ({
  label,
  shortcut,
  highlighted = false,
  destructive = false,
}: {
  label: string;
  shortcut?: string;
  highlighted?: boolean;
  destructive?: boolean;
}) => {
  const COLOR = usePalette();
  let color = destructive ? COLOR.destructive : COLOR.label;
  if (highlighted) {
    color = "#fff";
  }
  return (
    <div
      style={{
        alignItems: "center",
        background: highlighted ? COLOR.accent : "transparent",
        borderRadius: 5,
        color,
        display: "flex",
        height: ITEM,
        justifyContent: "space-between",
        padding: "0 8px",
      }}
    >
      <span>{label}</span>
      {shortcut ? (
        <span style={{ color: highlighted ? "#fff" : COLOR.secondary }}>
          {shortcut}
        </span>
      ) : null}
    </div>
  );
};

const Divider = () => {
  const COLOR = usePalette();
  return (
    <div
      style={{ background: COLOR.separator, height: 1, margin: "5px 8px" }}
    />
  );
};

// Copy Path, Copy Markdown, Reveal in Finder, Edit, the color palette, Delete.
const ContextMenu = ({ frame }: { frame: number }) => {
  const COLOR = usePalette();
  return (
    <div
      style={{
        ...menuSurface(COLOR),
        left: MENU.left,
        opacity: visible(frame, RIGHT_CLICK, COPY_PATH + 6, 4),
        position: "absolute",
        top: MENU.top,
        width: MENU.width,
      }}
    >
      <ContextItem
        highlighted={frame >= COPY_PATH - 4}
        label="Copy Path"
        shortcut="⇧⌘C"
      />
      <ContextItem label="Copy Markdown" shortcut="⌘C" />
      <ContextItem label="Reveal in Finder" />
      <Divider />
      <ContextItem label="Edit" shortcut="↩" />
      <Divider />
      <div style={{ display: "flex", gap: 9, padding: "4px 8px" }}>
        {Object.values(DOT_COLORS).map((color) => (
          <span
            key={color}
            style={{
              background: color,
              borderRadius: 7,
              height: 13,
              width: 13,
            }}
          />
        ))}
      </div>
      <Divider />
      <ContextItem destructive label="Delete" shortcut="⌫" />
    </div>
  );
};

// A generic terminal agent: the copied path is all it needs to read the Meeting.
const Terminal = ({ frame }: { frame: number }) => {
  const enter = settle(frame, TERMINAL_IN, TERMINAL_IN + 18);
  const typed = PROMPT.slice(
    0,
    Math.max(0, Math.floor((frame - TYPE_FROM) * CHARS_PER_FRAME))
  );
  const pasted = frame >= PASTE;
  const caretOn = Math.floor(frame / 15) % 2 === 0;
  const COLOR = usePalette();

  return (
    <div
      style={{
        background: "#1c1c1e",
        borderRadius: 12,
        boxShadow: COLOR.windowShadow,
        color: "#f2f2f7",
        fontFamily: MONO,
        fontSize: 12,
        height: 150,
        left: 150,
        lineHeight: 1.6,
        opacity: enter,
        padding: "34px 18px 16px",
        position: "absolute",
        top: 240,
        transform: `translateY(${mix(24, 0, enter)}px)`,
        width: 560,
      }}
    >
      <div
        style={{
          display: "flex",
          gap: 8,
          left: 14,
          position: "absolute",
          top: 12,
        }}
      >
        {[0, 1, 2].map((dot) => (
          <span
            key={dot}
            style={{
              background: "#48484a",
              borderRadius: 6,
              height: 11,
              width: 11,
            }}
          />
        ))}
      </div>
      <div style={{ wordBreak: "break-all" }}>
        <span style={{ color: "#8e8e93" }}>&gt; </span>
        {typed}
        {pasted ? <span style={{ color: "#64d2ff" }}>{PATH}</span> : null}
        {frame < READING ? (
          <span style={{ opacity: caretOn ? 1 : 0 }}>▍</span>
        ) : null}
      </div>
      <div
        style={{
          color: "#8e8e93",
          marginTop: 8,
          opacity: settle(frame, READING, READING + 12),
        }}
      >
        Reading {FILE_NAME}…
      </div>
    </div>
  );
};

/** Copy Path from the Meeting's menu, paste it to an agent. */
export const AgentScene = () => {
  const frame = useCurrentFrame();
  const cursor = cursorAt(frame, CURSOR_PATH);
  const clicking = [RIGHT_CLICK, COPY_PATH].some(
    (at) => frame >= at - 2 && frame < at + 3
  );

  return (
    <Stage>
      <MenuBar live={false} />
      <CarbonWindow frame={frame} />
      <ContextMenu frame={frame} />
      <Terminal frame={frame} />
      {frame < TERMINAL_IN + 10 ? (
        <Cursor down={clicking} x={cursor.x} y={cursor.y} />
      ) : null}
    </Stage>
  );
};
