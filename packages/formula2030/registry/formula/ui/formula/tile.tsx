import * as React from "react";

import "@/registry/formula/ui/formula/tokens.css";
import "@/registry/formula/ui/formula/tile.css";

function TileGroup(props: React.ComponentProps<"div">) {
  return <div data-slot="tile-group" data-formula="machined" {...props} />;
}

function Tile({
  lamp,
  ...props
}: React.ComponentProps<"div"> & {
  lamp?: boolean;
}) {
  return (
    <div
      data-slot="tile"
      data-formula="machined"
      data-lamp={lamp ? "" : undefined}
      {...props}
    />
  );
}

function TileLabel({
  lamp,
  ...props
}: React.ComponentProps<"label"> & {
  lamp?: boolean;
}) {
  return (
    <label
      data-slot="tile"
      data-formula="machined"
      data-lamp={lamp ? "" : undefined}
      {...props}
    />
  );
}

export { Tile, TileGroup, TileLabel };
