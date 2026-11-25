import { Toast, ToastStage } from "@registry/toast/toast";
import type { ToastCycle } from "@registry/toast/toast";
import { FRAME } from "@registry/toast/toast-frame";
import { createToaster } from "@ui-sdk/react/toast";
import type { CSSProperties } from "react";

import type { LiveProps } from "./pieces";

const toaster = createToaster();

// The cycle runs for as long as the slot is hovered, and the slot letting go
// stops it: the lever springs back up and the slice keeps its colour.
const holdUntilStopped = ({ signal }: ToastCycle) =>
  // oxlint-disable-next-line promise/avoid-new -- an abort event has no promise of its own to await
  new Promise<never>((_resolve, reject) => {
    signal.addEventListener("abort", () => reject(signal.reason), {
      once: true,
    });
  });

/** The toaster in its slot: hovering pushes the lever down and heats it, through `toasting`. */
const ToastLive = ({ active }: LiveProps) => (
  <Toast
    className="aspect-(--frame-ratio) h-full"
    onToast={holdUntilStopped}
    style={
      { "--frame-ratio": `${FRAME.width} / ${FRAME.height}` } as CSSProperties
    }
    toaster={toaster}
    toasting={active}
  >
    <ToastStage />
  </Toast>
);

export default ToastLive;
