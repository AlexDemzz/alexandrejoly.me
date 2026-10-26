import { Button } from "@portfolio/ui/components/button";
import { useState } from "react";
import { useModalAt, useModals } from "react-easy-modals";
import type { ModalProps } from "react-easy-modals";

import { ButtonExemple } from "@/components/button-exemple";
import { DemoOutput } from "@/components/demo-modal";
import {
  Modal,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
  useBeforeClose,
} from "@/components/ui/modal";
import { wait } from "@/lib/wait";

const LAZY_DELAY_MS = 1000;

// Landing demos run on the shadcn Base UI Modal from the registry; the docs
// keep the unstyled versions to show that the library is headless.

function StepModal({ close, index }: ModalProps) {
  const modals = useModals();

  return (
    <Modal>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>Step {index + 1}</ModalTitle>
          <ModalDescription>
            Open another step: this one waits underneath until it closes.
          </ModalDescription>
        </ModalHeader>
        <ModalFooter>
          <Button variant="outline" onClick={() => close()}>
            Back
          </Button>
          <Button onClick={() => modals.open(StepModal)}>Next step</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export const StackDemo = () => {
  const modals = useModals();

  return (
    <ButtonExemple label="Open step 1" onClick={() => modals.open(StepModal)}>
      <DemoOutput>open modals: {modals.stack.length}</DemoOutput>
    </ButtonExemple>
  );
};

function NestedModal({
  close,
  open,
  nested,
  depth,
}: ModalProps & { depth: number }) {
  const root = useModalAt("root");

  return (
    <Modal>
      <ModalContent>
        {nested}
        <ModalHeader>
          <ModalTitle>
            {depth === 0 ? "Parent" : `Nested level ${depth}`}
          </ModalTitle>
          <ModalDescription>
            Each level renders inside its parent. Close one level, or the whole
            chain.
          </ModalDescription>
        </ModalHeader>
        <ModalFooter className="flex-wrap">
          {depth > 0 && (
            <Button variant="outline" onClick={() => root.close()}>
              Close all
            </Button>
          )}
          <Button variant="outline" onClick={() => close()}>
            Close
          </Button>
          <Button onClick={() => open(NestedModal, { depth: depth + 1 })}>
            Open nested
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export const NestedDemo = () => {
  const modals = useModals();

  return (
    <ButtonExemple onClick={() => modals.open(NestedModal, { depth: 0 })} />
  );
};

type DraftAnswer = "saved" | "discarded" | undefined;

function DraftModal({ close }: ModalProps<DraftAnswer>) {
  const [draft, setDraft] = useState("");

  useBeforeClose<DraftAnswer>((answer) => answer !== undefined);

  return (
    <Modal>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>New note</ModalTitle>
          <ModalDescription>
            Try Escape, a click outside or the close button: the modal stays
            open until you save or discard.
          </ModalDescription>
        </ModalHeader>
        <textarea
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Write a note"
          aria-label="Note"
          className="shadow-hairline bg-background placeholder:text-faint-foreground [field-sizing:content] min-h-24 resize-none rounded-md px-3 py-2 text-base"
        />
        <ModalFooter>
          <Button variant="outline" onClick={() => close("discarded")}>
            Discard
          </Button>
          <Button onClick={() => close("saved")}>Save</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export const GuardDemo = () => {
  const modals = useModals();
  const [answer, setAnswer] = useState<DraftAnswer | "none">("none");

  return (
    <ButtonExemple
      label="Write a note"
      onClick={async () => setAnswer(await modals.open(DraftModal))}
    >
      {answer !== "none" && (
        <DemoOutput>closed with: {String(answer)}</DemoOutput>
      )}
    </ButtonExemple>
  );
};

function FadeModal({ close }: ModalProps) {
  return (
    <Modal>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>Watch it leave</ModalTitle>
          <ModalDescription>
            Close it: the Dialog plays its exit animation, and only then does
            react-easy-modals unmount it and resolve the promise.
          </ModalDescription>
        </ModalHeader>
        <ModalFooter>
          <Button onClick={() => close()}>Close</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export const TransitionDemo = () => {
  const modals = useModals();
  const [resolved, setResolved] = useState(0);

  return (
    <ButtonExemple
      onClick={async () => {
        await modals.open(FadeModal);
        setResolved((count) => count + 1);
      }}
    >
      <DemoOutput>promises resolved after the animation: {resolved}</DemoOutput>
    </ButtonExemple>
  );
};

function SettingsModal({ close }: ModalProps) {
  return (
    <Modal>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>Loaded on demand</ModalTitle>
          <ModalDescription>
            This modal’s code was fetched when you opened it, not with the page.
          </ModalDescription>
        </ModalHeader>
        <ModalFooter>
          <Button onClick={() => close()}>Done</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

// Stands in for () => import("./settings-modal") on a slow network, so the
// provider's loading state is visible.
const loadSettingsModal = async () => {
  await wait(LAZY_DELAY_MS);
  return { default: SettingsModal };
};

export const LazyDemo = () => {
  const modals = useModals();

  return <ButtonExemple onClick={() => modals.open(loadSettingsModal)} />;
};
