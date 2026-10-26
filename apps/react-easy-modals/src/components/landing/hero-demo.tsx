import { ArrowCounterClockwiseIcon, PlayIcon } from "@phosphor-icons/react";
import { Button } from "@portfolio/ui/components/button";
import {
  CodeBlock,
  CodeBlockActions,
  CodeBlockContent,
  CodeBlockHeader,
  CodeBlockLine,
  CodeBlockTitle,
} from "@portfolio/ui/components/code-block";
import { Text } from "@portfolio/ui/components/text";
import { useState } from "react";
import { useModals } from "react-easy-modals";
import type { ModalProps } from "react-easy-modals";

import { HastLine } from "@/components/hast";
import {
  Modal,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from "@/components/ui/modal";
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
      <CodeBlock>
        <CodeBlockHeader>
          <CodeBlockTitle>project-settings.tsx</CodeBlockTitle>
          <CodeBlockActions>
            <Button variant="ghost" size="sm" onClick={run} disabled={pending}>
              {state.status === "resolved" ? (
                <ArrowCounterClockwiseIcon
                  data-icon="inline-start"
                  aria-hidden="true"
                />
              ) : (
                <PlayIcon data-icon="inline-start" aria-hidden="true" />
              )}
              {state.status === "resolved" ? "Run again" : "Run"}
            </Button>
          </CodeBlockActions>
        </CodeBlockHeader>
        <CodeBlockContent>
          {code.before.map((line, index) => (
            <CodeBlockLine
              key={index}
              variant={
                index === AWAIT_LINE && pending ? "highlighted" : "default"
              }
            >
              <HastLine tree={line} />
              {index === AWAIT_LINE && pending && (
                <span className="text-muted-foreground ms-3 inline-flex items-center gap-2 font-sans select-none">
                  <span
                    aria-hidden="true"
                    className="pending-dot bg-muted-foreground size-1.5 rounded-full"
                  />
                  pending
                </span>
              )}
            </CodeBlockLine>
          ))}
          {state.status === "resolved" && (
            <CodeBlockLine key={state.run} variant="highlighted">
              <span className="resolved-line">
                <HastLine tree={code.answers[state.answer ?? "undefined"]} />
              </span>
            </CodeBlockLine>
          )}
          {code.after.map((line, index) => (
            <CodeBlockLine key={`after-${index}`}>
              <HastLine tree={line} />
            </CodeBlockLine>
          ))}
        </CodeBlockContent>
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
