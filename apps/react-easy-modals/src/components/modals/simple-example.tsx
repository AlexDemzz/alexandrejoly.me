import { ModalProvider, useModals } from "react-easy-modals";

import { ButtonExemple } from "../button-exemple";
import { Modal } from "../css-modal";

const Client = () => {
  const { open } = useModals();

  const handleClick = () => {
    open(Modal, {
      title: "Alert",
      message: "This is an alert",
    });
  };

  return <ButtonExemple label="Open modal" onClick={handleClick} />;
};

export const SimpleExample = () => (
  <ModalProvider>
    <Client />
  </ModalProvider>
);

export default SimpleExample;
