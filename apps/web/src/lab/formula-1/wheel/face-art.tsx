import { useId } from "react";

import {
  BODY_HEIGHT,
  BODY_WIDTH,
  FRAME_HEIGHT,
  FRAME_WIDTH,
  MARGIN_TOP,
  MARGIN_X,
} from "./layout";

import "./wheel-body.css";

type Point = readonly [number, number];

const units = ([nx, ny]: Point): Point => [nx * BODY_WIDTH, ny * BODY_HEIGHT];
const mirror = ([nx, ny]: Point): Point => [1 - nx, ny];
const xy = ([x, y]: Point): string => `${x.toFixed(1)} ${y.toFixed(1)}`;

/** A smooth curve through every point (Catmull-Rom as cubic Béziers). */
const smooth = (points: readonly Point[], closed: boolean): string => {
  const count = points.length;
  const pick = (index: number): Point => {
    if (closed) {
      return points[(index + count) % count];
    }
    return points[Math.min(Math.max(index, 0), count - 1)];
  };
  const segments = closed ? count : count - 1;
  const curves = Array.from({ length: segments }, (_, index) => {
    const [x0, y0] = pick(index - 1);
    const [x1, y1] = pick(index);
    const [x2, y2] = pick(index + 1);
    const [x3, y3] = pick(index + 2);
    const c1: Point = [x1 + (x2 - x0) / 6, y1 + (y2 - y0) / 6];
    const c2: Point = [x2 - (x3 - x1) / 6, y2 - (y3 - y1) / 6];
    return `C ${xy(c1)} ${xy(c2)} ${xy([x2, y2])}`;
  });
  return `M ${xy(pick(0))} ${curves.join(" ")}${closed ? " Z" : ""}`;
};

/** The notes' right half, clockwise from the top centre to the bottom centre. */
const RIGHT_HALF: readonly Point[] = [
  [0.5, 0],
  [0.685, 0.011],
  [0.827, 0.03],
  [0.922, 0.071],
  [0.97, 0.124],
  [0.989, 0.215],
  [1, 0.32],
  [1, 0.381],
  [0.993, 0.637],
  [0.979, 0.804],
  [0.955, 0.94],
  [0.922, 1],
  [0.884, 0.985],
  [0.861, 0.864],
  [0.827, 0.743],
  [0.799, 0.637],
  [0.785, 0.532],
  [0.77, 0.668],
  [0.756, 0.834],
  [0.713, 0.909],
  [0.5, 0.932],
];

const OUTLINE = smooth(
  [...RIGHT_HALF, ...RIGHT_HALF.slice(1, -1).map(mirror).toReversed()].map(
    units
  ),
  true
);

const RIM_HALF: readonly Point[] = [
  [0.97, 0.124],
  [0.922, 0.071],
  [0.827, 0.03],
  [0.685, 0.011],
  [0.5, 0],
];

const TOP_RIM = smooth(
  [...RIM_HALF.map(mirror), ...RIM_HALF.slice(0, -1).toReversed()].map(units),
  false
);

const FINGER_HOLE = {
  height: 274,
  radius: 50,
  width: 138,
  x: 163,
  y: 205,
} as const;

const roundedRect = (
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
): string =>
  `M ${x + radius} ${y} H ${x + width - radius} A ${radius} ${radius} 0 0 1 ${x + width} ${y + radius} V ${y + height - radius} A ${radius} ${radius} 0 0 1 ${x + width - radius} ${y + height} H ${x + radius} A ${radius} ${radius} 0 0 1 ${x} ${y + height - radius} V ${y + radius} A ${radius} ${radius} 0 0 1 ${x + radius} ${y} Z`;

/** How far the plate's back edge slides toward the wheel's centre, seen through an opening. */
const PLATE_DEPTH = { x: 10, y: 7 } as const;

