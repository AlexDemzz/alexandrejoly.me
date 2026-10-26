import { Button } from "@portfolio/ui/components/button";
import { useModals } from "react-easy-modals";
import type { ModalProps } from "react-easy-modals";

import { DemoBackdrop, DemoPanel } from "./demo-modal";

function Modal({ close, isOpen, index }: ModalProps) {
  const modals = useModals();
  if (!isOpen) {
    return null;
  }

  return (
    <DemoBackdrop>
      <DemoPanel
        title="Confirm"
        actions={
          <>
            <Button variant="outline" onClick={() => close()}>
              Cancel
            </Button>
            <Button onClick={() => modals.open(Modal)}>Ok</Button>
          </>
        }
      >
        <p className="text-muted-foreground">
          Open another modal? This is modal #{index + 1}
        </p>
      </DemoPanel>
    </DemoBackdrop>
  );
}

export { Modal };
