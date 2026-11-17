import { useId } from "react";
import type { ReactNode } from "react";

import { At } from "./at";
import {
  DashSwitchLever,
  FaceButton,
  GripPad,
  HoldButton,
  LatchButton,
  RearButton,
  ShiftPaddle,
} from "./buttons";
import { FaceArt, FaceBacking } from "./face-art";
import { SPOTS } from "./layout";
import { WheelLeds } from "./leds";
import { ROTARIES } from "./rotaries";
import { RotarySwitch } from "./rotary";
import { GripHandles, SteeringSlider, useSteering } from "./steering";
import { Thumbwheel } from "./thumbwheel";

import "./wheel.css";
import "./wheel-steering.css";

/** RADIO is printed round the cap, above a black centre nub. */
const RadioCap = () => {
  const path = useId();
  return (
    <>
      <svg
        data-slot="wheel-button-curve"
        focusable="false"
        viewBox="-50 -50 100 100"
      >
        <path d="M -33 6 A 33 33 0 0 1 33 6" fill="none" id={path} />
        <text textAnchor="middle">
          <textPath href={`#${path}`} startOffset="50%">
            RADIO
          </textPath>
        </text>
      </svg>
      <span data-slot="wheel-button-nub" />
    </>
  );
};

/** The 1/+ and 10/− caps are split, a purple number over a yellow sign. */
const SplitCap = ({ number, sign }: { number: string; sign: string }) => (
  <span data-slot="wheel-button-split">
    <span>{number}</span>
    <span>{sign}</span>
  </span>
);

/**
 * Leclerc's 2025 Ferrari face, as the driver sees it: every control dispatches
 * to the wheel model, and `display` fills the screen.
 */
export const WheelFace = ({ display }: { display: ReactNode }) => {
  const {
    dragging,
    faceRef,
    grab,
    letGo,
    move,
    onSliderKey,
    stageRef,
    steerTo,
    value,
  } = useSteering();
  return (
    <div
      data-slot="wheel-stage"
      data-steering={dragging ? "" : undefined}
      ref={stageRef}
    >
      <SteeringSlider onKeyDown={onSliderKey} onSteer={steerTo} value={value} />
      <div data-slot="wheel-face" ref={faceRef}>
        <FaceBacking />
        <RearButton button="drs" name="DRS, open rear wing" spot={SPOTS.drs} />
        <RearButton button="reverse" name="R, reverse" spot={SPOTS.reverse}>
          R
        </RearButton>
        <ShiftPaddle paddle="downshift" spot={SPOTS.downshift} />
        <ShiftPaddle paddle="upshift" spot={SPOTS.upshift} />

        <FaceArt />
        <GripHandles grab={grab} letGo={letGo} move={move} />

        <At spot={SPOTS.screen}>
          <div data-slot="wheel-screen">{display}</div>
        </At>
        <WheelLeds />

        <FaceButton
          button="neutral"
          name="N, neutral"
          spot={SPOTS.neutral}
          tone="lime"
        >
          <span data-slot="wheel-button-glyph">N</span>
        </FaceButton>
        <FaceButton
          button="rf"
          flush
          name="RF, acknowledge message"
          spot={SPOTS.rf}
          tone="white"
        >
          RF
        </FaceButton>
        <FaceButton
          button="pitConfirm"
          name="PC, pit confirm"
          spot={SPOTS.pitConfirm}
          tone="white"
        >
          PC
        </FaceButton>
        <HoldButton
          button="radio"
          name="RADIO, push to talk"
          spot={SPOTS.radio}
          tone="red"
        >
          <RadioCap />
        </HoldButton>
        <FaceButton
          button="ok"
          name="OK, close menu"
          spot={SPOTS.ok}
          tone="purple"
        >
          OK
        </FaceButton>
        <Thumbwheel
          drum="yellow"
          name="DIF IN, differential entry"
          orientation="horizontal"
          spot={SPOTS.difIn}
          wheel="difIn"
        />
        <Thumbwheel
          drum="black"
          name="SOC, state of charge"
          orientation="vertical"
          spot={SPOTS.soc}
          wheel="soc"
        />
        <LatchButton
          button="chr"
          name="CHR, recharge mode"
          spot={SPOTS.chr}
          tone="lime"
        >
          CHR
        </LatchButton>

        <HoldButton
          button="k1"
          flush
          name="K1, overtake boost"
          spot={SPOTS.k1}
          tone="yellow"
        >
          K1
        </HoldButton>
        <LatchButton
          button="pit"
          name="P, pit limiter"
          spot={SPOTS.pit}
          tone="orange"
        >
          P
        </LatchButton>
        <FaceButton
          button="plus"
          name="1+, step up"
          spot={SPOTS.plus}
          tone="split"
        >
          <SplitCap number="1" sign="+" />
        </FaceButton>
        <FaceButton
          button="minus"
          name="10−, step down"
          spot={SPOTS.minus}
          tone="split"
        >
          <SplitCap number="10" sign="−" />
        </FaceButton>
        <LatchButton
          button="k2"
          name="K2, ERS preset 2"
          spot={SPOTS.k2}
          tone="yellow"
        >
          K2
        </LatchButton>
        <Thumbwheel
          drum="yellow"
          name="D MID, differential mid-corner"
          orientation="horizontal"
          spot={SPOTS.dMid}
          wheel="dMid"
        />
        <Thumbwheel
          drum="black"
          markEnds
          name="EB, engine braking"
          orientation="vertical"
          spot={SPOTS.eb}
          wheel="eb"
        />
        <FaceButton
          button="k0"
          name="K0, ERS base mode"
          spot={SPOTS.k0}
          tone="yellow"
        >
          K0
        </FaceButton>

        <GripPad
          button="bbRearward"
          name="Brake balance rearward"
          spot={SPOTS.bbRearward}
        />
        <Thumbwheel
          drum="yellow"
          name="BS, brake shaping"
          orientation="vertical"
          spot={SPOTS.bs}
          wheel="bs"
        />
        {ROTARIES.map((spec) => (
          <RotarySwitch key={spec.id} spec={spec} />
        ))}
        <DashSwitchLever spot={SPOTS.dashSwitch} />
        <Thumbwheel
          drum="yellow"
          name="TRQ, torque map"
          orientation="vertical"
          spot={SPOTS.trq}
          wheel="trq"
        />
        <GripPad
          button="bbForward"
          name="Brake balance forward"
          spot={SPOTS.bbForward}
        />
      </div>
    </div>
  );
};
