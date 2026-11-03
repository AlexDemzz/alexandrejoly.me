// PROTOTYPE, throw me away: "All in", the media for the AGE-18 X post.
// The pointer is a croupier's rake: push the five score chips into the pot
// and the deck deals a hand of five 100s. Motion drives the frame loop, the
// rake's springs and every transform; the chip collisions are a small
// circle-and-capsule solver on top of it.
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "motion/react";
import type { MotionValue } from "motion/react";
import { Fragment, useEffect, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";

import { RoyalHand, useLit } from "./hand";
import { AUDITS, VercelLogo } from "./parts";

const CHIP_R = 46;
// Wide enough to sweep the whole row into the pot in one push.
const HEAD_HALF = 260;
const HANDLE = 380;
const RAKE_HALF = 9;
const WALL = 40;
// Felt, not ice: a constant sliding friction (px/s²) stops chips dead in a
// short slide, on top of a little drag; heavy clay chips barely bounce.
const FELT_DECEL = 3000;
const FELT_DRAG = 3;
const SPIN_DRAG = 8;
const MAX_CHIP_SPEED = 1000;
const CHIP_BOUNCE = 0.3;
const WALL_BOUNCE = 0.2;
// The rake pushes rather than hits, and carries chips along its edge a bit.
const RAKE_GRIP = 0.35;
const SUBSTEPS = 4;
// The hand's size: 250px cards on a 200px pitch, shrinking with the stage.
const HAND_SIZE = {
  "--card-w": "min(250px, 19.5cqw)",
  "--pitch": "min(200px, 15.6cqw)",
} as CSSProperties;
const MAX_RAKE_SPEED = 3200;
const POT_R = 340;
// The deck waits at 80% of the final card size: bigger than a real card
// next to these chips, so it still reads in a small video.
const IDLE_DECK_SCALE = 0.8;
// The face-down stack offsets its cards a few pixels up and left.
const DECK_STACK = 6;
const DECK_BOUNCE = 0.2;
const ROW_GAP = 98;
// The pot's felt holds a little harder, so a chip pushed in stays in.
const POT_DECEL = 4200;
// The deck arrives with weight: 2.5% past its final size, then settles.
// No tilt. Keyframes, not a spring: over a 0.8 → 1 travel a subtle spring
// overshoots by a fraction of a percent, which doesn't show.
const ARRIVE_PEAK = 1.025;
const FLIGHT_MS = 700;
const PEAK_AT = 0.5;
// The fan opens as the deck passes its final size on the way up (~180 ms):
// the rise is ease-settle, so the last 2% to the peak crawls, and waiting
// for the peak read as a dead zone. The settle then plays under the fan.
const DEAL_AT = 180;
// No pause after the last chip: the deck starts zooming at once, and the
// table only waits this long before it blurs out, so "ALL IN" still reads
// while everything is already moving.
const TABLE_HOLD_MS = 150;

// The caption rises word by word: "A perfect hand." in white, then the rest.
const CAPTION = [
  ..."A perfect hand.".split(" ").map((text) => ({ strong: true, text })),
  ..."Five 100s on alexandrejoly.me."
    .split(" ")
    .map((text) => ({ strong: false, text })),
];

const CAPTION_START = 200;
const CAPTION_STEP = 70;

const CHIPS: { label: string; suit: ReactNode }[] = [
  ...AUDITS.map((audit) => ({ label: audit.label, suit: audit.suit })),
  { label: "is-agentic", suit: <VercelLogo className="size-[12px]" /> },
];

// Where the chips start, as fractions of the table, all outside the pot.
// One row just under the pot, so a single upward sweep catches all five.
const START = [-2, -1, 0, 1, 2] as const;

interface Body {
  x: number;
  y: number;
  vx: number;
  vy: number;
  spin: number;
}
interface Point {
  x: number;
  y: number;
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const closestOnSegment = (p: Point, a: Point, b: Point): Point => {
  const abx = b.x - a.x;
  const aby = b.y - a.y;
  const t = clamp(
    ((p.x - a.x) * abx + (p.y - a.y) * aby) / (abx * abx + aby * aby),
    0,
    1
  );
  return { x: a.x + abx * t, y: a.y + aby * t };
};

// The rake's two colliders: the head across, the handle down from its middle.
const rakeSegments = (x: number, y: number, degrees: number) => {
  const angle = (degrees * Math.PI) / 180;
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const at = (lx: number, ly: number): Point => ({
    x: x + lx * cos - ly * sin,
    y: y + lx * sin + ly * cos,
  });
  return [
    [at(-HEAD_HALF, 0), at(HEAD_HALF, 0)],
    [at(0, 0), at(0, HANDLE)],
  ] as const;
};

const Chip = ({
  x,
  y,
  rotate,
  label,
  suit,
  inPot,
  reduceMotion,
}: {
  x: MotionValue<number>;
  y: MotionValue<number>;
  rotate: MotionValue<number>;
  label: string;
  suit: ReactNode;
  inPot: boolean;
  reduceMotion: boolean;
}) => (
  <motion.div
    animate={reduceMotion ? { opacity: 1 } : { opacity: 1, scale: 1 }}
    aria-label={`${label} chip, 100`}
    className="absolute top-0 left-0 will-change-transform"
    initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.9 }}
    role="img"
    style={{
      height: CHIP_R * 2,
      marginLeft: -CHIP_R,
      marginTop: -CHIP_R,
      rotate,
      width: CHIP_R * 2,
      x,
      y,
    }}
    transition={
      reduceMotion
        ? { duration: 0.2 }
        : { damping: 14, stiffness: 260, type: "spring" }
    }
  >
    <svg
      className="size-full overflow-visible drop-shadow-[0_8px_10px_oklch(0_0_0/0.45)]"
      viewBox="0 0 68 68"
    >
      <circle
        cx="34"
        cy="34"
        fill="none"
        r="37"
        stroke="var(--pk-hi)"
        strokeDasharray="2 3"
        style={{ opacity: inPot ? 1 : 0, transition: "opacity 300ms" }}
      />
      <circle cx="34" cy="34" fill="oklch(0.9 0.003 70)" r="33" />
      <circle
        cx="34"
        cy="34"
        fill="none"
        r="29"
        stroke="var(--pk-bg)"
        strokeDasharray="9 13.78"
        strokeWidth="6"
      />
      <circle
        cx="34"
        cy="34"
        fill="none"
        r="21"
        stroke="var(--pk-bg)"
        strokeDasharray="1.5 2"
        strokeWidth="0.75"
      />
    </svg>
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5 leading-none text-[var(--pk-bg)]">
      <span className="text-[20px] font-medium tabular-nums">100</span>
      <span className="text-[12px]">{suit}</span>
    </div>
  </motion.div>
);

