"use client";

import {
  NumberInput as SdkNumberInput,
  NumberInputScrubAreaCursor as SdkNumberInputScrubAreaCursor,
} from "@ui-sdk/react/number-input";
import * as React from "react";

import "@/registry/formula/ui/formula/tokens.css";
import "@/registry/formula/ui/formula/number-input.css";

const STEPPERS =
  '[data-slot="number-input-increment"], [data-slot="number-input-decrement"], [data-slot="number-input-scrub-area"]';

function NumberInput({
  tone,
  onPointerDownCapture,
  onKeyDownCapture,
  onBlurCapture,
  ...props
}: React.ComponentProps<typeof SdkNumberInput> & {
  tone?: "thermal";
}) {
  return (
    <SdkNumberInput
      data-formula="machined"
      data-tone={tone}
      onPointerDownCapture={(event) => {
        const stepper =
          event.target instanceof Element && event.target.closest(STEPPERS);
        event.currentTarget.dataset.focusFrom = stepper ? "stepper" : "pointer";
        onPointerDownCapture?.(event);
      }}
      onKeyDownCapture={(event) => {
        delete event.currentTarget.dataset.focusFrom;
        onKeyDownCapture?.(event);
      }}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          delete event.currentTarget.dataset.focusFrom;
        }
        onBlurCapture?.(event);
      }}
      {...props}
    />
  );
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
