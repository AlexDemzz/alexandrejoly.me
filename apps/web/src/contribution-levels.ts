const QUARTILES = [0.25, 0.5, 0.75] as const;

/**
 * Builds a count → level (0–4) scale from the quartiles of the active days.
 * GitHub's own levels scale from the busiest day, so one burst of activity
 * flattens the rest of the year into the first level.
 */
export const levelScale = (counts: number[]): ((count: number) => number) => {
  const active = counts.filter((count) => count > 0).toSorted((a, b) => a - b);
  const thresholds = QUARTILES.map(
    (quartile) => active[Math.floor(active.length * quartile)] ?? 0
  );

  return (count) =>
    count === 0
      ? 0
      : 1 + thresholds.filter((threshold) => count > threshold).length;
};
