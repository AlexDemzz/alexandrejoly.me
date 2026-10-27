import { cn } from "@portfolio/ui/lib/utils";
import type * as React from "react";

// DESIGN.md › Docs pages › Panel: the Preview's hairline card at a 16px radius,
// holding one block of docs content such as a component part's API, at 14px. A
// table inside runs edge to edge; its outer cells and its last row take the
// panel's inset, so the card keeps one padding on every side.
const Panel = ({ className, ...props }: React.ComponentProps<"section">) => (
  <section
    className={cn(
      "ring-border flex flex-col gap-5 overflow-clip rounded-xl pt-5 text-sm ring-1 [--table-inset:--spacing(5)] sm:pt-6 sm:[--table-inset:--spacing(6)] [&_tbody_tr:last-child>*]:pb-(--table-inset)",
      className
    )}
    data-slot="panel"
    {...props}
  />
);

const PanelHeader = ({ className, ...props }: React.ComponentProps<"div">) => (
  <div
    className={cn(
      "flex flex-col gap-0.5 px-(--table-inset) last:pb-5 sm:last:pb-6",
      className
    )}
    data-slot="panel-header"
    {...props}
  />
);

export { Panel, PanelHeader };
