import {
  Toast,
  ToastDial,
  ToastLever,
  ToastRegion,
  ToastStage,
  ToastStop,
} from "@registry/toast/toast";
import { ToastAudio } from "@registry/toast/toast-sound";
import { createToaster } from "@ui-sdk/react/toast";
import { useRef } from "react";

const save = (signal: AbortSignal, fails: boolean) =>
  new Promise<void>((resolve, reject) => {
    const timer = setTimeout(() => {
      if (fails) {
        reject(new Error("Couldn't save changes"));
      } else {
        resolve();
      }
    }, 2500);
    signal.addEventListener("abort", () => {
      clearTimeout(timer);
      reject(signal.reason);
    });
  });

const toaster = createToaster();

export const ToastAsync = () => {
  const attempts = useRef(0);

  return (
    <Toast
      className="w-full"
      onToast={async ({ signal }) => {
        attempts.current += 1;
        await save(signal, attempts.current % 2 === 0);
        return "Changes saved";
      }}
      toaster={toaster}
    >
      <ToastStage>
        <ToastRegion />
        <ToastDial />
        <ToastStop />
        <ToastLever />
      </ToastStage>
      <ToastAudio />
    </Toast>
  );
};
