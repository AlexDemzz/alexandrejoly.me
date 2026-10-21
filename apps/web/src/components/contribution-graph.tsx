import { textVariants } from "@portfolio/ui/components/text";

import {
  CELL_STROKE_WIDTH,
  graphViewBox,
  levelPaths,
} from "@/contribution-paths";
import type { Contributions } from "@/github-contributions";

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
        className="fill-muted-foreground stroke-muted-foreground h-auto w-full"
        // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- an inline SVG reads as one image only through role="img"
        role="img"
        strokeLinejoin="round"
        strokeWidth={CELL_STROKE_WIDTH}
        viewBox={graphViewBox(weeks.length)}
      >
        {levelPaths(weeks).map((path, level) =>
          path === "" ? null : (
            // Group opacity, so a cell's fill and stroke never stack.
            <path
              d={path}
              key={LEVEL_OPACITY[level]}
              opacity={LEVEL_OPACITY[level]}
            />
          )
        )}
      </svg>
      <figcaption className={textVariants({ variant: "faint" })}>
        {summary}
      </figcaption>
    </figure>
  );
};
