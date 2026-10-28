import type { CSSProperties } from "react";
import { useCurrentFrame } from "remotion";

import {
  ATTENDEES,
  LANGUAGE,
  MEETING_LANGUAGES,
  OTHER_LANGUAGE,
  PROVIDER,
  STARTED_AT,
  TITLE,
} from "../data";
import { mix, settle, visible } from "../motion";
import { Cursor, cursorAt } from "../ui/cursor";
import { CarbonMark } from "../ui/mark";
import { GLYPH, MenuBar, Stage, TrafficLights } from "../ui/screen";
import { menuSurface, usePalette } from "../ui/theme";

export const DETECT_FRAMES = 270;

// Local frames of the scene.
const ZOOM_IN = 4;
const DETECTED = 30;
const NOTIFICATION_OUT = 120;
const MENU_OPEN = 152;
const SUBMENU_OPEN = 182;
const MENU_CLOSE = 212;
const LEAVE = 240;

// The camera leans into the menu bar while the dot turns red.
const ZOOM = 1.6;
const ZOOM_ORIGIN = { x: 790, y: 0 };

const CALL = { height: 330, left: 70, top: 60, width: 520 };
const LEAVE_BUTTON = { height: 28, left: 370, top: 354, width: 64 };
const MENU = { left: 524, top: 28, width: 270 };
const MENU_ITEM = 22;
const MENU_DIVIDER = 11;
const LANGUAGE_ITEM_TOP = MENU.top + 5 + MENU_ITEM * 5 + MENU_DIVIDER;

const CURSOR_PATH = [
  { at: 0, x: 360, y: 300 },
  { at: MENU_OPEN - 2, x: GLYPH.x, y: GLYPH.y },
  { at: SUBMENU_OPEN - 2, x: 610, y: LANGUAGE_ITEM_TOP + MENU_ITEM / 2 },
  {
    at: LEAVE - 2,
    x: LEAVE_BUTTON.left + LEAVE_BUTTON.width / 2,
    y: LEAVE_BUTTON.top + LEAVE_BUTTON.height / 2,
  },
];

const isClicking = (frame: number) =>
  [MENU_OPEN, LEAVE].some((at) => frame >= at - 2 && frame < at + 3);

const PEOPLE = [...ATTENDEES, "Me"];

const initials = (name: string) =>
  name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("");

const CallWindow = ({ frame }: { frame: number }) => {
  const COLOR = usePalette();
  const speaking = Math.floor(frame / 28) % PEOPLE.length;
  const leaving = settle(frame, LEAVE + 4, LEAVE + 16);

  return (
    <div
      style={{
        ...CALL,
        background: "#1f1f21",
        borderRadius: 12,
        boxShadow: COLOR.windowShadow,
        opacity: 1 - leaving,
        overflow: "hidden",
        position: "absolute",
        transform: `scale(${mix(1, 0.97, leaving)})`,
      }}
    >
      <div
        style={{
          alignItems: "center",
          background: COLOR.callChrome,
          display: "flex",
          gap: 14,
          height: 32,
          padding: "0 12px",
        }}
      >
        <TrafficLights />
        <div
          style={{
            background: COLOR.field,
            borderRadius: 7,
            color: COLOR.secondary,
            flex: 1,
            fontSize: 11.5,
            padding: "3px 10px",
            textAlign: "center",
          }}
        >
          meet.google.com/qrt-mnbv-kaz
        </div>
      </div>
      <div
        style={{
          display: "grid",
          gap: 6,
          gridTemplateColumns: "1fr 1fr",
          gridTemplateRows: "1fr 1fr",
          height: CALL.height - 32 - 50,
          padding: 6,
        }}
      >
        {PEOPLE.map((name, index) => (
          <div
            key={name}
            style={{
              alignItems: "center",
              background: "#2c2c2f",
              borderRadius: 8,
              boxShadow:
                index === speaking ? "inset 0 0 0 2px #8ab4f8" : undefined,
              display: "flex",
              justifyContent: "center",
              position: "relative",
            }}
          >
            <div
              style={{
                alignItems: "center",
                background: "#4a4a4f",
                borderRadius: 999,
                color: "#fff",
                display: "flex",
                fontSize: 15,
                fontWeight: 600,
                height: 44,
                justifyContent: "center",
                width: 44,
              }}
            >
              {initials(name)}
            </div>
            <span
              style={{
                bottom: 6,
                color: "#e8e8e8",
                fontSize: 10.5,
                left: 8,
                position: "absolute",
              }}
            >
              {name}
            </span>
          </div>
        ))}
      </div>
      <div
        style={{
          ...LEAVE_BUTTON,
          alignItems: "center",
          background: "#ea4335",
          borderRadius: 14,
          color: "#fff",
          display: "flex",
          fontSize: 11.5,
          fontWeight: 600,
          justifyContent: "center",
          left: LEAVE_BUTTON.left - CALL.left,
          position: "absolute",
          top: LEAVE_BUTTON.top - CALL.top,
        }}
      >
        Leave
      </div>
      {[-84, -44].map((offset) => (
        <div
          key={offset}
          style={{
            background: "#3c3c40",
            borderRadius: 14,
            height: 28,
            left: LEAVE_BUTTON.left - CALL.left + offset,
            position: "absolute",
            top: LEAVE_BUTTON.top - CALL.top,
            width: 32,
          }}
        />
      ))}
    </div>
  );
};

