"use client";

import { Switch as SdkSwitch } from "@ui-sdk/react/switch";
import * as React from "react";

import "@/registry/formula/ui/formula/modality";

import "@/registry/formula/ui/formula/tokens.css";
import "@/registry/formula/ui/formula/switch.css";

function Switch({
  tone,
  ...props
}: React.ComponentProps<typeof SdkSwitch> & {
  tone?: "gold";
}) {
  return <SdkSwitch data-formula="machined" data-tone={tone} {...props} />;
}

export { Switch };
export { SwitchThumb } from "@ui-sdk/react/switch";
