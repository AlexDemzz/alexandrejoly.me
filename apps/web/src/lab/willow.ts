import {
  approach,
  cellsFor,
  clamp01,
  clear,
  createRandom,
  fixed,
  glyphFont,
  hash,
  rubberBand,
  stepSpring,
} from "./engine";
import type { Cells, Frame, Scene, SceneApi, SpringState } from "./engine";

const COLUMNS = 54;
const FOLIAGE = `.,:;"*%&#@`;
const BARK = ".:;|!1I[H#";
const TWIGS = "|/\\-";
const GRASS = ".,:;!i|";
const BLADES = "\\|/";
const DRIFT = `*~"'`;
/** Share of the falling leaves that carry the accent. */
const TURNED = 0.4;
const TAU = Math.PI * 2;
const DITHER = 0.07;
const GLYPH_SIZE = 0.86;

/** Low sun from the upper left, in screen axes, towards the viewer. */
const LIGHT_X = -0.6;
const LIGHT_Y = -0.5;
const LIGHT_Z = 0.62;
const HOT = 0.93;

const SEED = 7;
/** The row the trunk stands on, as a share of the rows. */
const GROUND = 0.875;
const TOP_MARGIN = 2.5;
const SIDE_MARGIN = 0.5;
/** How far the ground falls away towards the card's edges, in cells. */
const MOUND = 1.6;

// The tree is grown in units of its own height, then fitted to the grid.
const PIECES = 3;
const MAX_DEPTH = 4;
const TRUNK_LENGTH = 0.3;
const TRUNK_GIRTH = 0.07;
const ROOT_FLARE = 0.9;
const ROOT_REACH = 0.045;
const MAIN_LENGTH = 0.25;
const MAIN_SPREAD = 0.86;
const SPREAD = 0.4;
const JITTER = 0.34;
const WANDER = 0.3;
const TRUNK_WANDER = 0.07;
const SHRINK = 0.78;
const THIN = 0.62;
/** A limb never points lower than this, so the crown's hem droops a little. */
const DROOP = 1.42;
const LEAFY = 1;
const TUFT = 0.1;

const SEGMENT = 7;
const CLUSTER = 6;

/** Bend angle along the tree grows with height to this power: stiff base, supple top. */
const CURVE = 0.8;
const SPINE = 48;
const SPINE_REACH = 1.25;
/** How much of the crown's own swing the top of the wood takes. */
const WOOD_FLEX = 0.65;

/** Radians at the top of the tree. Below FREE the pull is 1:1. */
const FREE = 0.24;
const LIMIT = 0.74;
/** The slope of `rubberBand` at rest, to invert it when catching a swing. */
const RUBBER = 0.55;
const LOWEST_GRIP = 0.45;
const MAX_FLING = 0.0042;
const TRUNK_SPRING = { damping: 4.6, stiffness: 58 };
const CROWN_SPRING = { damping: 3.1, stiffness: 36 };
const HELD_SPRING = { damping: 30, stiffness: 260 };
const SETTLE_TAU = 110;
const AT_REST = 0.002;

const BREEZE = 0.034;
const LEAN = 0.012;
const FLUTTER = 0.32;

const MAX_LEAVES = 96;
const MAX_BURST = 44;
const BURST_PER_SPEED = 9;
const BURST_PER_BEND = 16;
const BURST_EVERY = 16;
const LEAF_EVERY = 1100;
const LEAF_SPREAD = 2400;
const FALL = 5.2;
const LIE = 3.2;

const mix = (from: number, to: number, t: number) => from + (to - from) * t;

const pick = (set: string, light: number, noise: number) =>
  set[
    Math.max(
      0,
      Math.min(
        set.length - 1,
        Math.floor((light + (noise - 0.5) * DITHER) * set.length)
      )
    )
  ];

interface Tree {
  baseX: number;
  baseY: number;
  clusterCount: number;
  /** x, y, radius, depth, tone, phase; in cells from the trunk's foot, y up. */
  clusters: Float32Array;
  height: number;
  segmentCount: number;
  /** x0, y0, x1, y1, half width at each end, depth. */
  segments: Float32Array;
}

interface Limb {
  angle: number;
  depth: number;
  length: number;
  width: number;
  x: number;
  y: number;
}

interface Sprout {
  clusters: number[];
  random: () => number;
  segments: number[];
}

