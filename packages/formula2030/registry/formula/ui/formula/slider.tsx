"use client";

import { Slider as SdkSlider } from "@ui-sdk/react/slider";
import * as React from "react";

import "@/registry/formula/ui/formula/tokens.css";
import "@/registry/formula/ui/formula/slider.css";

function Slider({
  ticks,
  major,
  style,
  ...props
}: React.ComponentProps<typeof SdkSlider> & {
  ticks?: number;
  major?: number;
}) {
  const rule = {
    "--formula-ticks": ticks,
    "--formula-major": major,
  } as React.CSSProperties;

  return (
    <SdkSlider
      data-formula="readout"
      style={
        typeof style === "function"
          ? (state) => ({ ...rule, ...style(state) })
          : { ...rule, ...style }
      }
      {...props}
    />
  );
}

function SliderScale(props: React.ComponentProps<"div">) {
  return <div data-slot="slider-scale" aria-hidden="true" {...props} />;
}

export { Slider, SliderScale };
export {
  SliderControl,
  SliderIndicator,
  SliderThumb,
  SliderTrack,
  SliderValue,
} from "@ui-sdk/react/slider";
