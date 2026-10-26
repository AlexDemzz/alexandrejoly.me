import type { ModalProps } from "react-easy-modals";

import { DemoBackdrop, DemoPanel } from "./demo-modal";
import { Button } from "./ui/button";

function Modal({
  title,
  message,
  close,
  isOpen,
}: ModalProps & {
  title: string;
  message: string;
}) {
  if (!isOpen) {
    return null;
  }

  return (
    <DemoBackdrop>
      <DemoPanel
        title={title}
        actions={<Button onClick={() => close()}>OK</Button>}
      >
        <p className="text-muted-foreground">{message}</p>
      </DemoPanel>
    </DemoBackdrop>
  );
}

export { Modal };
