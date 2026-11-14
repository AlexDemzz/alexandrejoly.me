"use client";

import { SegmentedControl as SdkSegmentedControl } from "@ui-sdk/react/segmented-control";
import * as React from "react";

import "@/registry/formula/ui/formula/modality";

import "@/registry/formula/ui/formula/tokens.css";
import "@/registry/formula/ui/formula/segmented-control.css";

function SegmentedControl(
  props: React.ComponentProps<typeof SdkSegmentedControl>
) {
  return <SdkSegmentedControl data-formula="strata" {...props} />;
}

export { SegmentedControl };
export {
  SegmentedControlIndicator,
  SegmentedControlItem,
} from "@ui-sdk/react/segmented-control";
