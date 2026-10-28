import { Button } from "@portfolio/ui/components/button";
import {
  Modal,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from "@portfolio/ui/components/modal";
import { useState } from "react";
import type { ModalProps } from "react-easy-modals";
import { ModalProvider, useModals } from "react-easy-modals";

import { ButtonExemple } from "../button-exemple";
import { DemoOutput } from "../demo-modal";

type ConfirmModalReturnType = "confirm" | "cancel" | undefined;

function ConfirmModal({ close }: ModalProps<ConfirmModalReturnType>) {
  return (
    <Modal>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>Confirm Action</ModalTitle>
          <ModalDescription>
            Are you sure you want to proceed with this action?
          </ModalDescription>
        </ModalHeader>
        <ModalFooter>
          <Button variant="outline" onClick={() => close("cancel")}>
            Cancel
          </Button>
          <Button onClick={() => close("confirm")}>Confirm</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

const Client = () => {
  const modals = useModals();
  const [modalResult, setModalResult] = useState<ConfirmModalReturnType>();

  const handleClick = async () => {
    const result = await modals.open(ConfirmModal);
    setModalResult(result);
  };

  return (
    <ButtonExemple onClick={handleClick}>
      <DemoOutput>result: {String(modalResult)}</DemoOutput>
    </ButtonExemple>
  );
};

const RegistryModalExample = () => (
  <ModalProvider>
    <Client />
  </ModalProvider>
);

export default RegistryModalExample;
