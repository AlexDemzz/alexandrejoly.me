import { textVariants } from "@portfolio/ui/components/text";
import type { CSSProperties } from "react";

import { graphSize } from "@/contribution-paths";

export interface ContributionSummary {
  total: number;
  weekCount: number;
}

const numberFormat = new Intl.NumberFormat("en-US");

// GitHub's last year spans 53 Sunday-to-Saturday weeks, or 54 in rare years.
const USUAL_WEEK_COUNT = 53;

const graphRatio = (weekCount: number) => {
  const { height, width } = graphSize(weekCount);
  return `${width} / ${height}`;
};

/**
 * The cells live in `/contributions.svg`, out of the page's HTML; the SVG masks
 * a box painted in the theme's ink. The total in the URL refetches the graph
 * once the count moves.
 */
export const ContributionGraph = ({
  contributions: { total, weekCount },
}: {
  contributions: ContributionSummary;
}) => {
  const summary = `${numberFormat.format(total)} contributions in the last year`;

  return (
    <figure className="flex flex-col gap-3">
      <div
        aria-label={`GitHub contribution graph: ${summary}`}
        className="bg-muted-foreground aspect-(--graph-ratio) w-full mask-(--graph-mask) mask-contain mask-no-repeat forced-color-adjust-none"
        // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- a masked box reads as one image only through role="img"
        role="img"
        style={
          {
            "--graph-mask": `url(/contributions.svg?total=${total})`,
            "--graph-ratio": graphRatio(weekCount),
          } as CSSProperties
        }
      />
      <figcaption className={textVariants({ variant: "faint" })}>
        {summary}
      </figcaption>
    </figure>
  );
};

/** Holds the graph's room while its summary streams in. */
export const ContributionGraphPlaceholder = () => (
  <div aria-hidden className="flex flex-col gap-3">
    <div
      className="aspect-(--graph-ratio) w-full"
      style={{ "--graph-ratio": graphRatio(USUAL_WEEK_COUNT) } as CSSProperties}
    />
    <p className={textVariants({ variant: "faint" })}>&nbsp;</p>
  </div>
);
