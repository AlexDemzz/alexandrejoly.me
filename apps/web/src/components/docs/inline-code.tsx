import { Code } from "@portfolio/ui/components/code";

const BACKTICK_SPANS = /(?<code>`[^`]+`)/u;

/** Renders the `backtick` spans of a docs sentence as code. */
export const InlineCode = ({ children }: { children: string }) =>
  children.split(BACKTICK_SPANS).map((part, index) =>
    part.startsWith("`") ? (
      // oxlint-disable-next-line react/no-array-index-key -- the parts of a static sentence never reorder
      <Code key={index}>{part.slice(1, -1)}</Code>
    ) : (
      part
    )
  );
