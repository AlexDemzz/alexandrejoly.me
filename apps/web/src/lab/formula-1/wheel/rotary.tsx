import {
  Slider,
  SliderControl,
  SliderThumb,
  SliderTrack,
} from "@ui-sdk/react/slider";
import type { CSSProperties, ReactNode } from "react";

import { useWheel, useWheelDispatch } from "../model/store";
import { At } from "./at";
import { useDetents } from "./detents";
import { useDialDrag } from "./dial-drag";
import { DETENTS, DETENT_DEGREES, angleOf } from "./rotaries";
import type { DialPosition, RotarySpec } from "./rotaries";

import "./wheel-dials.css";

const HALF_TURN = 180;
const DIAL_MARGIN = 4;

const polar = (degrees: number, radius: number): string => {
  const radians = (degrees * Math.PI) / HALF_TURN;
  return `${(radius * Math.sin(radians)).toFixed(2)} ${(-radius * Math.cos(radians)).toFixed(2)}`;
};

const sector = (
  from: number,
  to: number,
  inner: number,
  outer: number
): string =>
  [
    `M ${polar(from, outer)}`,
    `A ${outer} ${outer} 0 0 1 ${polar(to, outer)}`,
    `L ${polar(to, inner)}`,
    `A ${inner} ${inner} 0 0 0 ${polar(from, inner)}`,
    "Z",
  ].join(" ");

/** Ring text turns over on the lower half, so it never reads upside down. */
const legendTransform = (
  spec: RotarySpec,
  angle: number,
  radius: number
): string => {
  if (spec.legendAlong === "upright") {
    return `translate(${polar(angle, radius)})`;
  }
  const lower = Math.abs(((angle + HALF_TURN) % 360) - HALF_TURN) > 90;
  return `rotate(${angle}) translate(0 ${-radius})${lower ? ` rotate(${HALF_TURN})` : ""}`;
};

const Legend = ({
  angle,
  current,
  position,
  size,
  spec,
}: {
  angle: number;
  current: boolean;
  position: DialPosition;
  size: number;
  spec: RotarySpec;
}) => (
  <text
    data-current={current ? "" : undefined}
    data-ink={position.ink}
    data-part="legend"
    dominantBaseline="central"
    fontSize={size * (position.legend.length > 2 ? 0.085 : 0.1)}
    textAnchor="middle"
    transform={legendTransform(spec, angle, spec.band.legend * size)}
  >
    {position.legend}
  </text>
);

/** Light falls from the top left: a white-to-black wash across a part's box. */
const Wash = ({
  dark,
  id,
  light,
}: {
  dark: number;
  id: string;
  light: number;
}) => (
  <linearGradient id={id} x1="0.15" x2="0.85" y1="0.15" y2="0.85">
    <stop offset="0" data-stop="light" stopOpacity={light} />
    <stop offset="0.48" data-stop="light" stopOpacity="0" />
    <stop offset="0.56" data-stop="shade" stopOpacity="0" />
    <stop offset="1" data-stop="shade" stopOpacity={dark} />
  </linearGradient>
);

const Dial = ({ current, spec }: { current: number; spec: RotarySpec }) => {
  const { size } = spec.spot;
  const half = size / 2 + DIAL_MARGIN;
  const inner = spec.band.inner * size;
  const outer = spec.band.outer * size;
  const ids = {
    lip: `rotary-${spec.id}-lip`,
    sheen: `rotary-${spec.id}-sheen`,
    well: `rotary-${spec.id}-well`,
  };
  return (
    <svg
      aria-hidden="true"
      data-slot="rotary-dial"
      focusable="false"
      viewBox={`${-half} ${-half} ${half * 2} ${half * 2}`}
    >
      <defs>
        <linearGradient id={ids.lip} x1="0.15" x2="0.85" y1="0.15" y2="0.85">
          <stop data-stop="lip-shade" offset="0.3" />
          <stop data-stop="lip-light" offset="1" />
        </linearGradient>
        <Wash dark={0.2} id={ids.sheen} light={0.24} />
        <radialGradient
          cx={size * 0.012}
          cy={size * 0.016}
          gradientUnits="userSpaceOnUse"
          id={ids.well}
          r={outer * 1.02}
        >
          <stop offset="0.86" data-stop="shade" stopOpacity="0" />
          <stop offset="1" data-stop="shade" stopOpacity="0.5" />
        </radialGradient>
      </defs>
      <circle
        data-part="disc-rim"
        r={outer + 1.6}
        stroke={`url(#${ids.lip})`}
      />
      <circle data-part="hub-well" r={inner + 0.5} />
      {spec.positions.map((position, index) => {
        const angle = angleOf(spec, index);
        return (
          <path
            d={sector(
              angle - DETENT_DEGREES / 2,
              angle + DETENT_DEGREES / 2,
              inner,
              outer
            )}
            data-paint={position.paint}
            data-part="sector"
            key={position.legend}
          />
        );
      })}
      {spec.dividers
        ? spec.positions.map((position, index) => {
            const angle = angleOf(spec, index) - DETENT_DEGREES / 2;
            return (
              <path
                d={`M ${polar(angle, inner)} L ${polar(angle, outer)}`}
                data-part="divider"
                key={position.legend}
              />
            );
          })
        : null}
      <circle fill={`url(#${ids.sheen})`} r={outer} />
      <circle fill={`url(#${ids.well})`} r={outer} />
      {spec.positions.map((position, index) => (
        <Legend
          angle={angleOf(spec, index)}
          current={index === current}
          key={position.legend}
          position={position}
          size={size}
          spec={spec}
        />
      ))}
    </svg>
  );
};

