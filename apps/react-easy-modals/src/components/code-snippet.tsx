import {
  CodeBlock,
  CodeBlockActions,
  CodeBlockContent,
  CodeBlockCopyButton,
  CodeBlockLine,
} from "@portfolio/ui/components/code-block";

import { HastLine } from "@/components/hast";
import type { HighlightedSnippet } from "@/lib/landing-code";

export const CodeSnippet = ({
  snippet,
  copyable = true,
}: {
  snippet: HighlightedSnippet;
  copyable?: boolean;
}) => (
  <CodeBlock>
    {copyable ? (
      <CodeBlockActions>
        <CodeBlockCopyButton value={snippet.code} />
      </CodeBlockActions>
    ) : null}
    <CodeBlockContent>
      {snippet.lines.map((line, index) => (
        <CodeBlockLine key={index}>
          <HastLine tree={line} />
        </CodeBlockLine>
      ))}
    </CodeBlockContent>
  </CodeBlock>
);
