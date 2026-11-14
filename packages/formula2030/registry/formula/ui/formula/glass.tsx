import * as React from "react";

import "@/registry/formula/ui/formula/tokens.css";
import "@/registry/formula/ui/formula/glass.css";

function Glass({
  brackets,
  ...props
}: React.ComponentProps<"div"> & {
  brackets?: boolean;
}) {
  return (
    <div
      data-slot="glass"
      data-formula="readout"
      data-brackets={brackets ? "" : undefined}
      {...props}
    />
  );
}

function GlassCaption(props: React.ComponentProps<"span">) {
  return <span data-slot="glass-caption" {...props} />;
}

export { Glass, GlassCaption };
