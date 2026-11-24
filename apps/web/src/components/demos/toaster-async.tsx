import {
  Toaster,
  ToasterDial,
  ToasterLever,
  ToasterSlot,
  ToasterStage,
  ToasterStop,
} from "@registry/toaster/toaster";
import { ToasterAudio } from "@registry/toaster/toaster-sound";
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

export const ToasterAsync = () => {
  const attempts = useRef(0);

  return (
    <Toaster
      className="w-full"
      onToast={async ({ signal }) => {
        attempts.current += 1;
        await save(signal, attempts.current % 2 === 0);
        return "Changes saved";
      }}
      toaster={toaster}
    >
      <ToasterStage>
        <ToasterSlot />
        <ToasterDial />
        <ToasterStop />
        <ToasterLever />
      </ToasterStage>
      <ToasterAudio />
    </Toaster>
  );
};