const girth = ({ depth, length, width }: Limb, t: number) =>
  depth === 0
    ? width *
      (1 + ROOT_FLARE * Math.exp((-t * length) / ROOT_REACH)) *
      (1 - 0.22 * t)
    : width * (1 - 0.3 * t);

const addTuft = (
  { clusters, random }: Sprout,
  x: number,
  y: number,
  depth: number
) => {
  const outer = depth === MAX_DEPTH;
  const count = outer && random() < 0.35 ? 2 : 1;
  for (let leaf = 0; leaf < count; leaf += 1) {
    const radius = TUFT * (outer ? 0.72 + 0.4 * random() : 1.1);
    const angle = random() * TAU;
    const reach = outer ? radius * 0.7 * random() : 0;
    clusters.push(
      x + Math.cos(angle) * reach,
      y + Math.sin(angle) * reach * 0.8,
      radius,
      outer ? random() * 2 - 1 : -1.2,
      0,
      random()
    );
  }
};

/** Grows one limb in a few wandering pieces, then forks it. */
const grow = (limb: Limb, sprout: Sprout) => {
  const { random, segments } = sprout;
  const { depth, length } = limb;
  const step = length / PIECES;
  let { angle, x, y } = limb;
  for (let piece = 0; piece < PIECES; piece += 1) {
    angle += (random() - 0.5) * (depth === 0 ? TRUNK_WANDER : WANDER);
    const nextX = x + Math.sin(angle) * step;
    const nextY = y + Math.cos(angle) * step;
    segments.push(
      x,
      y,
      nextX,
      nextY,
      girth(limb, piece / PIECES),
      girth(limb, (piece + 1) / PIECES),
      depth
    );
    x = nextX;
    y = nextY;
  }
  if (depth >= LEAFY) {
    addTuft(sprout, x, y, depth);
  }
  if (depth === MAX_DEPTH) {
    return;
  }
  const forks = depth === 0 ? 4 : 2;
  for (let fork = 0; fork < forks; fork += 1) {
    const side = (fork / (forks - 1)) * 2 - 1;
    const turn =
      side * (depth === 0 ? MAIN_SPREAD : SPREAD) + (random() - 0.5) * JITTER;
    const heading = Math.max(-DROOP, Math.min(DROOP, angle + turn));
    // Limbs that climb grow longer than those that reach sideways: a dome.
    const vigour = 0.72 + 0.4 * Math.cos(heading);
    grow(
      {
        angle: heading,
        depth: depth + 1,
        length: (depth === 0 ? MAIN_LENGTH : length * SHRINK) * vigour,
        width: girth(limb, 1) * THIN,
        x,
        y,
      },
      sprout
    );
  }
};

interface Bounds {
  bottom: number;
  side: number;
  top: number;
}

const boundsOf = (clusters: number[]): Bounds => {
  const bounds: Bounds = { bottom: Infinity, side: 0, top: 0 };
  for (let at = 0; at < clusters.length; at += CLUSTER) {
    const radius = clusters[at + 2];
    bounds.bottom = Math.min(bounds.bottom, clusters[at + 1] - radius);
    bounds.side = Math.max(bounds.side, Math.abs(clusters[at]) + radius);
    bounds.top = Math.max(bounds.top, clusters[at + 1] + radius);
  }
  return bounds;
};

/** Grows the tree once, fits it to the grid and lights each tuft as part of one big crown. */
const buildTree = ({ cols, rows }: Cells): Tree => {
  const sprout: Sprout = {
    clusters: [],
    random: createRandom(SEED),
    segments: [],
  };
  grow(
    {
      angle: 0,
      depth: 0,
      length: TRUNK_LENGTH,
      width: TRUNK_GIRTH,
      x: 0,
      y: -0.03,
    },
    sprout
  );
  const baseY = Math.round(rows * GROUND);
  const bounds = boundsOf(sprout.clusters);
  const scale = Math.min(
    (baseY - TOP_MARGIN) / bounds.top,
    (cols / 2 - SIDE_MARGIN) / bounds.side
  );
  const segments = Float32Array.from(sprout.segments);
  for (let at = 0; at < segments.length; at += SEGMENT) {
    for (let field = 0; field < SEGMENT - 1; field += 1) {
      segments[at + field] *= scale;
    }
  }
  const clusters = Float32Array.from(sprout.clusters);
  const centerY = (bounds.top + bounds.bottom) / 2;
  const radiusY = (bounds.top - bounds.bottom) / 2;
  for (let at = 0; at < clusters.length; at += CLUSTER) {
    const depth = clusters[at + 3];
    const normalX = clusters[at] / bounds.side;
    const normalY = -(clusters[at + 1] - centerY) / radiusY;
    const normalZ = 0.55 + 0.35 * depth;
    const squared = normalX * normalX + normalY * normalY + normalZ * normalZ;
    const facing =
      (normalX * LIGHT_X + normalY * LIGHT_Y + normalZ * LIGHT_Z) /
      Math.sqrt(squared);
    clusters[at + 4] = clamp01(0.56 + 0.5 * facing);
    clusters[at] *= scale;
    clusters[at + 1] *= scale;
    clusters[at + 2] *= scale;
    clusters[at + 3] = depth * clusters[at + 2] * 0.7;
  }
  return {
    baseX: cols / 2,
    baseY,
    clusterCount: clusters.length / CLUSTER,
    clusters,
    height: scale * bounds.top,
    segmentCount: segments.length / SEGMENT,
    segments,
  };
};

