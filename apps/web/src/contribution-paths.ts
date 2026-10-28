export const CELL = 10;
export const GAP = 3;
export const DAYS_PER_WEEK = 7;
export const LEVELS = 5;

const PITCH = CELL + GAP;
const CORNER_RADIUS = 2;
const INNER = CELL - 2 * CORNER_RADIUS;

/**
 * Stroke width that grows each inner square back to a full cell; with round
 * joins its outer corners round to the cell's radius, as `rx` would.
 */
export const CELL_STROKE_WIDTH = 2 * CORNER_RADIUS;

/**
 * GitHub weeks run Sunday to Saturday: only the first one starts late and only
 * the last one ends early.
 */
const firstWeekday = (week: number[], index: number) =>
  index === 0 ? DAYS_PER_WEEK - week.length : 0;

const CELL_PATH = `h${INNER}v${INNER}h-${INNER}z`;

// A negative number separates itself with its minus sign.
const pair = (x: number, y: number) => (y < 0 ? `${x}${y}` : `${x} ${y}`);

/**
 * One path per level, each cell a square inset by the corner radius, so the
 * graph costs a few bytes per day instead of a `<rect>`. After a cell's `z` the
 * pen is back at its corner, so each further cell moves relative to it.
 */
export const levelPaths = (weeks: number[][]): string[] => {
  const paths = Array.from({ length: LEVELS }, () => "");
  const pens: ([number, number] | undefined)[] = Array.from({ length: LEVELS });
  for (const [x, week] of weeks.entries()) {
    const offset = firstWeekday(week, x);
    for (const [day, level] of week.entries()) {
      const left = x * PITCH + CORNER_RADIUS;
      const top = (offset + day) * PITCH + CORNER_RADIUS;
      const pen = pens[level];
      const move =
        pen === undefined
          ? `M${pair(left, top)}`
          : `m${pair(left - pen[0], top - pen[1])}`;
      paths[level] += `${move}${CELL_PATH}`;
      pens[level] = [left, top];
    }
  }
  return paths;
};

export const graphSize = (weekCount: number) => ({
  height: DAYS_PER_WEEK * PITCH - GAP,
  width: weekCount * PITCH - GAP,
});

export const graphViewBox = (weekCount: number) => {
  const { height, width } = graphSize(weekCount);
  return `0 0 ${width} ${height}`;
};

// Monochrome: GitHub's five quartiles become five strengths of foreground.
const LEVEL_OPACITY = [0.12, 0.3, 0.5, 0.75, 1] as const;

/**
 * The graph as a standalone black SVG, meant as a mask so the page paints it in
 * its own theme color. Group opacity keeps a cell's fill and stroke from
 * stacking.
 */
export const graphSvg = (weeks: number[][]): string => {
  const paths = levelPaths(weeks)
    .map((path, level) =>
      path === "" ? "" : `<path d="${path}" opacity="${LEVEL_OPACITY[level]}"/>`
    )
    .join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${graphViewBox(weeks.length)}" stroke="#000" stroke-linejoin="round" stroke-width="${CELL_STROKE_WIDTH}">${paths}</svg>`;
};
