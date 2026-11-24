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

const toaster = createToaster();

export const ToasterDemo = () => (
  <Toaster
    className="w-full max-w-3xl"
    onToast={() => "Toast is ready"}
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
