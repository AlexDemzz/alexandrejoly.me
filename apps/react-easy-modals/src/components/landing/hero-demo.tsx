import { Play, RotateCcw } from "lucide-react";
import { useState } from "react";
import { useModals } from "react-easy-modals";
import type { ModalProps } from "react-easy-modals";

import { CodeBlock } from "@/components/code-block";
import { HastLine } from "@/components/hast";
import { Button } from "@/components/ui/button";
import {
  Modal,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from "@/components/ui/modal";
import { Text } from "@/components/ui/text";
import type { LandingCode } from "@/lib/landing-code";

type Answer = "delete" | "cancel" | undefined;

function ConfirmDelete({
  close,
  project,
}: ModalProps<Answer> & { project: string }) {
  return (
    <Modal>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>Delete {project}?</ModalTitle>
          <ModalDescription>
            This removes the project and its deployments. You can’t undo it.
          </ModalDescription>
        </ModalHeader>
        <ModalFooter>
          <Button variant="outline" onClick={() => close("cancel")}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={() => close("delete")}>
            Delete
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

type RunState =
  | { status: "idle" }
  | { status: "pending" }
  | { status: "resolved"; answer: Answer; run: number };

const AWAIT_LINE = 3;

// Lines bleed into the card's inline padding (and the pre's end padding that
// clears the pinned button), so a highlighted line spans the whole card.
const LINE = "-ms-4 -me-14 block ps-4 pe-14";

export const HeroDemo = ({ code }: { code: LandingCode["hero"] }) => {
  const modals = useModals();
  const [state, setState] = useState<RunState>({ status: "idle" });
  const pending = state.status === "pending";

  const run = async () => {
    setState({ status: "pending" });
    const answer = await modals.open(ConfirmDelete, { project: "acme-web" });
    setState((previous) => ({
      status: "resolved",
      answer,
      run: previous.status === "resolved" ? previous.run + 1 : 1,
    }));
  };

  return (
    <div className="flex flex-col gap-3">
      <CodeBlock
        title="project-settings.tsx"
        action={
          <Button variant="ghost" size="sm" onClick={run} disabled={pending}>
            {state.status === "resolved" ? (
              <RotateCcw data-icon="inline-start" aria-hidden="true" />
            ) : (
              <Play data-icon="inline-start" aria-hidden="true" />
            )}
            {state.status === "resolved" ? "Run again" : "Run"}
          </Button>
        }
      >
        <pre className="shiki">
          <code>
            {code.before.map((line, index) => (
              <span
                key={index}
                className={`${LINE} data-active:bg-accent transition-colors duration-200 ease-out`}
                data-active={index === AWAIT_LINE && pending ? "" : undefined}
              >
                <span>
                  <HastLine tree={line} />
                </span>
                {index === AWAIT_LINE && pending && (
                  <span className="text-muted-foreground ms-3 inline-flex items-center gap-2 font-sans select-none">
                    <span
                      aria-hidden="true"
                      className="pending-dot bg-muted-foreground size-1.5 rounded-full"
                    />
                    pending
                  </span>
                )}
              </span>
            ))}
            {state.status === "resolved" && (
              <span key={state.run} className={`resolved-line ${LINE}`}>
                <HastLine tree={code.answers[state.answer ?? "undefined"]} />
              </span>
            )}
            {code.after.map((line, index) => (
              <span key={`after-${index}`} className={LINE}>
                <HastLine tree={line} />
              </span>
            ))}
          </code>
        </pre>
      </CodeBlock>

      <Text variant="faint" aria-live="polite">
        {state.status === "idle" &&
          "Run it: the modal opens, and the promise waits for its answer."}
        {pending &&
          "Waiting on modals.open(). Pick an answer, or press Escape."}
        {state.status === "resolved" &&
          (state.answer === undefined
            ? "Dismissed without an answer, so the promise resolved to undefined."
            : `The promise resolved with "${state.answer}".`)}
      </Text>
    </div>
  );
};
