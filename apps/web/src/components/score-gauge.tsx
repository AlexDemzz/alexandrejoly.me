const RADIUS = 6;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const SEGMENT_GAP = 2.5;

/** One arc per category, each filled to its own score. */
export const ScoreGauge = ({
  scores,
}: {
  scores: { label: string; value: number }[];
}) => {
  const slot = CIRCUMFERENCE / scores.length;
  const gap = scores.length > 1 ? SEGMENT_GAP : 0;
  return (
    <svg
      aria-hidden
      className="size-3.5 -rotate-90"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      viewBox="0 0 16 16"
    >
      {scores.map(({ label, value }, index) => (
        <circle
          cx={8}
          cy={8}
          key={label}
          opacity={value === 100 ? 1 : 0.6}
          r={RADIUS}
          strokeDasharray={`${((slot - gap) * value) / 100} ${CIRCUMFERENCE}`}
          strokeDashoffset={-index * slot}
        />
      ))}
    </svg>
  );
};