interface Spine {
  angle: Float32Array;
  reach: number;
  x: Float32Array;
  y: Float32Array;
}

const createSpine = (): Spine => ({
  angle: new Float32Array(SPINE),
  reach: 1,
  x: new Float32Array(SPINE),
  y: new Float32Array(SPINE),
});

/** Bends the tree's axis: the angle grows with height, the foot stays put. */
const bendSpine = (spine: Spine, bend: number, height: number) => {
  spine.reach = height * SPINE_REACH;
  const step = spine.reach / (SPINE - 1);
  let x = 0;
  let y = 0;
  for (let at = 1; at < SPINE; at += 1) {
    const angle = bend * (((at - 0.5) * step) / height) ** CURVE;
    x += Math.sin(angle) * step;
    y += Math.cos(angle) * step;
    spine.x[at] = x;
    spine.y[at] = y;
    spine.angle[at] = bend * ((at * step) / height) ** CURVE;
  }
};

interface Point {
  x: number;
  y: number;
}

/** Carries a point of the resting tree onto a bent axis. */
const place = (spine: Spine, x: number, y: number, out: Point) => {
  const along = Math.min(spine.reach, Math.max(0, y));
  const at = (along / spine.reach) * (SPINE - 1);
  const index = Math.min(SPINE - 2, Math.floor(at));
  const t = at - index;
  const angle = mix(spine.angle[index], spine.angle[index + 1], t);
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const over = y - along;
  out.x = mix(spine.x[index], spine.x[index + 1], t) + x * cos + over * sin;
  out.y = mix(spine.y[index], spine.y[index + 1], t) - x * sin + over * cos;
};

interface Pose {
  /** Strength of the breeze, 0 when the air is still. */
  air: number;
  /** Milliseconds of wind so far. */
  clock: number;
  crown: Spine;
  trunk: Spine;
}

/** A point between the trunk's swing and the crown's softer one. */
const sway = (pose: Pose, x: number, y: number, flex: number, out: Point) => {
  place(pose.trunk, x, y, out);
  const { x: trunkX, y: trunkY } = out;
  place(pose.crown, x, y, out);
  out.x = mix(trunkX, out.x, flex);
  out.y = mix(trunkY, out.y, flex);
};

interface Field {
  /** Share of the cell a tuft covers; 0 where there is no leaf. */
  edge: Float32Array;
  lift: Float32Array;
  normalX: Float32Array;
  normalY: Float32Array;
  tone: Float32Array;
  /** 0 for thick wood, else 1 + the twig's glyph. */
  twig: Uint8Array;
  wood: Float32Array;
  woodLight: Float32Array;
}

const createField = (count: number): Field => ({
  edge: new Float32Array(count),
  lift: new Float32Array(count),
  normalX: new Float32Array(count),
  normalY: new Float32Array(count),
  tone: new Float32Array(count),
  twig: new Uint8Array(count),
  wood: new Float32Array(count),
  woodLight: new Float32Array(count),
});

interface Tuft {
  lift: number;
  radius: number;
  tone: number;
  x: number;
  y: number;
}

