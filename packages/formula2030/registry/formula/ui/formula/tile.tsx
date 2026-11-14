import { renderElement, type PartProps } from "@ui-sdk/react/primitive";

import "@/registry/formula/ui/formula/tokens.css";
import "@/registry/formula/ui/formula/tile.css";

function TileGroup({ render, ...props }: PartProps<"div">) {
  return renderElement(
    "div",
    { "data-slot": "tile-group", "data-formula": "machined", ...props },
    render
  );
}

function Tile({ render, ...props }: PartProps<"div">) {
  return renderElement(
    "div",
    { "data-slot": "tile", "data-formula": "machined", ...props },
    render
  );
}

function TileLamp({ render, ...props }: PartProps<"span">) {
  return renderElement(
    "span",
    { "data-slot": "tile-lamp", "aria-hidden": true, ...props },
    render
  );
}

export { Tile, TileGroup, TileLamp };
