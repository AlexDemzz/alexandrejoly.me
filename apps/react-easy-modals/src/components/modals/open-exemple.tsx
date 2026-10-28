import { ModalProvider, useModals } from "react-easy-modals";

import { Modal } from "../action-modal";
import { ButtonExemple } from "../button-exemple";
import { Modal as CssModal } from "../css-modal";

const Client = () => {
  const modals = useModals();

  const handleClick = async () => {
    const result = await modals.open(Modal, {
      message: "Are you sure?",
    });

    if (result === "confirm") {
      modals.open(CssModal, { title: "Alert", message: "You confirmed" });
    } else {
      modals.open(CssModal, { title: "Alert", message: "You cancelled" });
    }
  };

  return <ButtonExemple label="Open modal" onClick={handleClick} />;
};

export const OpenExample = () => (
  <ModalProvider>
    <Client />
  </ModalProvider>
);

export default OpenExample;