/** Draws a tuft as a ball into the field: the nearest surface wins the cell. */
const splat = (field: Field, { cols, rows }: Cells, tuft: Tuft) => {
  const { lift, radius, tone, x, y } = tuft;
  const left = Math.max(0, Math.floor(x - radius));
  const right = Math.min(cols - 1, Math.ceil(x + radius));
  const top = Math.max(0, Math.floor(y - radius));
  const bottom = Math.min(rows - 1, Math.ceil(y + radius));
  for (let row = top; row <= bottom; row += 1) {
    for (let col = left; col <= right; col += 1) {
      const offsetX = col + 0.5 - x;
      const offsetY = row + 0.5 - y;
      const squared = offsetX * offsetX + offsetY * offsetY;
      const distance = Math.sqrt(squared);
      if (distance < radius) {
        const index = row * cols + col;
        const surface =
          lift + Math.sqrt(radius * radius - distance * distance) + 4;
        if (surface > field.lift[index]) {
          field.lift[index] = surface;
          field.edge[index] = Math.min(1, radius - distance);
          field.normalX[index] = offsetX / radius;
          field.normalY[index] = offsetY / radius;
          field.tone[index] = tone;
        }
      }
    }
  }
};

const rasterLeaves = (tree: Tree, pose: Pose, field: Field, cells: Cells) => {
  const { baseX, baseY, clusterCount, clusters } = tree;
  const point: Point = { x: 0, y: 0 };
  const tuft: Tuft = { lift: 0, radius: 0, tone: 0, x: 0, y: 0 };
  field.edge.fill(0);
  field.lift.fill(0);
  for (let cluster = 0; cluster < clusterCount; cluster += 1) {
    const at = cluster * CLUSTER;
    const x = clusters[at];
    const y = clusters[at + 1];
    sway(pose, x, y, 1, point);
    // A wave of wind crosses the crown, so the tufts do not move as one.
    const wave = pose.clock * 0.0031 + clusters[at + 5] * TAU - x * 0.22;
    tuft.x = baseX + point.x + Math.sin(wave) * FLUTTER * pose.air;
    tuft.y = baseY - point.y + Math.cos(wave * 0.8) * FLUTTER * 0.5 * pose.air;
    tuft.radius = clusters[at + 2];
    tuft.lift = clusters[at + 3];
    tuft.tone = clusters[at + 4];
    splat(field, cells, tuft);
  }
};

interface Stroke {
  depth: number;
  fromHalf: number;
  fromX: number;
  fromY: number;
  toHalf: number;
  toX: number;
  toY: number;
}

const twigOf = (alongX: number, alongY: number) => {
  if (Math.abs(alongX) < 0.42 * Math.abs(alongY)) {
    return 1;
  }
  if (Math.abs(alongY) < 0.42 * Math.abs(alongX)) {
    return 4;
  }
  return alongX * alongY < 0 ? 2 : 3;
};

/** Draws one piece of wood as a lit cylinder, or as a line glyph once it is thin. */
const stroke = (field: Field, { cols, rows }: Cells, piece: Stroke) => {
  const { depth, fromHalf, fromX, fromY, toHalf, toX, toY } = piece;
  const alongX = toX - fromX;
  const alongY = toY - fromY;
  const reachSquared = alongX * alongX + alongY * alongY;
  const length = Math.max(1e-3, Math.sqrt(reachSquared));
  const lengthSquared = length ** 2;
  const reach = Math.max(fromHalf, toHalf) + 0.5;
  const left = Math.max(0, Math.floor(Math.min(fromX, toX) - reach));
  const right = Math.min(cols - 1, Math.ceil(Math.max(fromX, toX) + reach));
  const top = Math.max(0, Math.floor(Math.min(fromY, toY) - reach));
  const bottom = Math.min(rows - 1, Math.ceil(Math.max(fromY, toY) + reach));
  const acrossX = -alongY / length;
  const acrossY = alongX / length;
  const twig = Math.max(fromHalf, toHalf) < 0.55 ? twigOf(alongX, alongY) : 0;
  // Limbs under the crown sit in its shade.
  const shade = depth === 0 ? 1 : 0.78;
  for (let row = top; row <= bottom; row += 1) {
    for (let col = left; col <= right; col += 1) {
      const offsetX = col + 0.5 - fromX;
      const offsetY = row + 0.5 - fromY;
      const t = clamp01((offsetX * alongX + offsetY * alongY) / lengthSquared);
      const half = mix(fromHalf, toHalf, t) + 0.5;
      const awayX = offsetX - alongX * t;
      const awayY = offsetY - alongY * t;
      const awaySquared = awayX * awayX + awayY * awayY;
      const distance = Math.sqrt(awaySquared);
      const cover = Math.min(1, half - distance);
      const index = row * cols + col;
      if (cover > field.wood[index]) {
        const side = (awayX * acrossX + awayY * acrossY) / half;
        const facing =
          side * (acrossX * LIGHT_X + acrossY * LIGHT_Y) +
          Math.sqrt(Math.max(0, 1 - side * side)) * LIGHT_Z;
        field.wood[index] = cover;
        field.woodLight[index] = (0.3 + 0.7 * Math.max(0, facing)) * shade;
        field.twig[index] = twig;
      }
    }
  }
};

