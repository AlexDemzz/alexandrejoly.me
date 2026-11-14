import { renderElement, type PartProps } from "@ui-sdk/react/primitive";

import "@/registry/formula/ui/formula/tokens.css";
import "@/registry/formula/ui/formula/glass.css";

function Glass({ render, ...props }: PartProps<"div">) {
  return renderElement(
    "div",
    { "data-slot": "glass", "data-formula": "readout", ...props },
    render
  );
}

function GlassBrackets({ render, ...props }: PartProps<"span">) {
  return renderElement(
    "span",
    { "data-slot": "glass-brackets", "aria-hidden": true, ...props },
    render
  );
}

function GlassCaption({ render, ...props }: PartProps<"span">) {
  return renderElement(
    "span",
    { "data-slot": "glass-caption", ...props },
    render
  );
}

export { Glass, GlassBrackets, GlassCaption };
