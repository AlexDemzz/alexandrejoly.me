import { Button } from "@ui-sdk/react/button";
import type { ButtonActionDetails } from "@ui-sdk/react/button";
import { Switch, SwitchThumb } from "@ui-sdk/react/switch";
import { Toggle } from "@ui-sdk/react/toggle";
import type { KeyboardEvent, ReactNode } from "react";

import { useWheel, useWheelDispatch } from "../model/store";
import type { Paddle, WheelButton, WheelState } from "../model/types";
import { At } from "./at";
import type { Spot } from "./layout";

import "./wheel-buttons.css";

export type Tone =
  | "lime"
  | "orange"
  | "purple"
  | "red"
  | "split"
  | "white"
  | "yellow";

/** The collar is fixed to the face; only the cap travels when pressed. */
const Cap = ({ children }: { children: ReactNode }) => (
  <>
    <span data-slot="wheel-button-bezel" />
    <span data-slot="wheel-button-cap">{children}</span>
  </>
);

interface FaceButtonProps {
  /** The printed label, then the function: "N, neutral". */
  name: string;
  button: WheelButton;
  spot: Spot;
  tone: Tone;
  /** Flush buttons sit level with the carbon, without a tall black bezel. */
  flush?: boolean;
  children: ReactNode;
}

export const FaceButton = ({
  button,
  children,
  flush = false,
  name,
  spot,
  tone,
}: FaceButtonProps) => {
  const dispatch = useWheelDispatch();
  return (
    <At spot={spot}>
      <Button
        aria-label={name}
        data-control={button}
        data-flush={flush ? "" : undefined}
        data-tone={tone}
        data-wheel-button=""
        onClick={() => dispatch({ button, type: "press" })}
      >
        <Cap>{children}</Cap>
      </Button>
    </At>
  );
};

type HeldButton = Extract<WheelButton, "k1" | "radio">;

const selectHeld: Record<HeldButton, (state: WheelState) => boolean> = {
  k1: (state) => state.ers === "k1",
  radio: (state) => state.radio,
};

const HOLD_KEYS = new Set([" ", "Enter"]);
const DIRECT_SOURCES = new Set<ButtonActionDetails["source"]>([
  "keyboard",
  "mouse",
  "pen",
  "touch",
]);

interface HoldButtonProps extends Omit<FaceButtonProps, "button"> {
  button: HeldButton;
}

/** Live while held: pressed on pointer or key down, released on up, cancel or blur. */
export const HoldButton = ({
  button,
  children,
  flush = false,
  name,
  spot,
  tone,
}: HoldButtonProps) => {
  const dispatch = useWheelDispatch();
  const held = useWheel(selectHeld[button]);
  const press = (): void => dispatch({ button, type: "press" });
  const release = (): void => dispatch({ button, type: "release" });
  const onKeyDown = (event: KeyboardEvent): void => {
    if (HOLD_KEYS.has(event.key) && !event.repeat) {
      press();
    }
  };
  const onKeyUp = (event: KeyboardEvent): void => {
    if (HOLD_KEYS.has(event.key)) {
      release();
    }
  };

  return (
    <At spot={spot}>
      <Button
        aria-label={name}
        data-control={button}
        data-flush={flush ? "" : undefined}
        data-held={held ? "" : undefined}
        data-tone={tone}
        data-wheel-button=""
        onBlur={release}
        // A screen reader's or an agent's click comes without a down and an up: a tap.
        onClick={(_event, { source }) => {
          if (!DIRECT_SOURCES.has(source)) {
            press();
            release();
          }
        }}
        onContextMenu={(event) => event.preventDefault()}
        onKeyDown={onKeyDown}
        onKeyUp={onKeyUp}
        onPointerCancel={release}
        onPointerDown={(event) => {
          if (event.button === 0) {
            press();
          }
        }}
        onPointerLeave={release}
        onPointerUp={release}
      >
        <Cap>{children}</Cap>
      </Button>
    </At>
  );
};

type LatchedButton = Extract<WheelButton, "chr" | "k2" | "pit">;

const selectLatched: Record<LatchedButton, (state: WheelState) => boolean> = {
  chr: (state) => state.ers === "chr",
  k2: (state) => state.ers === "k2",
  pit: (state) => state.pitLimiter,
};

/** A button whose function latches in the car, so it is a toggle that follows the car. */
export const LatchButton = ({
  button,
  children,
  flush = false,
  name,
  spot,
  tone,
}: Omit<FaceButtonProps, "button"> & { button: LatchedButton }) => {
  const dispatch = useWheelDispatch();
  const on = useWheel(selectLatched[button]);
  return (
    <At spot={spot}>
      <Toggle
        aria-label={name}
        data-control={button}
        data-flush={flush ? "" : undefined}
        data-tone={tone}
        data-wheel-button=""
        onPressedChange={() => dispatch({ button, type: "press" })}
        pressed={on}
      >
        <Cap>{children}</Cap>
      </Toggle>
    </At>
  );
};

/** The raised pads moulded into the grips: no print, only the function. */
export const GripPad = ({
  button,
  name,
  spot,
}: {
  button: Extract<WheelButton, "bbForward" | "bbRearward">;
  name: string;
  spot: Spot;
}) => {
  const dispatch = useWheelDispatch();
  return (
    <At spot={spot}>
      <Button
        aria-label={name}
        data-control={button}
        data-wheel-pad=""
        onClick={() => dispatch({ button, type: "press" })}
      />
    </At>
  );
};

const selectPageScroll = (state: WheelState): boolean =>
  state.dashSwitch === "S";

/** The P/S lever: up on P pins the race page, down on S lets + and − page the dash. */
export const DashSwitchLever = ({ spot }: { spot: Spot }) => {
  const dispatch = useWheelDispatch();
  const scroll = useWheel(selectPageScroll);
  return (
    <At spot={spot}>
      <Switch
        aria-label="P/S, dash page scroll"
        data-control="dashSwitch"
        checked={scroll}
        data-wheel-lever=""
        onCheckedChange={(checked) =>
          dispatch({ type: "dashSwitch", value: checked ? "S" : "P" })
        }
      >
        <SwitchThumb />
      </Switch>
    </At>
  );
};

/** Controls behind the wheel that show past the body: the DRS stalk and the R lever. */
export const RearButton = ({
  button,
  children,
  name,
  spot,
}: {
  button: Extract<WheelButton, "drs" | "reverse">;
  children?: ReactNode;
  name: string;
  spot: Spot;
}) => {
  const dispatch = useWheelDispatch();
  return (
    <At spot={spot}>
      <Button
        aria-label={name}
        data-control={button}
        data-rear={button}
        onClick={() => dispatch({ button, type: "press" })}
      >
        {children}
      </Button>
    </At>
  );
};

const PADDLE_NAMES: Record<Paddle, string> = {
  downshift: "Downshift",
  upshift: "Upshift",
};

/** The one-piece yellow rocker behind the wheel, seen through the finger openings. */
export const ShiftPaddle = ({
  paddle,
  spot,
}: {
  paddle: Paddle;
  spot: Spot;
}) => {
  const dispatch = useWheelDispatch();
  return (
    <At spot={spot}>
      <Button
        aria-label={PADDLE_NAMES[paddle]}
        data-control={paddle}
        data-paddle={paddle}
        data-wheel-paddle=""
        onClick={() => dispatch({ paddle, type: "paddle" })}
      />
    </At>
  );
};
