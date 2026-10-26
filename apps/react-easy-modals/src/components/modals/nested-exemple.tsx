import { Button } from "@portfolio/ui/components/button";
import type { CSSProperties } from "react";
import { ModalProvider, useModalAt, useModals } from "react-easy-modals";
import type { ModalProps } from "react-easy-modals";

import { ButtonExemple } from "../button-exemple";
import { DemoBackdrop, DemoOutput, DemoPanel } from "../demo-modal";

function ChildModal({
  close,
  isOpen,
  index,
  open,
  nested,
  title,
  openRoot,
}: ModalProps & { title: string; openRoot: () => void }) {
  const root = useModalAt("root");
  const parent = useModalAt(-1);
  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="absolute inset-0 z-50 grid translate-y-(--nested-offset) place-items-center"
      style={{ "--nested-offset": `${index + 3}px` } as CSSProperties}
    >
      <DemoPanel title={title} className="w-72 max-w-none">
        <p className="text-muted-foreground">Index: {index}</p>
        <div className="grid grid-cols-2 gap-2">
          <Button onClick={() => open(ChildModal, { title, openRoot })}>
            Add
          </Button>
          <Button variant="outline" onClick={() => close()}>
            Remove
          </Button>
          <Button variant="outline" className="col-span-2" onClick={openRoot}>
            New root modal
          </Button>
          <Button
            variant="outline"
            className="col-span-2"
            onClick={() => parent.close()}
          >
            Close parent modal
          </Button>
          <Button
            variant="outline"
            className="col-span-2"
            onClick={() => root.close()}
          >
            Close root modal
          </Button>
        </div>
        {nested}
      </DemoPanel>
    </div>
  );
}

function ParentModal({ close, isOpen, open, nested, index }: ModalProps) {
  const modals = useModals();
  // A child opens a new root through this, since it cannot name ParentModal.
  const openRoot = () => {
    void modals.open(ParentModal);
  };

  if (!isOpen) {
    return null;
  }

  return (
    <DemoBackdrop>
      <DemoPanel
        title={`Parent modal ${index}`}
        className="relative w-80 max-w-none"
        actions={
          <>
            <Button variant="outline" onClick={() => close()}>
              Close
            </Button>
            <Button
              onClick={() =>
                open(ChildModal, {
                  title: `Nested in parent ${index}`,
                  openRoot,
                })
              }
            >
              Open nested
            </Button>
          </>
        }
      >
        <p className="text-muted-foreground">
          Open a nested modal inside this one.
        </p>
        {nested}
      </DemoPanel>
    </DemoBackdrop>
  );
}

const Client = () => {
  const modals = useModals();

  return (
    <ButtonExemple onClick={() => modals.open(ParentModal)}>
      <DemoOutput>
        stack: {JSON.stringify(modals.stack.map((m) => m.id))}
      </DemoOutput>
    </ButtonExemple>
  );
};

const NestedExample = () => (
  <ModalProvider>
    <Client />
  </ModalProvider>
);

export default NestedExample;