const toothed = (teeth: number, outer: number, inner: number): string => {
  const step = 360 / teeth;
  return `${Array.from({ length: teeth }, (_, tooth) => {
    const start = tooth * step;
    return [
      `${tooth === 0 ? "M" : "L"} ${polar(start, inner)}`,
      `L ${polar(start + step * 0.15, outer)}`,
      `L ${polar(start + step * 0.55, outer)}`,
      `L ${polar(start + step * 0.7, inner)}`,
    ].join(" ");
  }).join(" ")} Z`;
};

const GEAR = toothed(18, 36.5, 31.5);
const KNURL = toothed(32, 21.4, 20.2);
const FIN =
  "M -4.4 -27.6 Q 0 -32 4.4 -27.6 L 11 9 Q 12.2 22.4 0 23 Q -12.2 22.4 -11 9 Z";
const FLANK_LEFT =
  "M 0 -29.8 L 0 23 Q -12.2 22.4 -11 9 L -4.4 -27.6 Q -2.2 -29.8 0 -29.8 Z";
const FLANK_RIGHT =
  "M 0 -29.8 L 0 23 Q 12.2 22.4 11 9 L 4.4 -27.6 Q 2.2 -29.8 0 -29.8 Z";

/**
 * A copy of a shape that turns with the knob but is shifted in screen space:
 * the shadow, the wall and the lit edge stay where the light puts them.
 */
const Turned = ({
  children,
  dx = 0,
  dy = 0,
  part,
}: {
  children: ReactNode;
  dx?: number;
  dy?: number;
  part: string;
}) => (
  <g data-part={part} transform={`translate(${dx} ${dy})`}>
    <g data-turn="">{children}</g>
  </g>
);

const WedgeKnob = ({ id }: { id: string }) => (
  <>
    <defs>
      <Wash dark={0.45} id={`${id}-base`} light={0.3} />
    </defs>
    <Turned dx={2.2} dy={3} part="cast">
      <path d={KNURL} />
      <path d={FIN} />
    </Turned>
    <Turned dx={3.8} dy={5} part="cast">
      <path d={FIN} />
    </Turned>
    <Turned dx={5.2} dy={6.8} part="cast">
      <path d={FIN} />
    </Turned>
    <Turned dx={1.1} dy={1.5} part="wall">
      <path d={KNURL} />
    </Turned>
    <Turned dx={-0.7} dy={-0.7} part="edge-light">
      <path d={KNURL} />
    </Turned>
    <Turned part="face">
      <path d={KNURL} />
    </Turned>
    <circle fill={`url(#${id}-base)`} r="20.2" />
    <Turned dx={1.8} dy={2.4} part="cast">
      <path d={FIN} />
    </Turned>
    <Turned dx={1} dy={1.4} part="wall">
      <path d={FIN} />
    </Turned>
    <Turned dx={-0.7} dy={-0.7} part="edge-light">
      <path d={FIN} />
    </Turned>
    <Turned part="fin">
      <path d={FLANK_LEFT} data-part="flank-left" />
      <path d={FLANK_RIGHT} data-part="flank-right" />
      <path d="M 0 -26.5 L 0 19" data-part="spine" />
    </Turned>
  </>
);

