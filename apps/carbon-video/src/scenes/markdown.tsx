import type { CSSProperties } from "react";
import { useCurrentFrame } from "remotion";

import { MARKDOWN, ROWS } from "../data";
import { mix, settle, travel, visible } from "../motion";
import { Cursor, cursorAt } from "../ui/cursor";
import { Glass } from "../ui/glass";
import { MenuBar, Stage, TrafficLights } from "../ui/screen";
import { MONO, menuSurface, usePalette } from "../ui/theme";

export const MARKDOWN_FRAMES = 156;

// Local frames of the scene.
const SELECT = 22;
const SPACE = 40;
const QUICK_LOOK = SPACE + 2;
const SCROLL_FROM = 64;
const SCROLL_TO = MARKDOWN_FRAMES;
const SCROLL_BY = 44;

const FINDER = { height: 300, left: 110, top: 64, width: 580 };
const FINDER_SIDEBAR = 150;
const TOOLBAR = 52;
const COLUMNS = 24;
const ROW = 24;
const NAME_COLUMN = 236;

const QUICK_LOOK_PANEL = { height: 380, left: 160, top: 38, width: 480 };
const QUICK_LOOK_BAR = 36;

/** Where a file's row sits on the stage. */
const rowCenter = (index: number) => ({
  x: FINDER.left + FINDER_SIDEBAR + 120,
  y: FINDER.top + TOOLBAR + COLUMNS + ROW * index + ROW / 2,
});

const CURSOR_PATH = [
  { at: 0, x: 560, y: 400 },
  { at: SELECT - 2, ...rowCenter(0) },
];

const TRUNCATE: CSSProperties = {
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};

// The day each file was written, as Finder's Date Modified says it.
const modified = (file: string) => {
  const day = Number(file.slice(8, 10));
  return `Oct ${day}, 2026`;
};

/** A plain-text document's icon, its corner folded. */
const DocumentIcon = ({ selected }: { selected: boolean }) => (
  <svg height={15} viewBox="0 0 12 15" width={12}>
    <path
      d="M1.5 0.5h6l4 4v9a1 1 0 0 1-1 1h-9a1 1 0 0 1-1-1v-12a1 1 0 0 1 1-1z"
      fill="#fff"
      stroke={selected ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.28)"}
    />
    <path
      d="M7.5 0.5v3a1 1 0 0 0 1 1h3"
      fill="none"
      stroke={selected ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.28)"}
    />
  </svg>
);

/** Back and Forward in one capsule, split by a hairline, as Finder draws them. */
const NavigationChevrons = () => {
  const COLOR = usePalette();
  const chevron = {
    fill: "none",
    stroke: COLOR.secondary,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    strokeWidth: 1.5,
  } as const;
  return (
    <svg height={32} viewBox="0 0 76 32" width={76}>
      <path d="M23 10l-6 6 6 6" {...chevron} />
      <line
        stroke={COLOR.separator}
        strokeWidth={1}
        x1={38}
        x2={38}
        y1={8}
        y2={24}
      />
      <path d="M53 10l6 6-6 6" {...chevron} />
    </svg>
  );
};

const FinderSidebar = () => {
  const COLOR = usePalette();
  return (
    <div
      style={{
        background: COLOR.sidebar,
        borderRight: `0.5px solid ${COLOR.separator}`,
        flexShrink: 0,
        fontSize: 12,
        padding: "48px 8px 0",
        width: FINDER_SIDEBAR,
      }}
    >
      <div style={{ left: 16, position: "absolute", top: 17 }}>
        <TrafficLights />
      </div>
      <div
        style={{
          color: COLOR.secondary,
          fontSize: 10.5,
          fontWeight: 600,
          padding: "0 8px 4px",
        }}
      >
        Favorites
      </div>
      {["Recents", "Applications", "Desktop", "Documents", "Carbon"].map(
        (place) => (
          <div
            key={place}
            style={{
              background: place === "Carbon" ? COLOR.tertiaryFill : undefined,
              borderRadius: 6,
              padding: "3px 8px",
            }}
          >
            {place}
          </div>
        )
      )}
    </div>
  );
};