const fingerHole = (x: number, toward: 1 | -1) => {
  const front = roundedRect(
    x,
    FINGER_HOLE.y,
    FINGER_HOLE.width,
    FINGER_HOLE.height,
    FINGER_HOLE.radius
  );
  const back = roundedRect(
    x + toward * PLATE_DEPTH.x,
    FINGER_HOLE.y + PLATE_DEPTH.y,
    FINGER_HOLE.width,
    FINGER_HOLE.height,
    FINGER_HOLE.radius
  );
  return { back, front, key: toward === 1 ? "left" : "right" };
};

const FINGER_HOLES = [
  fingerHole(FINGER_HOLE.x, 1),
  fingerHole(BODY_WIDTH - FINGER_HOLE.x - FINGER_HOLE.width, -1),
] as const;

const HOLES = FINGER_HOLES.map((hole) => hole.front).join(" ");
export const PLATE = `${OUTLINE} ${HOLES}`;

/** Where the moulded rubber takes over from the carbon, before the body clips it. */
const RIGHT_SEAM = "M 1232 540 C 1262 450 1390 380 1600 368";
export const RIGHT_RUBBER = `${RIGHT_SEAM} L 1600 1050 L 1232 1050 Z`;
export const MIRROR = `matrix(-1 0 0 1 ${BODY_WIDTH} 0)`;

/** The line down the middle of the right grip; the key light lands to its left on both grips. */
const GRIP_SPINE: readonly Point[] = [
  [1440, 455],
  [1436, 630],
  [1420, 800],
  [1414, 950],
];
const HIGHLIGHT_OFFSET = 46;
const GRIP_HIGHLIGHTS = [
  smooth(
    GRIP_SPINE.map(([x, y]): Point => [BODY_WIDTH - x - HIGHLIGHT_OFFSET, y]),
    false
  ),
  smooth(
    GRIP_SPINE.map(([x, y]): Point => [x - HIGHLIGHT_OFFSET, y]),
    false
  ),
] as const;

const BEZEL = { height: 438, radius: 36, width: 690, x: 440, y: 22 } as const;
const LED_SLOT = { height: 46, width: 570, x: 502, y: 45 } as const;
const FLAG_SLOTS = [449, 1096] as const;
const SCREEN_WELL = {
  height: 318,
  radius: 22,
  width: 553,
  x: 509,
  y: 109,
} as const;
/** The bezel's chamfer down to the glass. */
const SCREEN_LIP = 9;

const BEZEL_PATH = roundedRect(
  BEZEL.x,
  BEZEL.y,
  BEZEL.width,
  BEZEL.height,
  BEZEL.radius
);
const LED_SLOT_PATH = roundedRect(
  LED_SLOT.x,
  LED_SLOT.y,
  LED_SLOT.width,
  LED_SLOT.height,
  LED_SLOT.height / 2
);
const SCREEN_LIP_PATH = roundedRect(
  SCREEN_WELL.x - SCREEN_LIP,
  SCREEN_WELL.y - SCREEN_LIP,
  SCREEN_WELL.width + SCREEN_LIP * 2,
  SCREEN_WELL.height + SCREEN_LIP * 2,
  SCREEN_WELL.radius + SCREEN_LIP
);
const SCREEN_WELL_PATH = roundedRect(
  SCREEN_WELL.x,
  SCREEN_WELL.y,
  SCREEN_WELL.width,
  SCREEN_WELL.height,
  SCREEN_WELL.radius
);

const BOLTS: readonly Point[] = [
  [0.403, 0.743],
  [0.408, 0.811],
  [0.597, 0.743],
  [0.31, 0.05],
  [0.69, 0.05],
  [0.31, 0.43],
  [0.69, 0.43],
];

const SOCKET_RADIUS = 4.6;
const SOCKET = `M ${Array.from({ length: 6 }, (_, corner) => {
  const angle = (corner * Math.PI) / 3;
  return xy([Math.cos(angle) * SOCKET_RADIUS, Math.sin(angle) * SOCKET_RADIUS]);
}).join(" L ")} Z`;

