import {
  NumberInput as SdkNumberInput,
  NumberInputScrubAreaCursor as SdkNumberInputScrubAreaCursor,
} from "@ui-sdk/react/number-input";
import * as React from "react";

import "@/registry/formula/ui/formula/tokens.css";
import "@/registry/formula/ui/formula/number-input.css";

function NumberInput({
  tone,
  ...props
}: React.ComponentProps<typeof SdkNumberInput> & {
  tone?: "thermal";
}) {
  return <SdkNumberInput data-formula="machined" data-tone={tone} {...props} />;
}

function NumberInputScrubAreaCursor(
  props: React.ComponentProps<typeof SdkNumberInputScrubAreaCursor>
) {
  return <SdkNumberInputScrubAreaCursor data-formula="machined" {...props} />;
}

export { NumberInput, NumberInputScrubAreaCursor };
export {
  createNumberInputController,
  NumberInputControl,
  NumberInputDecrement,
  NumberInputGroup,
  NumberInputIncrement,
  NumberInputScrubArea,
} from "@ui-sdk/react/number-input";
