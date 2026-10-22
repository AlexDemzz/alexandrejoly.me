import { textVariants } from "@portfolio/ui/components/text";
import type { CSSProperties } from "react";

import { graphSize } from "@/contribution-paths";

export interface ContributionSummary {
  total: number;
  weekCount: number;
}

const numberFormat = new Intl.NumberFormat("en-US");

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
  const { height, width } = graphSize(weekCount);

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
            "--graph-ratio": `${width} / ${height}`,
          } as CSSProperties
        }
      />
      <figcaption className={textVariants({ variant: "faint" })}>
        {summary}
      </figcaption>
    </figure>
  );
};
