import { Button } from "@portfolio/ui/components/button";
import {
  CodeBlockAction,
  CodeBlockContent,
  CodeBlockTitle,
  CodeBlock as CodeBlockRoot,
} from "@portfolio/ui/components/code";
import { CheckIcon, CopyIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const COPIED_MS = 2000;

const CopyButton = ({ getText }: { getText: () => string }) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) {
      return;
    }
    const timeout = window.setTimeout(() => setCopied(false), COPIED_MS);
    return () => window.clearTimeout(timeout);
  }, [copied]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(getText());
      setCopied(true);
    } catch {
      setCopied(false);
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

interface CodeBlockProps {
  /** Shiki HTML rendered on the server from this repo's own files. */
  html: string;
  title?: string;
}

export const CodeBlock = ({ html, title }: CodeBlockProps) => {
  const codeRef = useRef<HTMLDivElement>(null);

  return (
    <CodeBlockRoot>
      {title === undefined ? null : <CodeBlockTitle>{title}</CodeBlockTitle>}
      <CodeBlockContent
        // oxlint-disable-next-line react/no-danger -- Shiki output of the site's own source files
        dangerouslySetInnerHTML={{ __html: html }}
        ref={codeRef}
      />
      <CodeBlockAction>
        <CopyButton getText={() => codeRef.current?.textContent ?? ""} />
      </CodeBlockAction>
    </CodeBlockRoot>
  );
};