const useChipValues = () => {
  const values = CHIPS.map(() => ({
    rotate: useMotionValue(0),
    x: useMotionValue(-200),
    y: useMotionValue(-200),
  }));
  return values;
};

export const AllIn = () => {
  const tableRef = useRef<HTMLDivElement>(null);
  const size = useRef({
    deck: { halfH: 0, halfW: 0, x: 0, y: 0 },
    height: 0,
    pot: { r: 0, x: 0, y: 0 },
    width: 0,
  });
  const deckRef = useRef<HTMLDivElement>(null);
  const bodies = useRef<Body[]>([]);
  const pointer = useRef({ inside: false, x: 0, y: 0 });
  const last = useRef<Point | null>(null);

  const [mounted, setMounted] = useState(false);
  const [inPot, setInPot] = useState<boolean[]>(() => CHIPS.map(() => false));
  // table: raking. flying: the deck zooms. Then it deals.
  const [phase, setPhase] = useState<"table" | "flying" | "dealt">("table");
  const open = phase === "dealt";
  const lit = useLit(open);
  const playing = phase === "table";
  const onTable = playing;
  const reduceMotion = useReducedMotion();

  const chips = useChipValues();
  const target = { x: useMotionValue(0), y: useMotionValue(0) };
  const rakeX = useSpring(target.x, {
    damping: 50,
    mass: 0.6,
    stiffness: 1400,
  });
  const rakeY = useSpring(target.y, {
    damping: 50,
    mass: 0.6,
    stiffness: 1400,
  });
  const tilt = useMotionValue(0);
  const rakeRotate = useSpring(tilt, { damping: 18, stiffness: 220 });
  // Slow on the way out, so the rake fades rather than vanishing mid-push.
  const rakeOpacity = useSpring(0, { damping: 20, stiffness: 90 });

  const pot = () => size.current.pot;

  const rack = () => {
    const { x, y, r } = pot();
    const fresh = START.map((column) => ({
      spin: 0,
      vx: 0,
      vy: 0,
      x: x + column * ROW_GAP,
      y: Math.min(y + r + CHIP_R + 16, size.current.height - WALL - CHIP_R),
    }));
    bodies.current.splice(0, bodies.current.length, ...fresh);
  };

  useEffect(() => {
    if (phase !== "flying") {
      return;
    }
    const timer = window.setTimeout(() => setPhase("dealt"), DEAL_AT);
    return () => window.clearTimeout(timer);
  }, [phase]);

  const resetTable = () => {
    rack();
    for (const values of chips) {
      values.rotate.set(0);
    }
    setInPot(CHIPS.map(() => false));
    setPhase("table");
  };

  const onHand = () => {
    if (phase === "dealt") {
      resetTable();
    }
  };

  useEffect(() => {
    const table = tableRef.current;
    if (!table) {
      return;
    }
    const measure = () => {
      const box = table.getBoundingClientRect();
      const deck = deckRef.current?.getBoundingClientRect();
      // E's card width is `min(250px, 19.5cqw)` of the stage.
      const fullW = Math.min(250, box.width * 0.195);
      const cardW = fullW * IDLE_DECK_SCALE;
      size.current = {
        deck: {
          halfH: (cardW * 1.4) / 2 + DECK_STACK,
          halfW: cardW / 2 + DECK_STACK,
          x: deck ? deck.left - box.left + deck.width / 2 : box.width / 2,
          y: deck ? deck.top - box.top + deck.height / 2 : box.height / 2,
        },
        height: box.height,
        // The same size as the circle's CSS, `min(2 × POT_R px, 76cqh)`,
        // centred on the deck like the circle. The circle's own box can read
        // 0 while the page hydrates, so it isn't measured.
        pot: {
          r: Math.min(POT_R, box.height * 0.38),
          x: deck ? deck.left - box.left + deck.width / 2 : box.width / 2,
          y: deck ? deck.top - box.top + deck.height / 2 : box.height / 2,
        },
        width: box.width,
      };
    };
    measure();
    rack();
    setMounted(true);
    const observer = new ResizeObserver(measure);
    observer.observe(table);
    return () => observer.disconnect();
  }, []);

  useAnimationFrame((_time, delta) => {
    const dt = Math.min(delta, 33) / 1000;
    if (phase === "dealt" || dt <= 0 || bodies.current.length === 0) {
      return;
    }
    const { width, height } = size.current;
    const nowX = rakeX.get();
    const nowY = rakeY.get();
    const from = last.current ?? { x: nowX, y: nowY };
    last.current = { x: nowX, y: nowY };

    let rvx = (nowX - from.x) / dt;
    let rvy = (nowY - from.y) / dt;
    const speed = Math.hypot(rvx, rvy);
    if (speed > MAX_RAKE_SPEED) {
      rvx *= MAX_RAKE_SPEED / speed;
      rvy *= MAX_RAKE_SPEED / speed;
    }
    tilt.set(clamp(rvx * 0.008, -20, 20));

    const list = bodies.current;

    const h = dt / SUBSTEPS;
    const drag = Math.exp(-FELT_DRAG * h);
    const spinDrag = Math.exp(-SPIN_DRAG * h);

    for (let step = 1; step <= SUBSTEPS; step += 1) {
      const t = step / SUBSTEPS;
      const segments =
        pointer.current.inside && playing
          ? rakeSegments(
              from.x + (nowX - from.x) * t,
              from.y + (nowY - from.y) * t,
              rakeRotate.get()
            )
          : [];

      const centre = pot();
      for (const body of list) {
        const inside =
          Math.hypot(body.x - centre.x, body.y - centre.y) < centre.r;
        body.x += body.vx * h;
        body.y += body.vy * h;
        const speed = Math.hypot(body.vx, body.vy);
        if (speed > 0) {
          const decel = (inside ? POT_DECEL : FELT_DECEL) * h;
          const slowed = Math.max(
            0,
            Math.min(speed, MAX_CHIP_SPEED) * drag - decel
          );
          body.vx *= slowed / speed;
          body.vy *= slowed / speed;
        }
        body.spin *= spinDrag;

        for (const [a, b] of segments) {
          const q = closestOnSegment(body, a, b);
          let dx = body.x - q.x;
          let dy = body.y - q.y;
          let dist = Math.hypot(dx, dy);
          const reach = CHIP_R + RAKE_HALF;
          if (dist >= reach) {
            continue;
          }
          if (dist < 0.001) {
            dx = 0;
            dy = -1;
            dist = 1;
          }
          const nx = dx / dist;
          const ny = dy / dist;
          body.x = q.x + nx * reach;
          body.y = q.y + ny * reach;
          const relative = (body.vx - rvx) * nx + (body.vy - rvy) * ny;
          if (relative < 0) {
            // Match the rake's push along the normal, no rebound.
            body.vx -= relative * nx;
            body.vy -= relative * ny;
            const tx = -ny;
            const ty = nx;
            const slip = (body.vx - rvx) * tx + (body.vy - rvy) * ty;
            body.vx -= slip * RAKE_GRIP * tx;
            body.vy -= slip * RAKE_GRIP * ty;
            body.spin += slip * 0.3;
          }
        }

        // The deck is a solid block in the middle of the pot.
        if (onTable) {
          const { deck } = size.current;
          const qx = clamp(body.x, deck.x - deck.halfW, deck.x + deck.halfW);
          const qy = clamp(body.y, deck.y - deck.halfH, deck.y + deck.halfH);
          let nx = body.x - qx;
          let ny = body.y - qy;
          let dist = Math.hypot(nx, ny);
          if (dist < CHIP_R) {
            if (dist < 0.001) {
              // Centre inside the deck: leave by the nearest edge.
              const left = body.x - (deck.x - deck.halfW);
              const right = deck.x + deck.halfW - body.x;
              const top = body.y - (deck.y - deck.halfH);
              const bottom = deck.y + deck.halfH - body.y;
              const nearest = Math.min(left, right, top, bottom);
              nx = nearest === left ? -1 : nearest === right ? 1 : 0;
              ny = nearest === top ? -1 : nearest === bottom ? 1 : 0;
              dist = 0;
              body.x =
                nx === 0
                  ? body.x
                  : nx < 0
                    ? deck.x - deck.halfW
                    : deck.x + deck.halfW;
              body.y =
                ny === 0
                  ? body.y
                  : ny < 0
                    ? deck.y - deck.halfH
                    : deck.y + deck.halfH;
            } else {
              nx /= dist;
              ny /= dist;
            }
            body.x += nx * (CHIP_R - dist);
            body.y += ny * (CHIP_R - dist);
            const into = body.vx * nx + body.vy * ny;
            if (into < 0) {
              body.vx -= (1 + DECK_BOUNCE) * into * nx;
              body.vy -= (1 + DECK_BOUNCE) * into * ny;
            }
          }
        }

        const minX = WALL + CHIP_R;
        const maxX = width - WALL - CHIP_R;
        const minY = WALL + CHIP_R;
        const maxY = height - WALL - CHIP_R;
        if (body.x < minX || body.x > maxX) {
          body.x = clamp(body.x, minX, maxX);
          body.vx *= -WALL_BOUNCE;
        }
        if (body.y < minY || body.y > maxY) {
          body.y = clamp(body.y, minY, maxY);
          body.vy *= -WALL_BOUNCE;
        }
      }

      for (let i = 0; i < list.length; i += 1) {
        for (let j = i + 1; j < list.length; j += 1) {
          const one = list[i] as Body;
          const two = list[j] as Body;
          const dx = two.x - one.x;
          const dy = two.y - one.y;
          const dist = Math.hypot(dx, dy) || 0.001;
          const overlap = CHIP_R * 2 - dist;
          if (overlap <= 0) {
            continue;
          }
          const nx = dx / dist;
          const ny = dy / dist;
          one.x -= (nx * overlap) / 2;
          one.y -= (ny * overlap) / 2;
          two.x += (nx * overlap) / 2;
          two.y += (ny * overlap) / 2;
          const closing = (two.vx - one.vx) * nx + (two.vy - one.vy) * ny;
          if (closing < 0) {
            const impulse = (-(1 + CHIP_BOUNCE) * closing) / 2;
            one.vx -= impulse * nx;
            one.vy -= impulse * ny;
            two.vx += impulse * nx;
            two.vy += impulse * ny;
          }
        }
      }
    }

    const { x: px, y: py, r: pr } = pot();
    const next = list.map((body) => Math.hypot(body.x - px, body.y - py) < pr);
    list.forEach((body, index) => {
      const values = chips[index];
      values?.x.set(body.x);
      values?.y.set(body.y);
      values?.rotate.set(values.rotate.get() + body.spin * dt * 0.05);
    });

    if (next.some((value, index) => value !== inPot[index])) {
      setInPot(next);
    }
    // All five inside the pot: the deck takes off straight away.
    if (playing && next.every(Boolean)) {
      setPhase("flying");
      rakeOpacity.set(0);
    }
  });

  const onMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const box = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - box.left;
    const y = event.clientY - box.top;
    if (!pointer.current.inside) {
      rakeX.jump(x);
      rakeY.jump(y);
      last.current = { x, y };
    }
    pointer.current = { inside: true, x, y };
    target.x.set(x);
    target.y.set(y);
    rakeOpacity.set(playing ? 1 : 0);
  };

  const onLeave = () => {
    pointer.current.inside = false;
    rakeOpacity.set(0);
  };

  const count = inPot.filter(Boolean).length;
  const allIn = !playing || count === CHIPS.length;
  // Opacity, a `transform` string and `filter`: Motion hands all three to
  // WAAPI, so the blur-out runs on the compositor, not the main thread.
  const tableFade = reduceMotion
    ? { opacity: onTable ? 1 : 0 }
    : onTable
      ? { filter: "blur(0px)", opacity: 1, transform: "scale(1)" }
      : { filter: "blur(8px)", opacity: 0, transform: "scale(0.94)" };

  return (
    <div
      // A size container: the table is laid out in `cq*` units of the stage.
      // No cursor at any point: the rake is the pointer, then nothing.
      className="pk-stage [container-type:size] cursor-none p-0!"
    >
      <div
        className="inset-0 touch-none"
        onPointerLeave={onLeave}
        onPointerMove={onMove}
        ref={tableRef}
        style={{ position: "absolute" }}
      >
        <motion.div
          animate={tableFade}
          className="absolute inset-0"
          transition={{
            delay: onTable ? 0 : TABLE_HOLD_MS / 1000,
            duration: 0.6,
            ease: [0.23, 1, 0.32, 1],
          }}
        >
          {/* An invisible copy of the hand's column: the pot centres on the deck
              in CSS, so the server renders it where hydration leaves it. */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-12"
          >
            <div
              className="relative"
              style={{
                ...HAND_SIZE,
                height: "calc(var(--card-w) * 1.4)",
                width: "calc(var(--card-w) + 4 * var(--pitch))",
              }}
            >
              <div
                className="absolute top-1/2 left-1/2 aspect-square -translate-1/2 rounded-full border border-dashed transition-colors duration-500"
                style={{
                  borderColor: allIn ? "var(--pk-hi)" : "var(--pk-line)",
                  width: `min(${POT_R * 2}px, 76cqh)`,
                }}
              >
                {!playing && !reduceMotion ? (
                  <motion.span
                    animate={{ opacity: 0, transform: "scale(1.12)" }}
                    className="absolute inset-0 rounded-full border border-dashed border-[var(--pk-hi)]"
                    initial={{ opacity: 0.9, transform: "scale(1)" }}
                    transition={{ duration: 0.7, ease: [0.23, 1, 0.32, 1] }}
                  />
                ) : null}
                <div className="absolute top-1/2 left-full flex -translate-y-1/2 items-center">
                  <span className="size-1 -translate-x-1/2 rounded-full bg-[var(--pk-line)]" />
                  <span className="h-px w-28 bg-[var(--pk-line)]" />
                  <div className="ms-5 flex flex-col gap-1.5 whitespace-nowrap">
                    <motion.span
                      animate={{
                        filter: "blur(0px)",
                        opacity: 1,
                        transform: "translateY(0px)",
                      }}
                      className={`pk-caps text-[20px] ${allIn ? "text-foreground!" : ""}`}
                      initial={
                        allIn
                          ? reduceMotion
                            ? { opacity: 0 }
                            : {
                                filter: "blur(4px)",
                                opacity: 0,
                                transform: "translateY(6px)",
                              }
                          : false
                      }
                      key={allIn ? "all-in" : "pot"}
                      transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                    >
                      {allIn ? "All in" : "The pot"}
                    </motion.span>
                    <span className="text-[20px] tabular-nums">
                      {count} of {CHIPS.length} chips
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <p className="invisible text-3xl">
              A perfect hand. Five 100s on alexandrejoly.me.
            </p>
          </div>

          {mounted &&
            CHIPS.map((chip, index) => {
              const values = chips[index];
              if (!values) {
                return null;
              }
              return (
                <Chip
                  inPot={inPot[index] ?? false}
                  key={chip.label}
                  label={chip.label}
                  reduceMotion={reduceMotion ?? false}
                  rotate={values.rotate}
                  suit={chip.suit}
                  x={values.x}
                  y={values.y}
                />
              );
            })}
        </motion.div>

        {/* The deck waits in the middle of the pot, where the hand ends. */}
        <div
          className={`pointer-events-none absolute inset-0 flex flex-col items-center justify-center ${
            // Above the rake once it takes off, as it passes the camera.
            onTable ? "" : "z-10"
          } gap-12`}
        >
          <div className="pointer-events-auto" ref={deckRef}>
            <motion.div
              // A `transform` string, not `scale`/`rotate`: Motion runs it on
              // WAAPI, off the main thread.
              animate={{
                transform: onTable
                  ? `scale(${IDLE_DECK_SCALE}) rotate(0deg)`
                  : [
                      `scale(${IDLE_DECK_SCALE}) rotate(0deg)`,
                      `scale(${ARRIVE_PEAK}) rotate(0deg)`,
                      "scale(1) rotate(0deg)",
                    ],
              }}
              initial={false}
              transition={
                reduceMotion
                  ? { duration: 0 }
                  : onTable
                    ? { duration: 0.65, ease: [0.23, 1, 0.32, 1] }
                    : {
                        duration: FLIGHT_MS / 1000,
                        ease: [
                          [0.23, 1, 0.32, 1],
                          [0.45, 0, 0.55, 1],
                        ],
                        times: [0, PEAK_AT, 1],
                      }
              }
            >
              <RoyalHand
                lit={lit}
                onToggle={onHand}
                open={open}
                size={HAND_SIZE}
              />
            </motion.div>
          </div>
          <p className="text-3xl">
            {CAPTION.map((word, index) => (
              <Fragment key={word.text}>
                <span
                  className={`pk-rise ${word.strong ? "text-foreground font-medium" : ""}`}
                  data-on={lit}
                  style={{
                    transitionDelay: lit
                      ? `${CAPTION_START + index * CAPTION_STEP}ms`
                      : "0ms",
                  }}
                >
                  {word.text}
                </span>{" "}
              </Fragment>
            ))}
          </p>
        </div>

        <motion.div
          aria-hidden
          className="pointer-events-none absolute top-0 left-0 will-change-transform"
          style={{
            opacity: rakeOpacity,
            originX: 0,
            originY: 0,
            rotate: rakeRotate,
            x: rakeX,
            y: rakeY,
          }}
        >
          <Rake />
        </motion.div>
      </div>
    </div>
  );
};

// Drawn like the cards: a hairline outline on the face fill, the 3px
// extruded edge, a dashed axis down the handle and a pin at the joint.
const Rake = () => (
  <>
    <div
      className="pk-rake absolute rounded-full"
      style={{
        height: HANDLE,
        left: -RAKE_HALF,
        top: 0,
        width: RAKE_HALF * 2,
      }}
    >
      <div className="absolute inset-y-4 left-1/2 border-l border-dashed border-[var(--pk-line)]" />
    </div>
    <div
      className="pk-rake absolute rounded-full"
      style={{
        height: RAKE_HALF * 2,
        left: -HEAD_HALF,
        top: -RAKE_HALF,
        width: HEAD_HALF * 2,
      }}
    >
      <div className="absolute inset-x-4 top-1/2 border-t border-dashed border-[var(--pk-line)]" />
    </div>
    <div className="absolute -top-[5px] -left-[5px] size-[10px] rounded-full border border-[var(--pk-hi)] bg-[var(--pk-face)]" />
  </>
);
