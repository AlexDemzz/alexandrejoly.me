import { Code } from "@portfolio/ui/components/code";

import { withOffsets } from "@/lib/text-offsets";

const BACKTICK_SPANS = /(?<code>`[^`]+`)/u;

/** Renders the `backtick` spans of a docs sentence as code. */
export const InlineCode = ({ children }: { children: string }) =>
  withOffsets(children.split(BACKTICK_SPANS), (part) => part.length).map(
    ({ offset, part }) =>
      part.startsWith("`") ? (
        <Code key={offset}>{part.slice(1, -1)}</Code>
      ) : (
        part
      )
  );
