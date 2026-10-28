import { CaretDownIcon } from "@phosphor-icons/react";
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
import { useId, useState } from "react";
import type { CSSProperties } from "react";

import type { HighlightedCode, HighlightedToken } from "@/lib/component-code";
import { withOffsets } from "@/lib/text-offsets";

const tokenLength = ([content]: HighlightedToken) => content.length;
const lineLength = (line: HighlightedToken[]) =>
  line.reduce((length, token) => length + tokenLength(token), 0);

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
        {withOffsets(code.lines, lineLength, 1).map(
          ({ offset, part: line }) => (
            <CodeBlockLine key={offset}>
              {withOffsets(line, tokenLength).map(
                ({ offset: tokenOffset, part: [content, light, dark] }) => (
                  <span
                    className="text-(--shiki-light) dark:text-(--shiki-dark)"
                    key={tokenOffset}
                    style={
                      {
                        "--shiki-dark": dark,
                        "--shiki-light": light,
                      } as CSSProperties
                    }
                  >
                    {content}
                  </span>
                )
              )}
            </CodeBlockLine>
          )
        )}
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
    </CodeBlockRoot>
  );
};
