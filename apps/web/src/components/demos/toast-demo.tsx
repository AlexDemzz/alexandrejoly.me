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

const toaster = createToaster();

export const ToastDemo = () => (
  <Toast
    className="w-full max-w-3xl"
    onToast={() => "Toast is ready"}
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