/**
 * A 2×2 twill: every tow floats over two and under two, each row one step
 * along from the last, which draws the weave's diagonal ribs. A pattern's
 * tiles leave hairline seams, so the weave is laid twice, the second one tow
 * along its own repeat: each layer covers the other's seams.
 */
const TOW = 5.5;
const TOW_GAP = 0.4;
const WEAVE_SIZE = TOW * 4;
/** Where each thread's float starts in the tile; one that runs off the end is drawn at both ends. */
const floats = (first: number) =>
  [0, 1, 2, 3].flatMap((thread) => {
    const start = (first + 4 - thread) % 4;
    return start === 3
      ? [
          { start, thread },
          { start: -1, thread },
        ]
      : [{ start, thread }];
  });
const WARP_FLOATS = floats(0);
const WEFT_FLOATS = floats(2);
const FLOAT_LENGTH = TOW * 2 - TOW_GAP * 2;
const FLOAT_WIDTH = TOW - TOW_GAP * 2;

interface Label {
  text: string;
  at: Point;
  /** Printed in a black box. */
  boxed?: boolean;
  /** Printed reading upward along the bezel. */
  vertical?: boolean;
  size?: number;
}

const LABELS: readonly Label[] = [
  { at: [0.367, 0.026], size: 26, text: "DRS K2" },
  { at: [0.045, 0.237], size: 24, text: "DIF IN ↓" },
  { at: [0.955, 0.237], size: 24, text: "↓ D MID" },
  { at: [0.311, 0.37], size: 24, text: "SOC", vertical: true },
  { at: [0.684, 0.384], size: 24, text: "EB", vertical: true },
  { at: [0.284, 0.577], boxed: true, size: 26, text: "BS" },
  { at: [0.722, 0.585], boxed: true, size: 26, text: "TRQ" },
  { at: [0.277, 0.718], boxed: true, size: 25, text: "TARGET" },
  { at: [0.408, 0.85], size: 25, text: "TYRE" },
  { at: [0.408, 0.877], size: 25, text: "PHASE" },
  { at: [0.744, 0.724], boxed: true, size: 25, text: "ENG" },
  { at: [0.598, 0.778], size: 24, text: "P" },
  { at: [0.598, 0.882], size: 24, text: "S" },
];

const CHAR_WIDTH = 0.62;

const PrintedLabel = ({ ink, label }: { ink: string; label: Label }) => {
  const [x, y] = units(label.at);
  const size = label.size ?? 24;
  const width = label.text.length * size * CHAR_WIDTH + size * 0.6;
  return (
    <g
      data-part="label"
      transform={`translate(${xy([x, y])})${label.vertical ? " rotate(90)" : ""}`}
    >
      {label.boxed ? (
        <rect
          data-part="label-box"
          height={size * 1.25}
          rx={size * 0.15}
          width={width}
          x={-width / 2}
          y={-size * 0.62}
        />
      ) : null}
      <text
        dominantBaseline="central"
        fill={`url(#${ink})`}
        fontSize={size}
        textAnchor="middle"
      >
        {label.text}
      </text>
    </g>
  );
};

/**
 * A shape's edges under the top-left key light: a raised shape is lit on the
 * edges that face the light and shaded on the far ones, a recess the reverse.
 */
const Relief = ({
  clip,
  d,
  recessed = false,
  size,
}: {
  clip: string;
  d: string;
  recessed?: boolean;
  size: number;
}) => (
  <g clipPath={`url(#${clip})`} data-relief={recessed ? "recessed" : "raised"}>
    <path
      d={d}
      data-edge="near"
      strokeWidth={size * 2}
      transform={`translate(${size} ${size})`}
    />
    <path
      d={d}
      data-edge="far"
      strokeWidth={size * 2}
      transform={`translate(${-size} ${-size})`}
    />
  </g>
);

