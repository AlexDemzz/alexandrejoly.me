import { Text, TextLink } from "@portfolio/ui/components/text";

import type { Inline, Paragraph } from "@/content";
import { withOffsets } from "@/lib/text-offsets";

const inlineText = (inline: Inline) =>
  typeof inline === "string" ? inline : inline.text;

const InlineRun = ({ inline }: { inline: Inline }) =>
  typeof inline === "string" ? (
    inline
  ) : (
    <TextLink external={inline.href.startsWith("https://")} href={inline.href}>
      {inline.text}
    </TextLink>
  );

export const Prose = ({ paragraphs }: { paragraphs: Paragraph[] }) =>
  paragraphs.map((paragraph) => (
    <Text key={paragraph.map(inlineText).join("")}>
      {withOffsets(paragraph, (inline) => inlineText(inline).length).map(
        ({ offset, part }) => (
          <InlineRun inline={part} key={offset} />
        )
      )}
    </Text>
  ));
