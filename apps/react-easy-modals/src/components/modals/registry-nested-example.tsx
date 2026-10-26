import { Button } from "@portfolio/ui/components/button";
import { useState } from "react";
import type { ModalProps } from "react-easy-modals";
import { ModalProvider, useModalAt, useModals } from "react-easy-modals";

import {
  Modal,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from "@/components/ui/modal";

import { ButtonExemple } from "../button-exemple";
import { DemoOutput } from "../demo-modal";

interface PromiseResult {
  order: number;
  source: string;
}

type PromiseResolvedHandler = (source: string) => void;

interface ExampleModalProps {
  onPromiseResolved: PromiseResolvedHandler;
}

const trackModalPromise = async (
  promise: Promise<unknown>,
  source: string,
  onPromiseResolved: PromiseResolvedHandler
) => {
  await promise;
  onPromiseResolved(source);
};

function ChildModal({
  close,
  open,
  title,
  nested,
  onPromiseResolved,
  openRoot,
}: ModalProps<string> & {
  title: string;
  openRoot: () => void;
} & ExampleModalProps) {
  const root = useModalAt<string>("root");
  const parent = useModalAt<string>(-1);

  return (
    <Modal>
      <ModalContent>
        {nested}
        <ModalHeader>
          <ModalTitle>{title}</ModalTitle>
          <ModalDescription>
            Open another nested modal, close this one, or close the root.
          </ModalDescription>
        </ModalHeader>
        <ModalFooter className="flex-wrap">
          <Button
            variant="outline"
            onClick={() => {
              void trackModalPromise(
                open(ChildModal, {
                  onPromiseResolved,
                  openRoot,
                  title: `Nested under ${title}`,
                }),
                `Nested under ${title}`,
                onPromiseResolved
              );
            }}
          >
            Open nested
          </Button>
          <Button variant="outline" onClick={() => close(`Closed ${title}`)}>
            Close this
          </Button>
          <Button
            variant="outline"
            onClick={() => parent.close(`Closed parent from ${title}`)}
          >
            Close parent
          </Button>
          <Button variant="outline" onClick={openRoot}>
            Open new root
          </Button>
          <Button onClick={() => root.close(`Closed root from ${title}`)}>
            Close root
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

function ParentModal({
  open,
  close,
  nested,
  onPromiseResolved,
}: ModalProps<string> & ExampleModalProps) {
  const modals = useModals();
  // A child opens a new root through this, since it cannot name ParentModal.
  const openRoot = () => {
    void trackModalPromise(
      modals.open(ParentModal, { onPromiseResolved }),
      "New root parent",
      onPromiseResolved
    );
  };

  return (
    <Modal>
      <ModalContent>
        {nested}
        <ModalHeader>
          <ModalTitle>Parent Modal</ModalTitle>
          <ModalDescription>
            Open a nested modal inside this one.
          </ModalDescription>
        </ModalHeader>
        <ModalFooter>
          <Button variant="outline" onClick={() => close("Closed parent")}>
            Close
          </Button>
          <Button
            onClick={() => {
              void trackModalPromise(
                open(ChildModal, {
                  onPromiseResolved,
                  openRoot,
                  title: "Nested!",
                }),
                "Nested!",
                onPromiseResolved
              );
            }}
          >
            Open nested
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

const Client = () => {
  const modals = useModals();
  const [promiseResults, setPromiseResults] = useState<PromiseResult[]>([]);

  const handlePromiseResolved: PromiseResolvedHandler = (source) => {
    setPromiseResults((currentResults) => [
      ...currentResults,
      {
        order: currentResults.length + 1,
        source,
      },
    ]);
  };

  const handleClick = () => {
    void trackModalPromise(
      modals.open(ParentModal, { onPromiseResolved: handlePromiseResolved }),
      "Parent",
      handlePromiseResolved
    );
  };

  return (
    <ButtonExemple onClick={handleClick}>
      <DemoOutput>
        stack: {JSON.stringify(modals.stack.map((m) => m.id))}
      </DemoOutput>
      {promiseResults.length > 0 && (
        <ol className="flex max-h-40 flex-col items-center gap-1 overflow-y-auto">
          {promiseResults.toReversed().map((result) => (
            <li key={result.order}>
              <DemoOutput>resolved: {result.source}</DemoOutput>
            </li>
          ))}
        </ol>
      )}
    </ButtonExemple>
  );
};

const RegistryNestedExample = () => (
  <ModalProvider>
    <Client />
  </ModalProvider>
);

export default RegistryNestedExample;