const ACTION: CSSProperties = {
  borderRadius: 999,
  flex: 1,
  fontSize: 11.5,
  fontWeight: 500,
  padding: "4px 0",
  textAlign: "center",
};

// "Transcribing in <language>", "<title> · <Provider>", Stop and one
// "Switch to <language>" per other Meeting Language.
const Notification = ({ frame }: { frame: number }) => {
  const COLOR = usePalette();
  const action = { ...ACTION, background: COLOR.tertiaryFill };
  const enter = settle(frame, DETECTED, DETECTED + 18);
  const exit = settle(frame, NOTIFICATION_OUT, NOTIFICATION_OUT + 14);

  return (
    <div
      style={{
        ...menuSurface(COLOR),
        borderRadius: 16,
        opacity: enter * (1 - exit),
        padding: 10,
        position: "absolute",
        right: 10,
        top: 32,
        transform: `translateX(${mix(320, 0, enter) + mix(0, 320, exit)}px)`,
        width: 300,
      }}
    >
      <div style={{ display: "flex", gap: 10 }}>
        <div
          style={{
            alignItems: "center",
            background: "#fff",
            borderRadius: 8,
            boxShadow: "0 0 0 0.5px rgba(0,0,0,0.15)",
            display: "flex",
            flexShrink: 0,
            height: 34,
            justifyContent: "center",
            width: 34,
          }}
        >
          {/* The app icon: the mark in carbon black on white, in either appearance. */}
          <CarbonMark color="#1d1d1f" size={24} />
        </div>
        <div style={{ flex: 1, lineHeight: 1.3, minWidth: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <strong style={{ fontSize: 12.5 }}>
              Transcribing in {LANGUAGE}
            </strong>
            <span style={{ color: COLOR.secondary, fontSize: 11 }}>now</span>
          </div>
          <div style={{ fontSize: 12 }}>
            {TITLE} · {PROVIDER}
          </div>
        </div>
      </div>
      <div style={{ display: "flex", gap: 6, marginTop: 9 }}>
        <div style={{ ...action, color: COLOR.destructive }}>Stop</div>
        <div style={action}>Switch to {OTHER_LANGUAGE}</div>
      </div>
    </div>
  );
};

type MenuEntry =
  | { kind: "divider" }
  | {
      kind: "item";
      label: string;
      shortcut?: string;
      muted?: boolean;
      submenu?: boolean;
    };

const MENU_ENTRIES: MenuEntry[] = [
  { kind: "item", label: `Transcribing “${TITLE}”`, muted: true },
  { kind: "item", label: `${PROVIDER} · since ${STARTED_AT}`, muted: true },
  { kind: "item", label: "Stop and Discard" },
  { kind: "divider" },
  { kind: "item", label: "Show Carbon", shortcut: "⌥⌘C" },
  { kind: "item", label: "Reveal in Finder" },
  { kind: "item", label: "Transcribing In", submenu: true },
  { kind: "divider" },
  { kind: "item", label: "Check for Updates…" },
  { kind: "item", label: "Settings…", shortcut: "⌘," },
  { kind: "divider" },
  { kind: "item", label: "Quit Carbon", shortcut: "⌘Q" },
];

const MenuItem = ({
  label,
  highlighted = false,
  muted = false,
  shortcut,
  submenu = false,
  checked,
}: {
  label: string;
  highlighted?: boolean;
  muted?: boolean;
  shortcut?: string;
  submenu?: boolean;
  checked?: boolean;
}) => {
  const COLOR = usePalette();
  let color = muted ? COLOR.secondary : COLOR.label;
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
        height: MENU_ITEM,
        padding: "0 8px",
      }}
    >
      {checked === undefined ? null : (
        <span style={{ width: 16 }}>{checked ? "✓" : ""}</span>
      )}
      <span style={{ flex: 1, whiteSpace: "nowrap" }}>{label}</span>
      {shortcut ? (
        <span style={{ color: highlighted ? "#fff" : COLOR.secondary }}>
          {shortcut}
        </span>
      ) : null}
      {submenu ? <span style={{ fontSize: 11 }}>›</span> : null}
    </div>
  );
};

