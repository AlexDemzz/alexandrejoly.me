import { CodeBlockLine } from "@portfolio/ui/components/code-block";
import type { Root } from "hast";
import { toJsxRuntime } from "hast-util-to-jsx-runtime";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";

/**
 * One line of a hast tree, such as Shiki output highlighted on the server; an
 * empty line keeps its height with a space.
 */
export const HastLine = ({ tree }: { tree: Root }) =>
  tree.children.length > 0 ? toJsxRuntime(tree, { Fragment, jsx, jsxs }) : " ";

/** Highlighted lines, one `CodeBlockLine` each. */
export const HastLines = ({ lines }: { lines: Root[] }) =>
  lines.map((line, index) => (
    <CodeBlockLine key={index}>
      <HastLine tree={line} />
    </CodeBlockLine>
  ));