const rasterWood = (tree: Tree, pose: Pose, field: Field, cells: Cells) => {
  const { baseX, baseY, height, segmentCount, segments } = tree;
  const point: Point = { x: 0, y: 0 };
  const piece: Stroke = {
    depth: 0,
    fromHalf: 0,
    fromX: 0,
    fromY: 0,
    toHalf: 0,
    toX: 0,
    toY: 0,
  };
  field.wood.fill(0);
  for (let segment = 0; segment < segmentCount; segment += 1) {
    const at = segment * SEGMENT;
    const fromY = segments[at + 1];
    const toY = segments[at + 3];
    sway(
      pose,
      segments[at],
      fromY,
      WOOD_FLEX * clamp01(fromY / height) ** 2,
      point
    );
    piece.fromX = baseX + point.x;
    piece.fromY = baseY - point.y;
    sway(
      pose,
      segments[at + 2],
      toY,
      WOOD_FLEX * clamp01(toY / height) ** 2,
      point
    );
    piece.toX = baseX + point.x;
    piece.toY = baseY - point.y;
    piece.fromHalf = segments[at + 4];
    piece.toHalf = segments[at + 5];
    piece.depth = segments[at + 6];
    stroke(field, cells, piece);
  }
};

const groundAt = ({ baseX, baseY }: Tree, x: number) =>
  baseY + MOUND * ((x - baseX) / baseX) ** 2;

/** What only a resize changes for a cell. */
interface Still {
  /** The dither of the bark, in [0, 1). */
  bark: Float64Array;
  /** Rows below the ground line; negative above it. */
  depth: Float64Array;
  /** The dither of the leaves and the grass, in [0, 1). */
  grain: Float64Array;
}

const buildStill = ({ cols, count }: Cells, tree: Tree): Still => {
  const still: Still = {
    bark: new Float64Array(count),
    depth: new Float64Array(count),
    grain: new Float64Array(count),
  };
  for (let index = 0; index < count; index += 1) {
    const col = index % cols;
    const row = Math.floor(index / cols);
    still.bark[index] = hash(col, row * 3);
    still.depth[index] = row + 0.5 - groundAt(tree, col + 0.5);
    still.grain[index] = hash(col, row);
  }
  return still;
};

interface Leaves {
  age: Float32Array;
  count: number;
  /** Seconds left lying on the grass; 0 while in the air. */
  rest: Float32Array;
  seed: Float32Array;
  vx: Float32Array;
  vy: Float32Array;
  x: Float32Array;
  y: Float32Array;
}

const createLeaves = (): Leaves => ({
  age: new Float32Array(MAX_LEAVES),
  count: 0,
  rest: new Float32Array(MAX_LEAVES),
  seed: new Float32Array(MAX_LEAVES),
  vx: new Float32Array(MAX_LEAVES),
  vy: new Float32Array(MAX_LEAVES),
  x: new Float32Array(MAX_LEAVES),
  y: new Float32Array(MAX_LEAVES),
});

const dropLeaf = (leaves: Leaves, index: number) => {
  const last = leaves.count - 1;
  leaves.age[index] = leaves.age[last];
  leaves.rest[index] = leaves.rest[last];
  leaves.seed[index] = leaves.seed[last];
  leaves.vx[index] = leaves.vx[last];
  leaves.vy[index] = leaves.vy[last];
  leaves.x[index] = leaves.x[last];
  leaves.y[index] = leaves.y[last];
  leaves.count = last;
};

interface Gust {
  pose: Pose;
  random: () => number;
  /** How fast the crown is moving sideways, in cells per second. */
  throw: number;
}

