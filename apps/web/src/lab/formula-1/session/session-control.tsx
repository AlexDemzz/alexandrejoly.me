import { cn } from "@portfolio/ui/lib/utils";
import {
  SegmentedControl,
  SegmentedControlIndicator,
  SegmentedControlItem,
} from "@ui-sdk/react/segmented-control";

import { useWheel, useWheelDispatch } from "../model/store";
import type { Session, WheelState } from "../model/types";

import "./session-control.css";

const selectSession = (state: WheelState): Session => state.session;

/** A pill in the controls row under the wheel; the Sound toggle shares it. */
export const CONTROL_ITEM = cn(
  "relative inline-flex h-8 cursor-pointer items-center justify-center gap-2 rounded-full px-4 text-sm font-medium whitespace-nowrap",
  "text-muted-foreground data-checked:text-foreground can-hover:hover:text-foreground",
  "ease-settle transition duration-200 motion-safe:data-unchecked:active:scale-96",
  "focus-visible:outline-ring outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid"
);

export const SessionControl = () => {
  const session = useWheel(selectSession);
  const dispatch = useWheelDispatch();
  return (
    <SegmentedControl
      aria-label="Session"
      className="bg-muted relative isolate inline-grid auto-cols-fr grid-flow-col rounded-full p-0.75"
      data-session-control
      onValueChange={(next) => {
        if (next !== null) {
          dispatch({ session: next, type: "session" });
        }
      }}
      value={session}
    >
      <SegmentedControlIndicator />
      <SegmentedControlItem className={CONTROL_ITEM} value="garage">
        Garage
      </SegmentedControlItem>
      <SegmentedControlItem className={CONTROL_ITEM} value="track">
        <span aria-hidden="true" data-session-live />
        On track
      </SegmentedControlItem>
    </SegmentedControl>
  );
};
