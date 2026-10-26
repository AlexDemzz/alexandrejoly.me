import { useState } from "react";
import { ModalProvider, useModals } from "react-easy-modals";
import type { ModalProps } from "react-easy-modals";

import { ButtonExemple } from "../button-exemple";
import { DemoBackdrop, DemoOutput, DemoPanel } from "../demo-modal";
import { Button } from "../ui/button";

type ReturnType = "cancel" | "confirm";

function Modal({ close, isOpen }: ModalProps<ReturnType>) {
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
            <Button onClick={() => close("confirm")}>Confirm</Button>
          </>
        }
      >
        <p className="text-muted-foreground">Are you sure?</p>
      </DemoPanel>
    </DemoBackdrop>
  );
}

const Client = () => {
  const { open } = useModals();
  const [modalResult, setModalResult] = useState<string | undefined>();

  const handleClick = async () => {
    const result = await open(Modal);
    setModalResult(result);
  };

  return (
    <ButtonExemple onClick={handleClick}>
      <DemoOutput>result: {String(modalResult)}</DemoOutput>
    </ButtonExemple>
  );
};

const ConfirmExemple = () => (
  <ModalProvider>
    <Client />
  </ModalProvider>
);

export default ConfirmExemple;
