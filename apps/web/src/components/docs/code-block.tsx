import { Button } from "@portfolio/ui/components/button";
import {
  CodeBlockActions,
  CodeBlockContent,
  CodeBlockCopyButton,
  CodeBlockFooter,
  CodeBlockHeader,
  CodeBlockLine,
  CodeBlockTitle,
  CodeBlock as CodeBlockRoot,
} from "@portfolio/ui/components/code-block";
import { ChevronDownIcon } from "lucide-react";
import { useId, useState } from "react";
import type { CSSProperties } from "react";

import type { HighlightedCode } from "@/lib/component-code";

// As on ui.shadcn.com: an example's code scrolls; a full source collapses,
// then scrolls once expanded; everything else shows in full.
const SCROLLABLE = "scroll-fade-y max-h-72";
const COLLAPSED = "scroll-fade-y max-h-64 overflow-y-hidden";
const EXPANDED = "scroll-fade-y max-h-96";

const contentClassName = ({
  collapsible,
  expanded,
  scrollable,
}: {
  collapsible: boolean;
  expanded: boolean;
  scrollable: boolean;
}) => {
  if (collapsible) {
    return expanded ? EXPANDED : COLLAPSED;
  }
  return scrollable ? SCROLLABLE : undefined;
};

interface CodeBlockProps {
  /** Highlighted at build time by plugins/component-code.ts. */
  code: HighlightedCode;
  /** Shows the first lines with a "Show more" button. */
  collapsible?: boolean;
  /** Caps the height and scrolls the rest. */
  scrollable?: boolean;
  title?: string;
}

export const CodeBlock = ({
  code,
  collapsible = false,
  scrollable = false,
  title,
}: CodeBlockProps) => {
  const id = useId();
  const [expanded, setExpanded] = useState(false);

  const actions = (
    <CodeBlockActions>
      <CodeBlockCopyButton value={code.code} />
    </CodeBlockActions>
  );

  return (
    <CodeBlockRoot>
      {title === undefined ? (
        actions
      ) : (
        <CodeBlockHeader>
          <CodeBlockTitle>{title}</CodeBlockTitle>
          {actions}
        </CodeBlockHeader>
      )}
      <CodeBlockContent
        // oxlint-disable-next-line shadcn/no-restyle, shadcn/require-static-classes -- the shadcn docs cap and expand a block this way
        className={contentClassName({ collapsible, expanded, scrollable })}
        id={id}
      >
        {code.lines.map((line, lineIndex) => (
          // oxlint-disable-next-line react/no-array-index-key -- the lines of static code never reorder
          <CodeBlockLine key={lineIndex}>
            {line.map(([content, light, dark], tokenIndex) => (
              <span
                className="text-(--shiki-light) dark:text-(--shiki-dark)"
                // oxlint-disable-next-line react/no-array-index-key -- the tokens of static code never reorder
                key={tokenIndex}
                style={
                  {
                    "--shiki-dark": dark,
                    "--shiki-light": light,
                  } as CSSProperties
                }
              >
                {content}
              </span>
            ))}
          </CodeBlockLine>
        ))}
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
            <ChevronDownIcon className="transition-transform in-aria-expanded:rotate-180" />
            {expanded ? "Show less" : "Show more"}
          </Button>
        </CodeBlockFooter>
      )}
    </CodeBlockRoot>
  );
};
