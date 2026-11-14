"use client";

import { RadioGroup as SdkRadioGroup } from "@ui-sdk/react/radio";
import * as React from "react";

import "@/registry/formula/ui/formula/modality";

import "@/registry/formula/ui/formula/tokens.css";
import "@/registry/formula/ui/formula/radio.css";

function RadioGroup(props: React.ComponentProps<typeof SdkRadioGroup>) {
  return <SdkRadioGroup data-formula="strata" {...props} />;
}

export { RadioGroup };
export { Radio, RadioIndicator } from "@ui-sdk/react/radio";
