import { Button as SdkButton } from "@ui-sdk/react/button";
import * as React from "react";

import "@/registry/formula/ui/formula/tokens.css";
import "@/registry/formula/ui/formula/button.css";

function Button({
  tone,
  size,
  variant,
  ...props
}: React.ComponentProps<typeof SdkButton> & {
  tone?: "gold" | "ink";
  size?: "icon";
  variant?: "engraved";
}) {
  return (
    <SdkButton
      data-formula="machined"
      data-tone={tone}
      data-size={size}
      data-variant={variant}
      {...props}
    />
  );
}

export { Button };
