"use client";

import { Slider as SdkSlider } from "@ui-sdk/react/slider";
import * as React from "react";

import "@/registry/formula/ui/formula/tokens.css";
import "@/registry/formula/ui/formula/knob.css";

function scale(ticks: number) {
  const tick = 1.7;
  const dashes = `${`${tick} ${270 / ticks - tick} `.repeat(ticks)}${tick} 360`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 72 72"><circle cx="36" cy="36" r="33.5" fill="none" stroke="#000" stroke-width="5" pathLength="360" stroke-dasharray="${dashes}" transform="rotate(${135 - tick / 2} 36 36)"/></svg>`;

  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

function Knob({
  tone,
  ticks = 27,
  min = 0,
  max = 100,
  style,
  onPointerDownCapture,
  onPointerDown,
  ...props
}: Omit<React.ComponentProps<typeof SdkSlider<number>>, "orientation"> & {
  tone?: "gold";
  ticks?: number;
}) {
  return (
    <SdkSlider<number>
      data-formula="machined"
      data-tone={tone}
      min={min}
      max={max}
      orientation="vertical"
      style={(state) => {
        const value = Array.isArray(state.value) ? state.value[0] : state.value;
        const turn = max > min ? (value - min) / (max - min) : 0;

        return {
          "--formula-knob-turn": Math.min(Math.max(turn, 0), 1),
          "--formula-ticks": ticks,
          "--formula-knob-scale": scale(ticks),
          ...(typeof style === "function" ? style(state) : style),
        } as React.CSSProperties;
      }}
      onPointerDownCapture={(event) => {
        const root = event.currentTarget;
        const track = root.querySelector<HTMLElement>(
          '[data-slot="slider-track"]'
        );

        if (track) {
          track.style.removeProperty("translate");

          const { bottom, height } = track.getBoundingClientRect();
          const turn = Number(
            root.style.getPropertyValue("--formula-knob-turn")
          );

          track.style.translate = `0 ${event.clientY + turn * height - bottom}px`;
        }

        onPointerDownCapture?.(event);
      }}
      onPointerDown={(event) => {
        event.currentTarget
          .querySelector<HTMLElement>('[data-slot="slider-track"]')
          ?.style.removeProperty("translate");
        onPointerDown?.(event);
      }}
      {...props}
    />
  );
}

export { Knob };
export {
  SliderControl,
  SliderIndicator,
  SliderThumb,
  SliderTrack,
  SliderValue,
} from "@ui-sdk/react/slider";
