import { Text, TextLink } from "@portfolio/ui/components/text";

import type { Inline, Paragraph } from "@/content";

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
    <Text
      key={paragraph
        .map((inline) => (typeof inline === "string" ? inline : inline.text))
        .join("")}
    >
      {paragraph.map((inline, index) => (
        // Runs never reorder, and the same text can repeat within a paragraph.
        // oxlint-disable-next-line react/no-array-index-key
        <InlineRun inline={inline} key={index} />
      ))}
    </Text>
  ));
