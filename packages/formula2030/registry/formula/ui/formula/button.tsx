"use client";

import { Button as SdkButton } from "@ui-sdk/react/button";
import * as React from "react";

import "@/registry/formula/ui/formula/modality";

import "@/registry/formula/ui/formula/tokens.css";
import "@/registry/formula/ui/formula/button.css";

function Button({
  variant,
  size,
  ...props
}: React.ComponentProps<typeof SdkButton> & {
  variant?: "gold" | "ink" | "engraved";
  size?: "icon";
}) {
  return (
    <SdkButton
      data-formula="machined"
      data-variant={variant}
      data-size={size}
      {...props}
    />
  );
}

export { Button };