/** Breaks a leaf off a random tuft, thrown the way the crown is moving. */
const shed = (
  leaves: Leaves,
  tree: Tree,
  { pose, random, throw: push }: Gust
) => {
  if (leaves.count >= MAX_LEAVES) {
    return;
  }
  const at = Math.floor(random() * tree.clusterCount) * CLUSTER;
  const point: Point = { x: 0, y: 0 };
  sway(pose, tree.clusters[at], tree.clusters[at + 1], 1, point);
  const radius = tree.clusters[at + 2];
  const index = leaves.count;
  leaves.x[index] = tree.baseX + point.x + (random() - 0.5) * radius * 1.4;
  leaves.y[index] = tree.baseY - point.y + (random() - 0.2) * radius;
  leaves.vx[index] = push * (0.3 + 0.7 * random()) + (random() - 0.5) * 3;
  leaves.vy[index] = -Math.abs(push) * 0.25 * random();
  leaves.age[index] = 0;
  leaves.rest[index] = 0;
  leaves.seed[index] = random();
  leaves.count += 1;
};

const driftLeaves = (
  leaves: Leaves,
  tree: Tree,
  cells: Cells,
  wind: number,
  dt: number
) => {
  const seconds = dt / 1000;
  for (let index = leaves.count - 1; index >= 0; index -= 1) {
    if (leaves.rest[index] > 0) {
      leaves.rest[index] -= seconds;
      if (leaves.rest[index] <= 0) {
        dropLeaf(leaves, index);
      }
    } else {
      leaves.age[index] += seconds;
      const turn = leaves.age[index] * 4.2 + leaves.seed[index] * TAU;
      leaves.vx[index] = approach(
        leaves.vx[index],
        wind + Math.sin(turn) * 3.4,
        dt,
        420
      );
      leaves.vy[index] = approach(
        leaves.vy[index],
        FALL * (0.7 + 0.45 * Math.cos(turn * 2)),
        dt,
        380
      );
      leaves.x[index] += leaves.vx[index] * seconds;
      leaves.y[index] += leaves.vy[index] * seconds;
      const ground = groundAt(tree, leaves.x[index]) + 0.2;
      if (leaves.x[index] < -1 || leaves.x[index] > cells.cols + 1) {
        dropLeaf(leaves, index);
      } else if (leaves.y[index] >= ground) {
        leaves.y[index] = ground;
        leaves.rest[index] = LIE;
      }
    }
  }
};

const paintLeaves = (
  { ctx, palette }: Frame,
  leaves: Leaves,
  { cell, originX, originY }: Cells
) => {
  for (let index = 0; index < leaves.count; index += 1) {
    const lying = leaves.rest[index] > 0;
    const turn = leaves.age[index] * 2.6 + leaves.seed[index] * DRIFT.length;
    const glyph = lying ? "," : DRIFT[Math.floor(turn) % DRIFT.length];
    ctx.globalAlpha = lying
      ? 0.8 * clamp01(leaves.rest[index])
      : clamp01(leaves.age[index] * 5);
    ctx.fillStyle =
      leaves.seed[index] < TURNED ? palette.hot : palette.foreground;
    ctx.fillText(
      glyph,
      originX + leaves.x[index] * cell,
      originY + leaves.y[index] * cell
    );
  }
};

interface Spot {
  col: number;
  index: number;
  row: number;
  x: number;
  y: number;
}

const paintLeaf = (
  { ctx, palette }: Frame,
  field: Field,
  grain: number,
  { index, x, y }: Spot
) => {
  const normalX = field.normalX[index];
  const normalY = field.normalY[index];
  const normalZ = Math.sqrt(
    Math.max(0, 1 - normalX * normalX - normalY * normalY)
  );
  const facing = Math.max(
    0,
    normalX * LIGHT_X + normalY * LIGHT_Y + normalZ * LIGHT_Z
  );
  const tone = field.tone[index];
  // Each tuft is lit as a ball, and the whole crown as a bigger one.
  const light = clamp01(
    0.2 + 0.8 * (0.3 * tone + 0.7 * facing * (0.42 + 0.58 * tone))
  );
  ctx.globalAlpha = (0.2 + 0.8 * light) * (0.55 + 0.45 * field.edge[index]);
  ctx.fillStyle = light > HOT ? palette.hot : palette.foreground;
  ctx.fillText(pick(FOLIAGE, light, grain), x, y);
};

const paintWood = (
  { ctx, palette }: Frame,
  field: Field,
  grain: number,
  { index, x, y }: Spot
) => {
  const light = clamp01(field.woodLight[index]);
  const twig = field.twig[index];
  ctx.globalAlpha = (0.24 + 0.76 * light) * (0.4 + 0.6 * field.wood[index]);
  ctx.fillStyle = palette.foreground;
  ctx.fillText(twig === 0 ? pick(BARK, light, grain) : TWIGS[twig - 1], x, y);
};

