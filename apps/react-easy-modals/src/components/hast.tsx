import type { Root } from "hast";
import { toJsxRuntime } from "hast-util-to-jsx-runtime";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";

/** Renders a hast tree, such as Shiki output highlighted on the server. */
export const Hast = ({ tree }: { tree: Root }) =>
  toJsxRuntime(tree, { Fragment, jsx, jsxs });

/** One highlighted line; an empty line keeps its height with a space. */
export const HastLine = ({ tree }: { tree: Root }) =>
  tree.children.length > 0 ? <Hast tree={tree} /> : " ";
