"use client";

import { Checkbox as SdkCheckbox } from "@ui-sdk/react/checkbox";
import * as React from "react";

import "@/registry/formula/ui/formula/modality";

import "@/registry/formula/ui/formula/tokens.css";
import "@/registry/formula/ui/formula/checkbox.css";

function Checkbox(props: React.ComponentProps<typeof SdkCheckbox>) {
  return <SdkCheckbox data-formula="machined" {...props} />;
}

export { Checkbox };
export { CheckboxGroup, CheckboxIndicator } from "@ui-sdk/react/checkbox";
