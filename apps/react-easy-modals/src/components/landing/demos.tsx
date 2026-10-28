import { Button } from "@portfolio/ui/components/button";
import {
  Modal,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
  useBeforeClose,
} from "@portfolio/ui/components/modal";
import { useId, useState } from "react";
import { useModalAt, useModals } from "react-easy-modals";
import type { ModalProps } from "react-easy-modals";

import { ButtonExemple } from "@/components/button-exemple";
import { DemoOutput } from "@/components/demo-modal";
import { wait } from "@/lib/wait";

const LAZY_DELAY_MS = 1000;
const TRACE_LENGTH = 6;

// Landing demos run on the shadcn Base UI Modal from the registry; the docs
// keep the unstyled versions to show that the library is headless.

// The trace under a demo: each call the demo makes and what the library
// answers, newest last.
const useTrace = () => {
  const [lines, setLines] = useState<string[]>([]);
  const log = (line: string) =>
    setLines((previous) => [...previous.slice(1 - TRACE_LENGTH), line]);
  return { lines, log };
};

const Trace = ({ lines }: { lines: string[] }) => (
  <ol
    aria-label="Trace"
    aria-live="polite"
    className="bg-muted text-muted-foreground flex min-h-24 w-full max-w-sm flex-col gap-1 rounded-lg p-3 text-start font-mono text-sm wrap-break-word whitespace-pre-wrap"
  >
    {lines.length === 0 ? (
      <li>Calls show up here.</li>
    ) : (
      lines.map((line, index) => (
        <li
          key={`${index}-${line}`}
          className={index === lines.length - 1 ? "text-foreground" : undefined}
        >
          {line}
        </li>
      ))
    )}
  </ol>
);

type Log = (line: string) => void;

function StepModal({
  close,
  step,
  onNext,
}: ModalProps & { step: number; onNext: () => void }) {
  return (
    <Modal>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>Step {step}</ModalTitle>
          <ModalDescription>
            Open another step: this one waits underneath until it closes.
          </ModalDescription>
        </ModalHeader>
        <ModalFooter>
          <Button variant="outline" onClick={() => close()}>
            Back
          </Button>
          <Button onClick={onNext}>Next step</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export const StackDemo = () => {
  const modals = useModals();
  const { lines, log } = useTrace();

  const openStep = async (step: number) => {
    log(`modals.open(Step${step})`);
    if (step > 1) {
      log(`  Step${step - 1} hidden, waits underneath`);
    }
    await modals.open(StepModal, {
      step,
      onNext: () => openStep(step + 1),
    });
    log(`Step${step} closed, its promise resolved`);
  };

  return (
    <ButtonExemple label="Open step 1" onClick={() => openStep(1)}>
      <Trace lines={lines} />
    </ButtonExemple>
  );
};

const levelName = (depth: number) =>
  depth === 0 ? "Parent" : `Nested level ${depth}`;

function NestedModal({
  close,
  open,
  nested,
  depth,
  log,
}: ModalProps & { depth: number; log: Log }) {
  const root = useModalAt("root");
  const name = levelName(depth);

  const openNested = async () => {
    log(`${name}: open(NestedModal)`);
    await open(NestedModal, { depth: depth + 1, log });
    log(`${levelName(depth + 1)} closed, its promise resolved`);
  };

  return (
    <Modal>
      <ModalContent>
        {nested}
        <ModalHeader>
          <ModalTitle>{name}</ModalTitle>
          <ModalDescription>
            Each level renders inside its parent. Close one level, or the whole
            chain.
          </ModalDescription>
        </ModalHeader>
        <ModalFooter className="flex-wrap">
          {depth > 0 && (
            <Button
              variant="outline"
              onClick={() => {
                log(`${name}: useModalAt("root").close()`);
                root.close();
              }}
            >
              Close all
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => {
              log(`${name}: close()`);
              close();
            }}
          >
            Close
          </Button>
          <Button onClick={openNested}>Open nested</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export const NestedDemo = () => {
  const modals = useModals();
  const { lines, log } = useTrace();

  return (
    <ButtonExemple
      onClick={async () => {
        log("modals.open(NestedModal)");
        await modals.open(NestedModal, { depth: 0, log });
        log("Parent closed, its promise resolved");
      }}
    >
      <Trace lines={lines} />
    </ButtonExemple>
  );
};

type DraftAnswer = "saved" | "discarded" | undefined;

function DraftModal({ close }: ModalProps<DraftAnswer>) {
  const [draft, setDraft] = useState("");
  const [empty, setEmpty] = useState(false);
  const errorId = useId();

  useBeforeClose<DraftAnswer>((answer) => {
    if (answer === "saved" && draft.trim() === "") {
      setEmpty(true);
      return false;
    }
    return answer !== undefined;
  });

  return (
    <Modal>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>New note</ModalTitle>
          <ModalDescription>
            Try Escape, a click outside, the close button or Save with an empty
            note: the modal stays open until you save a note or discard it.
          </ModalDescription>
        </ModalHeader>
        <textarea
          value={draft}
          onChange={(event) => {
            setDraft(event.target.value);
            setEmpty(false);
          }}
          placeholder="Write a note"
          aria-label="Note"
          aria-invalid={empty}
          aria-describedby={empty ? errorId : undefined}
          className="shadow-hairline bg-background placeholder:text-faint-foreground aria-invalid:ring-destructive [field-sizing:content] min-h-24 resize-none rounded-md px-3 py-2 text-base aria-invalid:ring-1"
        />
        {empty && (
          <p id={errorId} className="text-destructive text-sm">
            Write something before you save.
          </p>
        )}
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
