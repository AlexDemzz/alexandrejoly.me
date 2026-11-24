import { Button } from "@portfolio/ui/components/button";
import { Input } from "@portfolio/ui/components/input";
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
import { useState } from "react";

const wait = (ms: number, signal: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    const timer = setTimeout(resolve, ms);
    signal.addEventListener("abort", () => {
      clearTimeout(timer);
      reject(signal.reason);
    });
  });

const toaster = createToaster();

export const ToasterControlled = () => {
  const [message, setMessage] = useState("");
  const [toasting, setToasting] = useState(false);

  return (
    <div className="flex w-full flex-col gap-6">
      <Toaster
        className="w-full"
        onToast={async ({ signal }) => {
          await wait(3000, signal);
          return message || "Toast is ready";
        }}
        onToastingChange={setToasting}
        toaster={toaster}
        toasting={toasting}
      >
        <ToasterStage>
          <ToasterSlot />
          <ToasterDial />
          <ToasterStop />
          <ToasterLever />
        </ToasterStage>
        <ToasterAudio />
      </Toaster>
      <form
        className="flex gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          setToasting(true);
        }}
      >
        <Input
          aria-label="Message"
          maxLength={20}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Good morning"
          required
          value={message}
        />
        <Button type="submit">Toast</Button>
      </form>
    </div>
  );
};
