"use client";

import { Meter as SdkMeter } from "@ui-sdk/react/meter";
import * as React from "react";

import "@/registry/formula/ui/formula/tokens.css";
import "@/registry/formula/ui/formula/meter.css";

function Meter({
  ticks,
  major,
  orientation = "horizontal",
  style,
  ...props
}: React.ComponentProps<typeof SdkMeter> & {
  ticks?: number;
  major?: number;
  orientation?: "horizontal" | "vertical";
}) {
  const rule = {
    "--formula-ticks": ticks,
    "--formula-major": major,
  } as React.CSSProperties;

  return (
    <SdkMeter
      data-formula="readout"
      data-orientation={orientation}
      style={
        typeof style === "function"
          ? (state) => ({ ...rule, ...style(state) })
          : { ...rule, ...style }
      }
      {...props}
    />
  );
}

function MeterCross(props: React.ComponentProps<"div">) {
  return <div data-slot="meter-cross" data-formula="readout" {...props} />;
}

function MeterMarker(props: React.ComponentProps<"div">) {
  return <div data-slot="meter-marker" aria-hidden="true" {...props} />;
}

function MeterScale(props: React.ComponentProps<"div">) {
  return <div data-slot="meter-scale" aria-hidden="true" {...props} />;
}

export { Meter, MeterCross, MeterMarker, MeterScale };
export {
  MeterIndicator,
  MeterLabel,
  MeterTrack,
  MeterValue,
} from "@ui-sdk/react/meter";
