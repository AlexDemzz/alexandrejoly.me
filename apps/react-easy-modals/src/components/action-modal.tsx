import type { ModalProps } from "react-easy-modals";

import { DemoBackdrop, DemoPanel } from "./demo-modal";
import { Button } from "./ui/button";

type ReturnType = "cancel" | "confirm";

function Modal({
  close,
  isOpen,
  message,
}: ModalProps<ReturnType> & {
  message: string;
}) {
  if (!isOpen) {
    return null;
  }

  return (
    <DemoBackdrop>
      <DemoPanel
        title="Confirm"
        actions={
          <>
            <Button variant="outline" onClick={() => close("cancel")}>
              Cancel
            </Button>
            <Button onClick={() => close("confirm")}>Ok</Button>
          </>
        }
      >
        <p className="text-muted-foreground">{message}</p>
      </DemoPanel>
    </DemoBackdrop>
  );
}

export { Modal };
