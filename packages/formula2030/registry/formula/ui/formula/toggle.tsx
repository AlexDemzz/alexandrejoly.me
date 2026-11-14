import {
  Toggle as SdkToggle,
  ToggleGroup as SdkToggleGroup,
} from "@ui-sdk/react/toggle";
import * as React from "react";

import "@/registry/formula/ui/formula/tokens.css";
import "@/registry/formula/ui/formula/toggle.css";

function Toggle(props: React.ComponentProps<typeof SdkToggle>) {
  return <SdkToggle data-formula="machined" {...props} />;
}

function ToggleGroup(props: React.ComponentProps<typeof SdkToggleGroup>) {
  return <SdkToggleGroup data-formula="machined" {...props} />;
}

export { Toggle, ToggleGroup };
export { ToggleIcon } from "@ui-sdk/react/toggle";
