"use client";

import { Tabs as SdkTabs } from "@ui-sdk/react/tabs";
import * as React from "react";

import "@/registry/formula/ui/formula/modality";

import "@/registry/formula/ui/formula/tokens.css";
import "@/registry/formula/ui/formula/tabs.css";

function Tabs(props: React.ComponentProps<typeof SdkTabs>) {
  return <SdkTabs data-formula="strata" {...props} />;
}

export { Tabs };
export {
  TabsIndicator,
  TabsList,
  TabsPanel,
  TabsTab,
  TabsTabIcon,
} from "@ui-sdk/react/tabs";