interface Land {
  /** Where the crown's shadow falls, in cells. */
  shadow: number;
  tree: Tree;
  /** The lean of the grass, from -1 to 1. */
  wind: number;
}

const paintGround = (
  { ctx, palette }: Frame,
  { shadow, tree, wind }: Land,
  { col, x, y }: Spot,
  depth: number,
  noise: number
) => {
  const shade =
    0.62 * Math.exp(-(((col + 0.5 - shadow) / (tree.height * 0.36)) ** 2));
  const light = (0.16 + 0.5 * Math.exp(-depth / 2.4)) * (1 - shade);
  let glyph = pick(GRASS, light * 1.6, noise);
  if (depth < 1 && noise > 0.3) {
    const lean = wind + Math.sin(col * 0.9 + noise * 4) * 0.35;
    glyph = BLADES[Math.max(0, Math.min(2, Math.round(lean * 1.4) + 1))];
  }
  ctx.globalAlpha = clamp01(0.12 + light);
  ctx.fillStyle = palette.foreground;
  ctx.fillText(glyph, x, y);
};

const band = (raw: number) => {
  const over = Math.abs(raw) - FREE;
  return over <= 0
    ? raw
    : Math.sign(raw) * (FREE + rubberBand(over, LIMIT - FREE));
};

/** The pull that gives a bend: `band`, backwards. */
const unband = (bend: number) => {
  const over = Math.abs(bend) - FREE;
  if (over <= 0) {
    return bend;
  }
  const span = LIMIT - FREE;
  const share = Math.min(0.96, over / span);
  return Math.sign(bend) * (FREE + (span / RUBBER) * (1 / (1 - share) - 1));
};

/** Sideways travel, in cells per radian of bend, of a point this high up the tree. */
const travel = (along: number, height: number) =>
  along ** (CURVE + 1) / ((CURVE + 1) * height ** CURVE);

const breeze = (clock: number) =>
  LEAN +
  BREEZE *
    (0.55 * Math.sin(clock * 0.0009) +
      0.3 * Math.sin(clock * 0.0021 + 1.7) +
      0.15 * Math.sin(clock * 0.0047 + 0.4));

const stateOf = (held: boolean, swinging: boolean, still: boolean) => {
  if (held) {
    return "held";
  }
  if (swinging) {
    return still ? "settling" : "swinging";
  }
  return still ? "still" : "breeze";
};

