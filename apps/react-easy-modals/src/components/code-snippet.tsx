import { CaretDownIcon } from "@phosphor-icons/react";
import { Button } from "@portfolio/ui/components/button";
import {
  CodeBlock,
  CodeBlockActions,
  CodeBlockContent,
  CodeBlockCopyButton,
  CodeBlockFooter,
} from "@portfolio/ui/components/code-block";
import { useId, useState } from "react";

import { HastLines } from "@/components/hast";
import type { HighlightedSnippet } from "@/lib/landing-code";

// As on ui.shadcn.com: a collapsible block shows its first lines, then
// scrolls once expanded.
const COLLAPSED = "scroll-fade-y max-h-36 overflow-y-hidden";
const EXPANDED = "scroll-fade-y max-h-96";

export const CodeSnippet = ({
  snippet,
  copyable = true,
  collapsible = false,
}: {
  snippet: HighlightedSnippet;
  copyable?: boolean;
  /** Shows the first lines with a "Show more" button. */
  collapsible?: boolean;
}) => {
  const id = useId();
  const [expanded, setExpanded] = useState(false);
  let contentClassName: string | undefined;
  if (collapsible) {
    contentClassName = expanded ? EXPANDED : COLLAPSED;
  }

  return (
    <CodeBlock>
      {copyable ? (
        <CodeBlockActions>
          <CodeBlockCopyButton value={snippet.code} />
        </CodeBlockActions>
      ) : null}
      <CodeBlockContent
        // oxlint-disable-next-line shadcn/no-restyle, shadcn/require-static-classes -- the shadcn docs cap and expand a block this way
        className={contentClassName}
        id={id}
      >
        <HastLines lines={snippet.lines} />
      </CodeBlockContent>
      {collapsible && (
        <CodeBlockFooter className="justify-center">
          <Button
            aria-controls={id}
            aria-expanded={expanded}
            onClick={() => setExpanded(!expanded)}
            size="xs"
            variant="ghost"
          >
            <CaretDownIcon className="transition-transform in-aria-expanded:rotate-180" />
            {expanded ? "Show less" : "Show more"}
          </Button>
        </CodeBlockFooter>
      )}
    </CodeBlock>
  );
};
