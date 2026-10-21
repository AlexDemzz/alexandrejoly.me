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

/**
 * One path per level, each cell a square inset by the corner radius, so the
 * graph costs a few bytes per day instead of a `<rect>`.
 */
export const levelPaths = (weeks: number[][]): string[] => {
  const paths = Array.from({ length: LEVELS }, () => "");
  for (const [x, week] of weeks.entries()) {
    const offset = firstWeekday(week, x);
    for (const [day, level] of week.entries()) {
      const left = x * PITCH + CORNER_RADIUS;
      const top = (offset + day) * PITCH + CORNER_RADIUS;
      paths[level] += `M${left} ${top}h${INNER}v${INNER}h-${INNER}z`;
    }
  }
  return paths;
};

export const graphViewBox = (weekCount: number) =>
  `0 0 ${weekCount * PITCH - GAP} ${DAYS_PER_WEEK * PITCH - GAP}`;