export const createWillow = ({ report }: SceneApi): Scene => {
  const trunk: SpringState = { value: 0, velocity: 0 };
  const crown: SpringState = { value: 0, velocity: 0 };
  const pose: Pose = {
    air: 1,
    clock: 0,
    crown: createSpine(),
    trunk: createSpine(),
  };
  const leaves = createLeaves();
  const random = createRandom(SEED + 1);
  const gust: Gust = { pose, random, throw: 0 };
  const spot: Spot = { col: 0, index: 0, row: 0, x: 0, y: 0 };
  let cells: Cells | null = null;
  let tree: Tree | null = null;
  let still: Still | null = null;
  let font = "";
  let field = createField(0);
  let held = false;
  /** Radians of bend per pixel of drag, set by how high the tree was grabbed. */
  let gain = 0;
  let caught = 0;
  let pending = 0;
  let sinceShed = 0;
  let nextLeaf = LEAF_EVERY;

  const settle = (dt: number) => {
    if (!held) {
      trunk.value = approach(trunk.value, 0, dt, SETTLE_TAU);
      if (Math.abs(trunk.value) < AT_REST) {
        trunk.value = 0;
      }
    }
    trunk.velocity = 0;
    crown.value = trunk.value;
    crown.velocity = 0;
    pose.air = 0;
    pending = 0;
    leaves.count = 0;
  };

  const swing = (dt: number) => {
    if (!held) {
      stepSpring(trunk, 0, dt, TRUNK_SPRING);
    }
    stepSpring(crown, trunk.value, dt, held ? HELD_SPRING : CROWN_SPRING);
    pose.clock += dt;
    pose.air = approach(pose.air, held ? 0.3 : 1, dt, 300);
  };

  const scatter = (dt: number, layout: Tree, grid: Cells) => {
    gust.throw = crown.velocity * 1000 * travel(layout.height, layout.height);
    sinceShed += dt;
    while (pending >= 1 && sinceShed >= BURST_EVERY) {
      shed(leaves, layout, gust);
      pending -= 1;
      sinceShed -= BURST_EVERY;
    }
    if (pending < 1) {
      sinceShed = 0;
    }
    if (pose.clock > nextLeaf) {
      gust.throw = 0;
      shed(leaves, layout, gust);
      nextLeaf = pose.clock + LEAF_EVERY + LEAF_SPREAD * random();
    }
    driftLeaves(leaves, layout, grid, breeze(pose.clock) * 90, dt);
  };

  return {
    draw: (frame) => {
      const { ctx, dt, reducedMotion } = frame;
      if (frame.resized || !cells || !tree || !still) {
        cells = cellsFor(frame, COLUMNS);
        tree = buildTree(cells);
        still = buildStill(cells, tree);
        font = glyphFont(cells.cell * GLYPH_SIZE);
        field = createField(cells.count);
        leaves.count = 0;
      }
      if (reducedMotion) {
        settle(dt);
      } else {
        swing(dt);
        scatter(dt, tree, cells);
      }

      const wind = breeze(pose.clock) * pose.air;
      const lean = trunk.value + wind * 0.45;
      bendSpine(pose.trunk, lean, tree.height);
      bendSpine(pose.crown, crown.value + wind, tree.height);
      rasterLeaves(tree, pose, field, cells);
      rasterWood(tree, pose, field, cells);

      const { cell, cols, count, originX, originY } = cells;
      const land: Land = {
        shadow:
          tree.baseX +
          tree.height * 0.1 +
          lean * travel(tree.height, tree.height) * 0.7,
        tree,
        wind: wind * 14 + crown.velocity * 600,
      };
      clear(frame);
      ctx.font = font;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      for (let index = 0; index < count; index += 1) {
        spot.index = index;
        spot.col = index % cols;
        spot.row = Math.floor(index / cols);
        spot.x = originX + (spot.col + 0.5) * cell;
        spot.y = originY + (spot.row + 0.5) * cell;
        const depth = still.depth[index];
        const wooden = field.wood[index] > 0;
        if (field.edge[index] > (wooden ? 0.4 : 0)) {
          paintLeaf(frame, field, still.grain[index], spot);
        } else if (wooden && depth < 1) {
          paintWood(frame, field, still.bark[index], spot);
        } else if (depth >= 0) {
          paintGround(frame, land, spot, depth, still.grain[index]);
        }
      }
      paintLeaves(frame, leaves, cells);

      const swinging =
        Math.abs(trunk.value) > AT_REST * 4 ||
        Math.abs(crown.value) > AT_REST * 4;
      const degrees = (lean * 180) / Math.PI;
      report(
        `bend ${fixed(degrees, 1, 5)}° · ω ${fixed(trunk.velocity * 1000, 2, 5)} rad/s · leaves ${fixed(leaves.count, 0, 2)} · ${stateOf(held, swinging, reducedMotion)}`
      );
      return held || !reducedMotion || trunk.value !== 0;
    },
    drag: ({ startX, x }) => {
      trunk.value = band(caught + (x - startX) * gain);
    },
    press: ({ y }) => {
      if (!(cells && tree)) {
        return;
      }
      held = true;
      const grip = (cells.originY + tree.baseY * cells.cell - y) / cells.cell;
      const along = Math.max(
        tree.height * LOWEST_GRIP,
        Math.min(tree.height, grip)
      );
      gain = 1 / (travel(along, tree.height) * cells.cell);
      caught = unband(trunk.value);
      trunk.velocity = 0;
    },
    release: ({ startX, vx, x }, { reducedMotion }) => {
      if (!held) {
        return;
      }
      held = false;
      if (reducedMotion) {
        return;
      }
      const raw = caught + (x - startX) * gain;
      // The band's slope here, so the fling leaves at the speed the tree had.
      const give = (band(raw + 1e-3) - band(raw - 1e-3)) / 2e-3;
      trunk.velocity = Math.max(
        -MAX_FLING,
        Math.min(MAX_FLING, vx * gain * give)
      );
      pending = Math.min(
        MAX_BURST,
        Math.abs(trunk.velocity) * 1000 * BURST_PER_SPEED +
          Math.abs(trunk.value) * BURST_PER_BEND
      );
    },
  };
};
