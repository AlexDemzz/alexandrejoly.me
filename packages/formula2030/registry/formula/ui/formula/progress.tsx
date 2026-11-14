"use client";

import { Progress as SdkProgress } from "@ui-sdk/react/progress";
import * as React from "react";

import "@/registry/formula/ui/formula/tokens.css";
import "@/registry/formula/ui/formula/progress.css";

function Progress({
  ticks,
  major,
  style,
  ...props
}: React.ComponentProps<typeof SdkProgress> & {
  ticks?: number;
  major?: number;
}) {
  const rule = {
    "--formula-ticks": ticks,
    "--formula-major": major,
  } as React.CSSProperties;

  return (
    <SdkProgress
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

function ProgressScale(props: React.ComponentProps<"div">) {
  return <div data-slot="progress-scale" aria-hidden="true" {...props} />;
}

export { Progress, ProgressScale };
export {
  ProgressIndicator,
  ProgressLabel,
  ProgressTrack,
  ProgressValue,
} from "@ui-sdk/react/progress";
