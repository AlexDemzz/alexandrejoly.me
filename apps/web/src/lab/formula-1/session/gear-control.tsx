import { cn } from "@portfolio/ui/lib/utils";
import { Field, FieldLabel } from "@ui-sdk/react/field";
import {
  SegmentedControl,
  SegmentedControlIndicator,
  SegmentedControlItem,
} from "@ui-sdk/react/segmented-control";

import { CONTROL_ITEM, CONTROL_TRACK } from "../control-pill";
import { useWheel, useWheelDispatch } from "../model/store";
import type { GearControl as GearMode, WheelState } from "../model/types";

import "./gear-control.css";

const selectGearControl = (state: WheelState): GearMode => state.gearControl;

const SEGMENT = cn(
  CONTROL_ITEM,
  "data-checked:text-foreground px-3 motion-safe:data-checked:active:scale-100"
);

export const GearControl = () => {
  const gearControl = useWheel(selectGearControl);
  const dispatch = useWheelDispatch();
  return (
    <Field className={cn(CONTROL_TRACK, "items-center")} data-gear-control>
      <FieldLabel className="text-muted-foreground ps-3 pe-1 text-sm">
        Gears
      </FieldLabel>
      <SegmentedControl
        className="relative isolate inline-grid auto-cols-fr grid-flow-col"
        onValueChange={(next) => {
          if (next !== null) {
            dispatch({ type: "gearControl", value: next });
          }
        }}
        value={gearControl}
      >
        <SegmentedControlIndicator />
        <SegmentedControlItem className={SEGMENT} value="auto">
          Auto
        </SegmentedControlItem>
        <SegmentedControlItem className={SEGMENT} value="manual">
          Manual
        </SegmentedControlItem>
      </SegmentedControl>
    </Field>
  );
};
