import { Button } from "@portfolio/ui/components/button";
import {
  CodeBlock,
  CodeBlockContent,
  CodeBlockHeader,
} from "@portfolio/ui/components/code-block";
import {
  Modal,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from "@portfolio/ui/components/modal";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@portfolio/ui/components/tabs";
import { useState } from "react";
import { useModals } from "react-easy-modals";
import type { ModalProps } from "react-easy-modals";

import { DemoOutput } from "@/components/demo-modal";
import { HastLines } from "@/components/hast";
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
            {`Your answer resolves the promise from modals.open(): Delete returns "delete", Cancel returns "cancel" and Escape returns undefined.`}
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

type Result = { status: "waiting" } | { status: "resolved"; answer: Answer };

// The resolved value as the code reads it: strings keep their quotes.
const formatAnswer = (answer: Answer) =>
  answer === undefined ? "undefined" : JSON.stringify(answer);

const FILES = [
  { value: "caller", title: "project-settings.tsx" },
  { value: "modal", title: "confirm-delete.tsx" },
] as const;

export const HeroDemo = ({ code }: { code: LandingCode["hero"] }) => {
  const modals = useModals();
  const [result, setResult] = useState<Result>({ status: "waiting" });

  const show = async () => {
    setResult({ status: "waiting" });
    const answer = await modals.open(ConfirmDelete, { project: "acme-web" });
    setResult({ status: "resolved", answer });
  };

  // The frame and the code sit 8px inside the card, so their rounded-xl
  // (16px) is the card's rounded-3xl (24px) minus the gap.
  return (
    <div className="grid gap-2 rounded-3xl border p-2 md:grid-cols-[14rem_1fr]">
      <div className="bg-muted flex min-h-48 flex-col items-center justify-center gap-3 rounded-xl p-6 text-center">
        <Button onClick={show}>Show modal</Button>
        {/* A placeholder holds the answer's line, so nothing shifts. */}
        <DemoOutput aria-live="polite">
          {result.status === "waiting"
            ? "No answer yet"
            : formatAnswer(result.answer)}
        </DemoOutput>
      </div>
      <CodeBlock>
        <Tabs defaultValue="caller">
          <CodeBlockHeader>
            <TabsList aria-label="Files">
              {FILES.map((file) => (
                <TabsTrigger key={file.value} value={file.value}>
                  {file.title}
                </TabsTrigger>
              ))}
            </TabsList>
          </CodeBlockHeader>
          {FILES.map((file) => (
            <TabsContent key={file.value} value={file.value}>
              <CodeBlockContent
                // oxlint-disable-next-line shadcn/no-restyle -- one height for both files, so switching tabs doesn't shift the layout
                className="h-60"
              >
                <HastLines lines={code[file.value].lines} />
              </CodeBlockContent>
            </TabsContent>
          ))}
        </Tabs>
      </CodeBlock>
    </div>
  );
};
