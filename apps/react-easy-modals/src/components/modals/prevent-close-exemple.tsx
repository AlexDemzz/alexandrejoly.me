import { useState } from "react";
import { ModalProvider, useBeforeClose, useModals } from "react-easy-modals";
import type { ModalProps } from "react-easy-modals";

import { ButtonExemple } from "../button-exemple";
import { DemoBackdrop, DemoOutput, DemoPanel } from "../demo-modal";
import { Button } from "../ui/button";

type ReturnType = "cancel" | "confirm";

function Modal({ close, isOpen }: ModalProps<ReturnType>) {
  const [canClose, setCanClose] = useState(true);

  useBeforeClose<ReturnType>(() => canClose);

  if (!isOpen) {
    return null;
  }

  return (
    <DemoBackdrop>
      <DemoPanel
        title="Preventing close"
        actions={
          <>
            <Button variant="outline" onClick={() => close("cancel")}>
              Cancel
            </Button>
            <Button onClick={() => close("confirm")}>Confirm</Button>
          </>
        }
      >
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            className="accent-primary size-4"
            checked={canClose}
            onChange={(e) => setCanClose(e.target.checked)}
          />
          Can close?
        </label>
      </DemoPanel>
    </DemoBackdrop>
  );
}

const Client = () => {
  const { open } = useModals();
  const [modalResult, setModalResult] = useState<string | undefined>();

  const handleClick = async () => {
    const res = await open(Modal);
    if (typeof res === "string") {
      setModalResult(res);
    }
  };

  return (
    <ButtonExemple onClick={handleClick}>
      {modalResult && <DemoOutput>closed with: {modalResult}</DemoOutput>}
    </ButtonExemple>
  );
};

const PreventCloseExemple = () => (
  <ModalProvider>
    <Client />
  </ModalProvider>
);

export default PreventCloseExemple;