const GearKnob = ({ id }: { id: string }) => (
  <>
    <defs>
      <Wash dark={0.4} id={`${id}-ring`} light={0.22} />
      <linearGradient id={`${id}-seat`} x1="0.15" x2="0.85" y1="0.15" y2="0.85">
        <stop offset="0" data-stop="shade" stopOpacity="0.9" />
        <stop offset="1" data-stop="light" stopOpacity="0.3" />
      </linearGradient>
      <radialGradient cx="0.5" cy="0.5" fx="0.34" fy="0.3" id={`${id}-dome`}>
        <stop data-stop="dome-glint" offset="0" />
        <stop data-stop="dome-body" offset="0.5" />
        <stop data-stop="dome-turn" offset="0.88" />
        <stop data-stop="dome-edge" offset="1" />
      </radialGradient>
      <radialGradient id={`${id}-gloss`}>
        <stop offset="0" data-stop="light" stopOpacity="0.55" />
        <stop offset="1" data-stop="light" stopOpacity="0" />
      </radialGradient>
    </defs>
    <Turned dx={1.4} dy={1.9} part="cast">
      <path d={GEAR} />
    </Turned>
    <Turned dx={2.4} dy={3.2} part="cast">
      <path d={GEAR} />
    </Turned>
    <Turned dx={0.8} dy={1.1} part="wall">
      <path d={GEAR} />
    </Turned>
    <Turned dx={-0.45} dy={-0.45} part="edge-light">
      <path d={GEAR} />
    </Turned>
    <Turned part="face">
      <path d={GEAR} />
    </Turned>
    <circle fill={`url(#${id}-ring)`} r="31.5" />
    <circle data-part="cap-seat" r="23.6" stroke={`url(#${id}-seat)`} />
    <circle fill={`url(#${id}-dome)`} r="22.4" />
    <Turned part="print">
      <path d="M 0 -19.4 L 5.4 -10.2 L -5.4 -10.2 Z" data-part="pointer" />
    </Turned>
    <ellipse
      cx="-7.5"
      cy="-9.5"
      fill={`url(#${id}-gloss)`}
      rx="12"
      ry="7"
      transform="rotate(-38 -7.5 -9.5)"
    />
  </>
);

const Knob = ({ id, kind }: { id: string; kind: RotarySpec["knob"] }) => (
  <svg
    aria-hidden="true"
    data-knob={kind}
    data-slot="rotary-knob"
    focusable="false"
    viewBox="-50 -50 100 100"
  >
    {kind === "gear" ? <GearKnob id={id} /> : <WedgeKnob id={id} />}
  </svg>
);

/** Matches wheel-dials.css' --drag: a detent per 34 units, never under 18 px. */
const ROTARY_PITCH = { min: 18, units: 34 } as const;

export const RotarySwitch = ({ spec }: { spec: RotarySpec }) => {
  const index = useWheel(spec.select);
  const dispatch = useWheelDispatch();
  const detents = useDetents(DETENTS, true, index, spec.numbered ? 1 : 0);
  const drag = useDialDrag("vertical", ROTARY_PITCH, () => detents.commit());
  const box = spec.spot.size + DIAL_MARGIN * 2;

  return (
    <At spot={{ ...spec.spot, size: box }}>
      <div
        data-rotary={spec.id}
        data-slot="rotary"
        style={
          {
            "--dial": spec.spot.size,
            "--rotary-angle": angleOf(spec, detents.roll),
          } as CSSProperties
        }
      >
        <Dial current={index} spec={spec} />
        <Slider<number>
          data-wheel-dial=""
          format={(next) => spec.positions[detents.indexOf(next)]?.legend ?? ""}
          max={detents.max}
          min={detents.min}
          {...drag.handlers}
          controller={drag.controller}
          onValueChange={(next) =>
            dispatch({
              index: detents.change(next),
              rotary: spec.id,
              type: "rotary",
            })
          }
          onValueCommit={() => detents.commit()}
          orientation="vertical"
          step={1}
          style={
            {
              "--steps": detents.max - detents.min,
            } as CSSProperties
          }
          value={detents.value}
        >
          <SliderControl>
            <SliderTrack>
              <SliderThumb aria-label={spec.name}>
                <Knob id={`rotary-${spec.id}-knob`} kind={spec.knob} />
              </SliderThumb>
            </SliderTrack>
          </SliderControl>
        </Slider>
      </div>
    </At>
  );
};
