import { AnimatePresence, motion } from "motion/react";
import { useRef, useState } from "react";
import { ModalProvider, useBeforeClose, useModals } from "react-easy-modals";
import type { ModalProps } from "react-easy-modals";

import { ButtonExemple } from "../button-exemple";
import { DemoOutput, DemoPanel } from "../demo-modal";
import { Button } from "../ui/button";

const ease = [0.23, 1, 0.32, 1] as const;

function Modal({ close, isOpen }: ModalProps) {
  const [isVisible, setIsVisible] = useState(isOpen);
  const canClose = useRef(false);

  useBeforeClose(() => {
    setIsVisible(false);
    return canClose.current;
  });

  return (
    <AnimatePresence
      mode="wait"
      onExitComplete={() => {
        canClose.current = true;
        close();
      }}
    >
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease }}
        >
          <motion.div
            className="w-full max-w-xs"
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.2, ease }}
          >
            <DemoPanel
              title="Transition"
              className="animate-none"
              actions={<Button onClick={() => close()}>Close</Button>}
            >
              <p className="text-muted-foreground">
                I fade out before I unmount.
              </p>
            </DemoPanel>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

const Client = () => {
  const { open, stack } = useModals();

  return (
    <ButtonExemple onClick={() => open(Modal)}>
      <DemoOutput>stack: {JSON.stringify(stack.map((m) => m.id))}</DemoOutput>
    </ButtonExemple>
  );
};

const TransitionExemple = () => (
  <ModalProvider>
    <Client />
  </ModalProvider>
);

export default TransitionExemple;
