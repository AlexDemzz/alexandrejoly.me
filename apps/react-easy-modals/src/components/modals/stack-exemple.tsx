import { ModalProvider, useModals } from "react-easy-modals";

import { ButtonExemple } from "../button-exemple";
import { DemoOutput } from "../demo-modal";
import { Modal } from "../stack-modal";

const Client = () => {
  const modals = useModals();

  return (
    <ButtonExemple label="Open modal" onClick={() => modals.open(Modal)}>
      <DemoOutput>
        stack: {JSON.stringify(modals.stack.map((m) => m.id))}
      </DemoOutput>
    </ButtonExemple>
  );
};

export const StackExample = () => (
  <ModalProvider>
    <Client />
  </ModalProvider>
);

export default StackExample;
