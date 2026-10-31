import type { CSSProperties } from "react";
import { random, useCurrentFrame } from "remotion";

import { ATTENDEES, PROVIDER, TITLE } from "../data";
import { mix, settle, travel } from "../motion";
import { Cursor, cursorAt } from "../ui/cursor";
import { CarbonMark } from "../ui/mark";
import { MenuBar, Stage, TrafficLights } from "../ui/screen";
import { menuSurface, usePalette } from "../ui/theme";

export const DETECT_FRAMES = 164;

// Local frames of the scene.
const ZOOM_IN = 4;
const DETECTED = 24;
const NOTIFICATION_OUT = 100;
const LEAVE = 140;

// The camera leans into the menu bar while the mic meter shows.
const ZOOM = 1.6;
const ZOOM_ORIGIN = { x: 790, y: 0 };

const CALL = { height: 330, left: 70, top: 60, width: 520 };
const LEAVE_BUTTON = { height: 28, left: 370, top: 354, width: 64 };

const CURSOR_PATH = [
  { at: 0, x: 360, y: 300 },
  { at: NOTIFICATION_OUT, x: 360, y: 300 },
  {
    at: LEAVE - 2,
    x: LEAVE_BUTTON.left + LEAVE_BUTTON.width / 2,
    y: LEAVE_BUTTON.top + LEAVE_BUTTON.height / 2,
  },
];

const isClicking = (frame: number) => frame >= LEAVE - 2 && frame < LEAVE + 3;

// The meter reads the mic ten times a second.
const METER_FRAMES = 3;

// A voice: loud and soft syllables, with a pause now and then.
const micLevel = (tick: number) => {
  const pausing = random(`pause-${Math.floor(tick / 6)}`) < 0.2;
  return pausing ? 0 : 0.25 + 0.75 * random(`level-${tick}`);
};

/**
 * The meter's three bars, left to right: the middle one the last level, the
 * outer ones the two before, each falling at most by half a level at a time.
 * The film glides from one reading to the next, where the app jumps.
 */
const meterLevels = (frame: number) => {
  const elapsed = Math.max(0, frame - DETECTED) / METER_FRAMES;
  const ticks = Math.floor(elapsed);
  let previous = [0, 0, 0];
  let history = [0, 0, 0];
  for (let tick = 0; tick <= ticks; tick += 1) {
    previous = history;
    history = [
      Math.max(micLevel(tick), history[0] / 2),
      ...history.slice(0, 2),
    ];
  }
  const glide = travel(elapsed - ticks, 0, 1);
  const levels = previous.map((level, index) =>
    mix(level, history[index], glide)
  );
  return [levels[1], levels[0], levels[2]];
};

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

// "Transcribing", "<title> · <Provider>", with Stop.
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
            <strong style={{ fontSize: 12.5 }}>Transcribing</strong>
            <span style={{ color: COLOR.secondary, fontSize: 11 }}>now</span>
          </div>
          <div style={{ fontSize: 12 }}>
            {TITLE} · {PROVIDER}
          </div>
        </div>
      </div>
      <div style={{ display: "flex", gap: 6, marginTop: 9 }}>
        <div style={{ ...action, color: COLOR.destructive }}>Stop</div>
      </div>
    </div>
  );
};

/** A call starts: the menu bar shows the mic, a notification says so, the call ends. */
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
        <MenuBar live={live ? { levels: meterLevels(frame) } : undefined} />
        <Notification frame={frame} />
        <Cursor down={isClicking(frame)} x={cursor.x} y={cursor.y} />
      </div>
    </Stage>
  );
};
