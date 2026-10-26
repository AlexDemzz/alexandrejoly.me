import type { Root } from "hast";
import { CheckIcon, CopyIcon } from "lucide-react";
import { useRef } from "react";
import type { ComponentProps, ReactNode } from "react";

import { Hast } from "@/components/hast";
import { Button } from "@/components/ui/button";
import {
  CodeBlockAction,
  CodeBlockContent,
  CodeBlockTitle,
  CodeBlock as CodeBlockRoot,
} from "@/components/ui/code";
import { useFlash } from "@/lib/use-flash";

const CopyButton = ({ getText }: { getText: () => string }) => {
  const [copied, flashCopied] = useFlash(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(getText());
      flashCopied(true);
    } catch {
      // Clipboard denied: the button keeps its copy label.
    }
  };

  return (
    <Button
      aria-label={copied ? "Copied" : "Copy code"}
      onClick={copy}
      size="icon-sm"
      variant="ghost"
    >
      {copied ? <CheckIcon /> : <CopyIcon />}
    </Button>
  );
};

type CodeBlockProps = Omit<ComponentProps<"figure">, "title" | "children"> & {
  title?: ReactNode;
  /**
   * Replaces the copy button, pinned to the top end. `null` drops it.
   * Defaults to a copy button for the rendered code.
   */
  action?: ReactNode;
} & (
    | {
        /** A `<pre>` with highlighted lines. */
        children: ReactNode;
        code?: never;
        hast?: never;
      }
    | {
        /** Plain source, rendered unhighlighted. */
        code: string;
        children?: never;
        hast?: never;
      }
    | {
        /** Shiki output from the server, as a hast tree. */
        hast: Root;
        children?: never;
        code?: never;
      }
  );

export const CodeBlock = ({
  title,
  action,
  children,
  code,
  hast,
  ...props
}: CodeBlockProps) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const copy = (
    <CopyButton getText={() => code ?? contentRef.current?.textContent ?? ""} />
  );
  const pinned = action === undefined ? copy : action;

  return (
    <CodeBlockRoot {...props}>
      {title === undefined ? null : <CodeBlockTitle>{title}</CodeBlockTitle>}
      <CodeBlockContent ref={contentRef}>
        {hast === undefined ? null : <Hast tree={hast} />}
        {code === undefined ? null : (
          <pre>
            <code>{code}</code>
          </pre>
        )}
        {children}
      </CodeBlockContent>
      {pinned === null ? null : <CodeBlockAction>{pinned}</CodeBlockAction>}
    </CodeBlockRoot>
  );
};