// While live: the Meeting, Stop and Discard, then the usual items; the
// language submenu switches the live Meeting.
const MenuBarMenu = ({ frame }: { frame: number }) => {
  const open = visible(frame, MENU_OPEN, MENU_CLOSE, 5);
  const submenu = frame >= SUBMENU_OPEN;
  const COLOR = usePalette();

  return (
    <div style={{ opacity: open, position: "absolute" }}>
      <div
        style={{
          ...menuSurface(COLOR),
          left: MENU.left,
          position: "absolute",
          top: MENU.top,
          width: MENU.width,
        }}
      >
        {MENU_ENTRIES.map((entry, index) =>
          entry.kind === "divider" ? (
            <div
              // Dividers have no identity beyond their position.
              key={`divider-${index}`}
              style={{
                background: COLOR.separator,
                height: 1,
                margin: `${(MENU_DIVIDER - 1) / 2}px 8px`,
              }}
            />
          ) : (
            <MenuItem
              highlighted={entry.submenu && submenu}
              key={entry.label}
              label={entry.label}
              muted={entry.muted}
              shortcut={entry.shortcut}
              submenu={entry.submenu}
            />
          )
        )}
      </div>
      {submenu ? (
        <div
          style={{
            ...menuSurface(COLOR),
            left: MENU.left - 150,
            position: "absolute",
            top: LANGUAGE_ITEM_TOP - 5,
            width: 148,
          }}
        >
          {MEETING_LANGUAGES.map((language) => (
            <MenuItem
              checked={language === LANGUAGE}
              key={language}
              label={language}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
};

/** A call starts: the glyph's dot turns red, the notification and the menu bar menu show it, the call ends. */
export const DetectScene = () => {
  const frame = useCurrentFrame();
  const live = frame >= DETECTED && frame < LEAVE + 4;
  const cursor = cursorAt(frame, CURSOR_PATH);
  const zoom =
    settle(frame, ZOOM_IN, ZOOM_IN + 24) -
    settle(frame, NOTIFICATION_OUT - 4, NOTIFICATION_OUT + 22);

  return (
    <Stage>
      <div
        style={{
          inset: 0,
          position: "absolute",
          transform: `scale(${mix(1, ZOOM, zoom)})`,
          transformOrigin: `${ZOOM_ORIGIN.x}px ${ZOOM_ORIGIN.y}px`,
        }}
      >
        <CallWindow frame={frame} />
        <MenuBar
          live={live}
          pressed={frame >= MENU_OPEN && frame < MENU_CLOSE}
        />
        <Notification frame={frame} />
        <MenuBarMenu frame={frame} />
        <Cursor down={isClicking(frame)} x={cursor.x} y={cursor.y} />
      </div>
    </Stage>
  );
};
