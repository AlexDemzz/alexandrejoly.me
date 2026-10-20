import { textVariants } from "@portfolio/ui/components/text";

import type { Contributions } from "@/github-contributions";

const CELL = 10;
const GAP = 3;
const PITCH = CELL + GAP;
const DAYS_PER_WEEK = 7;

// Monochrome: GitHub's five quartiles become five strengths of ink.
const LEVEL_OPACITY = [0.12, 0.3, 0.5, 0.75, 1] as const;

const numberFormat = new Intl.NumberFormat("en-US");

export const ContributionGraph = ({
  contributions: { total, weeks },
}: {
  contributions: Contributions;
}) => {
  const summary = `${numberFormat.format(total)} contributions in the last year`;

  return (
    <figure className="flex flex-col gap-3">
      <svg
        aria-label={`GitHub contribution graph: ${summary}`}
        className="fill-muted-foreground h-auto w-full"
        // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- an inline SVG reads as one image only through role="img"
        role="img"
        viewBox={`0 0 ${weeks.length * PITCH - GAP} ${DAYS_PER_WEEK * PITCH - GAP}`}
      >
        {weeks.map((week, x) =>
          week.map(({ level, weekday }) => (
            <rect
              fillOpacity={LEVEL_OPACITY[level]}
              height={CELL}
              key={`${x}-${weekday}`}
              rx={2}
              width={CELL}
              x={x * PITCH}
              y={weekday * PITCH}
            />
          ))
        )}
      </svg>
      <figcaption className={textVariants({ variant: "faint" })}>
        {summary}
      </figcaption>
    </figure>
  );
};