export const FRAME = `0 0 ${FRAME_WIDTH} ${FRAME_HEIGHT}`;
export const BODY_ORIGIN = `translate(${MARGIN_X} ${MARGIN_TOP})`;

/**
 * What lies behind the plate: the wheel's shadow on the page and the dark of
 * the finger openings. The rear controls sit between this and `FaceArt`.
 */
export const FaceBacking = () => {
  const id = useId();
  const soft = `${id}-soft`;
  const tight = `${id}-tight`;
  const cavity = `${id}-cavity`;

  return (
    <svg
      aria-hidden="true"
      data-slot="wheel-backing"
      focusable="false"
      viewBox={FRAME}
    >
      <defs>
        <filter
          filterUnits="userSpaceOnUse"
          height={FRAME_HEIGHT + 400}
          id={soft}
          width={FRAME_WIDTH + 400}
          x="-200"
          y="-200"
        >
          <feGaussianBlur stdDeviation="34" />
        </filter>
        <filter
          filterUnits="userSpaceOnUse"
          height={FRAME_HEIGHT + 400}
          id={tight}
          width={FRAME_WIDTH + 400}
          x="-200"
          y="-200"
        >
          <feGaussianBlur stdDeviation="7" />
        </filter>
        <linearGradient
          data-part="cavity"
          id={cavity}
          x1="0"
          x2="0"
          y1="0"
          y2="1"
        >
          <stop data-stop="top" offset="0" />
          <stop data-stop="bottom" offset="1" />
        </linearGradient>
      </defs>
      <g transform={BODY_ORIGIN}>
        <path d={OUTLINE} data-cast="ambient" filter={`url(#${soft})`} />
        <path d={OUTLINE} data-cast="contact" filter={`url(#${tight})`} />
        <path d={HOLES} fill={`url(#${cavity})`} />
      </g>
    </svg>
  );
};