const FileList = ({ selected }: { selected: boolean }) => {
  const COLOR = usePalette();
  const column: CSSProperties = { flexShrink: 0, ...TRUNCATE };
  return (
    <div style={{ flex: 1, minWidth: 0 }}>
      <div
        style={{
          alignItems: "center",
          display: "flex",
          gap: 12,
          height: TOOLBAR,
          padding: "0 12px",
        }}
      >
        <Glass height={32} width={76}>
          <NavigationChevrons />
        </Glass>
        <strong style={{ fontSize: 14 }}>2026</strong>
      </div>
      <div
        style={{
          alignItems: "center",
          borderBottom: `0.5px solid ${COLOR.separator}`,
          color: COLOR.secondary,
          display: "flex",
          fontSize: 11,
          height: COLUMNS,
          padding: "0 12px",
        }}
      >
        <span style={{ ...column, width: NAME_COLUMN }}>Name</span>
        <span style={{ ...column, width: 110 }}>Date Modified</span>
        <span style={column}>Kind</span>
      </div>
      <div style={{ padding: "0 4px" }}>
        {ROWS.map((row, index) => {
          const isSelected = selected && index === 0;
          return (
            <div
              key={row.file}
              style={{
                alignItems: "center",
                background: isSelected ? COLOR.accent : undefined,
                borderRadius: 5,
                color: isSelected ? "#fff" : COLOR.label,
                display: "flex",
                fontSize: 12,
                height: ROW,
                padding: "0 8px",
              }}
            >
              <span
                style={{
                  ...column,
                  alignItems: "center",
                  display: "flex",
                  gap: 6,
                  paddingRight: 12,
                  width: NAME_COLUMN,
                }}
              >
                <DocumentIcon selected={isSelected} />
                <span style={TRUNCATE}>{row.file}</span>
              </span>
              <span
                style={{
                  ...column,
                  color: isSelected ? "#fff" : COLOR.secondary,
                  width: 110,
                }}
              >
                {modified(row.file)}
              </span>
              <span
                style={{
                  ...column,
                  color: isSelected ? "#fff" : COLOR.secondary,
                }}
              >
                Markdown
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/** The key the person presses, shown on screen since the film has no sound. */
const SpaceKey = ({ frame }: { frame: number }) => {
  const COLOR = usePalette();
  const pressed = frame >= SPACE && frame < SPACE + 5;
  return (
    <div
      style={{
        ...menuSurface(COLOR),
        bottom: 26,
        fontSize: 13,
        fontWeight: 500,
        left: "50%",
        opacity: visible(frame, SPACE - 14, SPACE + 22, 6),
        padding: "6px 34px",
        position: "absolute",
        transform: `translateX(-50%) scale(${pressed ? 0.94 : 1})`,
      }}
    >
      space
    </div>
  );
};

/** Quick Look on the selected file: Carbon's Markdown, as plain text. */
const QuickLook = ({ frame }: { frame: number }) => {
  const COLOR = usePalette();
  const open = settle(frame, QUICK_LOOK, QUICK_LOOK + 16);
  const row = rowCenter(0);
  const scroll = SCROLL_BY * travel(frame, SCROLL_FROM, SCROLL_TO);

  return (
    <div
      style={{
        ...QUICK_LOOK_PANEL,
        background: COLOR.window,
        borderRadius: 14,
        boxShadow: COLOR.windowShadow,
        opacity: open,
        overflow: "hidden",
        position: "absolute",
        transform: `scale(${mix(0.08, 1, open)})`,
        // It grows out of the file's row.
        transformOrigin: `${row.x - QUICK_LOOK_PANEL.left}px ${row.y - QUICK_LOOK_PANEL.top}px`,
      }}
    >
      <div
        style={{
          alignItems: "center",
          background: COLOR.toolbarBar,
          borderBottom: `0.5px solid ${COLOR.separator}`,
          display: "flex",
          fontSize: 12,
          gap: 10,
          height: QUICK_LOOK_BAR,
          padding: "0 12px",
        }}
      >
        <span style={{ color: COLOR.secondary, fontSize: 13 }}>✕</span>
        <strong style={{ flex: 1, textAlign: "center", ...TRUNCATE }}>
          {ROWS[0].file}
        </strong>
        <span
          style={{
            background: COLOR.tertiaryFill,
            borderRadius: 6,
            padding: "2px 8px",
          }}
        >
          Open with TextEdit
        </span>
      </div>
      <div
        style={{
          height: QUICK_LOOK_PANEL.height - QUICK_LOOK_BAR,
          overflow: "hidden",
        }}
      >
        <pre
          style={{
            fontFamily: MONO,
            fontSize: 10.5,
            lineHeight: 1.6,
            margin: 0,
            padding: "12px 16px",
            transform: `translateY(${-scroll}px)`,
            whiteSpace: "pre-wrap",
          }}
        >
          {MARKDOWN}
        </pre>
      </div>
    </div>
  );
};

/** In ~/Carbon/2026, one Markdown file per Meeting; Quick Look opens the one that just ended. */
export const MarkdownScene = () => {
  const frame = useCurrentFrame();
  const COLOR = usePalette();
  const enter = settle(frame, 0, 18);
  const cursor = cursorAt(frame, CURSOR_PATH);

  return (
    <Stage>
      <MenuBar />
      <div
        style={{
          ...FINDER,
          background: COLOR.window,
          borderRadius: 14,
          boxShadow: COLOR.windowShadow,
          display: "flex",
          opacity: enter,
          overflow: "hidden",
          position: "absolute",
          transform: `scale(${mix(0.97, 1, enter)})`,
        }}
      >
        <FinderSidebar />
        <FileList selected={frame >= SELECT} />
      </div>
      <QuickLook frame={frame} />
      <SpaceKey frame={frame} />
      {frame < QUICK_LOOK ? (
        <Cursor
          down={frame >= SELECT - 2 && frame < SELECT + 3}
          x={cursor.x}
          y={cursor.y}
        />
      ) : null}
    </Stage>
  );
};
