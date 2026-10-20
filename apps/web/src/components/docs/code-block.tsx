import { Button } from "@portfolio/ui/components/button";
import { cn } from "@portfolio/ui/lib/utils";
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
      className="absolute end-2 top-2"
      onClick={copy}
      size="icon-sm"
      variant="ghost"
    >
      {copied ? <CheckIcon /> : <CopyIcon />}
    </Button>
  );
};

interface CodeBlockProps {
  className?: string;
  /** Shiki HTML rendered on the server from this repo's own files. */
  html: string;
  title?: string;
}

export const CodeBlock = ({ className, html, title }: CodeBlockProps) => {
  const codeRef = useRef<HTMLDivElement>(null);

  return (
    <figure className={cn("bg-muted relative min-w-0 rounded-xl", className)}>
      {title === undefined ? null : (
        <figcaption className="text-muted-foreground border-background border-b-2 px-4 py-2 pe-12 font-mono text-sm">
          {title}
        </figcaption>
      )}
      <div
        className="max-h-112 overflow-auto overscroll-contain"
        data-slot="code-block"
        // oxlint-disable-next-line react/no-danger -- Shiki output of the site's own source files
        dangerouslySetInnerHTML={{ __html: html }}
        ref={codeRef}
      />
      <CopyButton getText={() => codeRef.current?.textContent ?? ""} />
    </figure>
  );
};