/** The static wheel: carbon body, rubber grips, finger openings, screen bezel, slots and print. */
export const FaceArt = () => {
  const id = useId();
  const weave = `${id}-weave`;
  const weaveOver = `${id}-weave-over`;
  const warp = `${id}-warp`;
  const weft = `${id}-weft`;
  const sheen = `${id}-sheen`;
  const falloff = `${id}-falloff`;
  const wall = `${id}-wall`;
  const underside = `${id}-underside`;
  const gloss = `${id}-gloss`;
  const recess = `${id}-recess`;
  const metal = `${id}-metal`;
  const sink = `${id}-sink`;
  const ink = `${id}-ink`;
  const rim = `${id}-rim`;
  const blurSmall = `${id}-blur-small`;
  const blurMedium = `${id}-blur-medium`;
  const blurLarge = `${id}-blur-large`;
  const grain = `${id}-grain`;
  const plate = `${id}-plate`;
  const outline = `${id}-outline`;
  const rubber = `${id}-rubber`;
  const bezel = `${id}-bezel`;
  const ledSlot = `${id}-led-slot`;
  const screenLip = `${id}-screen-lip`;

  return (
    <svg
      aria-hidden="true"
      data-slot="wheel-art"
      focusable="false"
      viewBox={FRAME}
    >
      <defs>
        <linearGradient data-part="warp" id={warp} x1="0" x2="0" y1="0" y2="1">
          <stop data-stop="dive" offset="0" />
          <stop data-stop="crown" offset="0.5" />
          <stop data-stop="dive" offset="1" />
        </linearGradient>
        <linearGradient data-part="weft" id={weft} x1="0" x2="1" y1="0" y2="0">
          <stop data-stop="dive" offset="0" />
          <stop data-stop="crown" offset="0.5" />
          <stop data-stop="dive" offset="1" />
        </linearGradient>
        <pattern
          data-part="weave"
          height={WEAVE_SIZE}
          id={weave}
          patternUnits="userSpaceOnUse"
          width={WEAVE_SIZE}
        >
          <rect
            data-tow="base"
            height={WEAVE_SIZE + 2}
            width={WEAVE_SIZE + 2}
            x="-1"
            y="-1"
          />
          {WARP_FLOATS.map(({ start, thread }) => (
            <rect
              fill={`url(#${warp})`}
              height={FLOAT_LENGTH}
              key={`${thread} ${start}`}
              rx="1"
              width={FLOAT_WIDTH}
              x={thread * TOW + TOW_GAP}
              y={start * TOW + TOW_GAP}
            />
          ))}
          {WEFT_FLOATS.map(({ start, thread }) => (
            <rect
              fill={`url(#${weft})`}
              height={FLOAT_WIDTH}
              key={`${thread} ${start}`}
              rx="1"
              width={FLOAT_LENGTH}
              x={start * TOW + TOW_GAP}
              y={thread * TOW + TOW_GAP}
            />
          ))}
        </pattern>
        <pattern href={`#${weave}`} id={weaveOver} x={TOW} y={-TOW} />
        <radialGradient
          cx="470"
          cy="150"
          data-part="sheen"
          gradientUnits="userSpaceOnUse"
          id={sheen}
          r="980"
        >
          <stop data-stop="glint" offset="0" />
          <stop data-stop="haze" offset="0.42" />
          <stop data-stop="clear" offset="1" />
        </radialGradient>
        <linearGradient
          data-part="falloff"
          id={falloff}
          x1="0.2"
          x2="0.8"
          y1="0"
          y2="1"
        >
          <stop data-stop="clear" offset="0.3" />
          <stop data-stop="shade" offset="1" />
        </linearGradient>
        <linearGradient data-part="wall" id={wall} x1="0" x2="0" y1="0" y2="1">
          <stop data-stop="top" offset="0" />
          <stop data-stop="bottom" offset="1" />
        </linearGradient>
        <linearGradient
          data-part="underside"
          gradientUnits="userSpaceOnUse"
          id={underside}
          x1="0"
          x2="0"
          y1="380"
          y2={BODY_HEIGHT}
        >
          <stop data-stop="clear" offset="0.35" />
          <stop data-stop="shade" offset="1" />
        </linearGradient>
        <linearGradient
          data-part="gloss"
          id={gloss}
          x1="0"
          x2="0.25"
          y1="0"
          y2="1"
        >
          <stop data-stop="top" offset="0" />
          <stop data-stop="middle" offset="0.45" />
          <stop data-stop="bottom" offset="1" />
        </linearGradient>
        <linearGradient
          data-part="recess"
          id={recess}
          x1="0"
          x2="0"
          y1="0"
          y2="1"
        >
          <stop data-stop="top" offset="0" />
          <stop data-stop="bottom" offset="1" />
        </linearGradient>
        <radialGradient cx="0.35" cy="0.3" data-part="metal" id={metal} r="0.8">
          <stop data-stop="glint" offset="0" />
          <stop data-stop="shade" offset="1" />
        </radialGradient>
        <linearGradient data-part="sink" id={sink} x1="0" x2="1" y1="0" y2="1">
          <stop data-stop="shade" offset="0.15" />
          <stop data-stop="lit" offset="0.9" />
        </linearGradient>
        <linearGradient data-part="ink" id={ink} x1="0" x2="0" y1="0" y2="1">
          <stop data-stop="top" offset="0" />
          <stop data-stop="bottom" offset="1" />
        </linearGradient>
        <linearGradient
          data-part="rim-metal"
          gradientUnits="userSpaceOnUse"
          id={rim}
          x1="0"
          x2={BODY_WIDTH}
          y1="0"
          y2="0"
        >
          <stop data-stop="shade" offset="0" />
          <stop data-stop="glint" offset="0.3" />
          <stop data-stop="body" offset="0.6" />
          <stop data-stop="shade" offset="1" />
        </linearGradient>
        <filter height="1.6" id={blurSmall} width="1.6" x="-0.3" y="-0.3">
          <feGaussianBlur stdDeviation="4" />
        </filter>
        <filter height="1.8" id={blurMedium} width="1.8" x="-0.4" y="-0.4">
          <feGaussianBlur stdDeviation="11" />
        </filter>
        <filter
          filterUnits="userSpaceOnUse"
          height={BODY_HEIGHT + 300}
          id={blurLarge}
          width={BODY_WIDTH + 300}
          x="-150"
          y="-150"
        >
          <feGaussianBlur stdDeviation="30" />
        </filter>
        <filter height="1" id={grain} width="1" x="0" y="0">
          <feTurbulence
            baseFrequency="0.85"
            numOctaves="2"
            seed="7"
            type="fractalNoise"
          />
          <feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0.9 0 0 0 -0.32" />
          <feComposite in2="SourceGraphic" operator="in" />
        </filter>
        <clipPath id={plate}>
          <path clipRule="evenodd" d={PLATE} />
        </clipPath>
        <clipPath id={outline}>
          <path d={OUTLINE} />
        </clipPath>
        <clipPath id={rubber}>
          <path d={RIGHT_RUBBER} />
          <path d={RIGHT_RUBBER} transform={MIRROR} />
        </clipPath>
        <clipPath id={bezel}>
          <path d={BEZEL_PATH} />
        </clipPath>
        <clipPath id={ledSlot}>
          <path d={LED_SLOT_PATH} />
        </clipPath>
        <clipPath id={screenLip}>
          <path d={SCREEN_LIP_PATH} />
        </clipPath>
        {FINGER_HOLES.map((hole) => (
          <g key={hole.key}>
            <clipPath id={`${id}-hole-${hole.key}`}>
              <path d={hole.front} />
            </clipPath>
            <clipPath id={`${id}-cavity-${hole.key}`}>
              <path d={hole.back} />
            </clipPath>
          </g>
        ))}
      </defs>

      <g transform={BODY_ORIGIN}>
        <g clipPath={`url(#${plate})`} data-part="plate">
          {[weave, weaveOver].map((fill) => (
            <rect
              fill={`url(#${fill})`}
              height={BODY_HEIGHT}
              key={fill}
              width={BODY_WIDTH}
            />
          ))}
          <rect
            data-part="plate-glint"
            fill={`url(#${sheen})`}
            height={BODY_HEIGHT}
            width={BODY_WIDTH}
          />
          <rect
            data-part="plate-coat"
            fill={`url(#${sheen})`}
            height={BODY_HEIGHT}
            width={BODY_WIDTH}
          />
          <rect
            fill={`url(#${falloff})`}
            height={BODY_HEIGHT}
            width={BODY_WIDTH}
          />
          <path
            d={PLATE}
            data-part="plate-roll"
            filter={`url(#${blurLarge})`}
          />
          <path
            d={RIGHT_SEAM}
            data-part="seam-shade"
            filter={`url(#${blurSmall})`}
          />
          <path
            d={RIGHT_SEAM}
            data-part="seam-shade"
            filter={`url(#${blurSmall})`}
            transform={MIRROR}
          />
        </g>
        <Relief clip={plate} d={PLATE} size={2.2} />

        {FINGER_HOLES.map((hole) => (
          <g
            clipPath={`url(#${id}-hole-${hole.key})`}
            data-part="opening"
            key={hole.key}
          >
            <path
              d={`${hole.front} ${hole.back}`}
              fill={`url(#${wall})`}
              fillRule="evenodd"
            />
            <g clipPath={`url(#${id}-cavity-${hole.key})`}>
              <path d={hole.back} data-opening="dusk" />
              <path
                d={hole.back}
                data-opening="shadow"
                filter={`url(#${blurMedium})`}
                transform="translate(9 16)"
              />
            </g>
            <path d={hole.back} data-opening="back-edge" />
          </g>
        ))}

        <g clipPath={`url(#${outline})`}>
          <g clipPath={`url(#${rubber})`} data-part="grips">
            <rect data-grip="base" height={BODY_HEIGHT} width={BODY_WIDTH} />
            {GRIP_HIGHLIGHTS.map((spine) => (
              <path
                d={spine}
                data-grip="crown"
                filter={`url(#${blurLarge})`}
                key={spine}
              />
            ))}
            <rect
              fill={`url(#${underside})`}
              height={BODY_HEIGHT}
              width={BODY_WIDTH}
            />
            <path d={OUTLINE} data-grip="roll" filter={`url(#${blurLarge})`} />
            {[undefined, MIRROR].map((side) => (
              <g key={side ?? "right"} transform={side}>
                <path
                  d={RIGHT_SEAM}
                  data-grip="shoulder"
                  filter={`url(#${blurMedium})`}
                />
                <path
                  d={RIGHT_SEAM}
                  data-grip="lip"
                  filter={`url(#${blurSmall})`}
                  transform="translate(0 9)"
                />
              </g>
            ))}
            <rect
              data-grip="grain"
              filter={`url(#${grain})`}
              height={BODY_HEIGHT - 340}
              width={BODY_WIDTH}
              y="340"
            />
          </g>
        </g>
        <path d={OUTLINE} data-part="edge" />

        <path d={TOP_RIM} data-part="rim-shade" transform="translate(0 4)" />
        <path d={TOP_RIM} data-part="rim" stroke={`url(#${rim})`} />
        <path d={TOP_RIM} data-part="rim-glint" transform="translate(0 -2)" />

        <path
          d={BEZEL_PATH}
          data-part="bezel-shadow"
          filter={`url(#${blurMedium})`}
          transform="translate(7 12)"
        />
        {[weave, weaveOver].map((fill) => (
          <path d={BEZEL_PATH} fill={`url(#${fill})`} key={fill} />
        ))}
        <path d={BEZEL_PATH} data-part="bezel-gloss" fill={`url(#${gloss})`} />
        <Relief clip={bezel} d={BEZEL_PATH} size={2.4} />

        <path d={LED_SLOT_PATH} data-part="slot" fill={`url(#${recess})`} />
        <Relief clip={ledSlot} d={LED_SLOT_PATH} recessed size={2.5} />
        {FLAG_SLOTS.map((x) => {
          const clip = `${id}-flag-${x}`;
          const d = roundedRect(x, 103, 25, 112, 12);
          return (
            <g key={x}>
              <clipPath id={clip}>
                <path d={d} />
              </clipPath>
              <path d={d} data-part="slot" fill={`url(#${recess})`} />
              <Relief clip={clip} d={d} recessed size={2} />
            </g>
          );
        })}

        <path d={SCREEN_LIP_PATH} data-part="screen-lip" />
        <Relief
          clip={screenLip}
          d={SCREEN_LIP_PATH}
          recessed
          size={SCREEN_LIP / 2}
        />
        <path d={SCREEN_WELL_PATH} data-part="screen-well" />

        {BOLTS.map((point) => {
          const [x, y] = units(point);
          return (
            <g
              data-part="bolt"
              key={xy(point)}
              transform={`translate(${xy([x, y])})`}
            >
              <circle data-bolt="sink" fill={`url(#${sink})`} r="13.5" />
              <circle data-bolt="head" fill={`url(#${metal})`} r="9.5" />
              <path d={SOCKET} data-bolt="socket" />
              <path d="M -6.4 -3.4 A 7.2 7.2 0 0 1 -1 -7.1" data-bolt="glint" />
            </g>
          );
        })}

        {LABELS.map((label) => (
          <PrintedLabel ink={ink} key={label.text} label={label} />
        ))}
      </g>
    </svg>
  );
};
