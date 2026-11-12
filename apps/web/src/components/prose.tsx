import { Text, TextLink } from "@portfolio/ui/components/text";

import { InlineCode } from "@/components/docs/inline-code";
import type { Inline, Paragraph } from "@/content";
import { withOffsets } from "@/lib/text-offsets";

const inlineText = (inline: Inline) =>
  typeof inline === "string" ? inline : inline.text;

export const paragraphKey = (paragraph: Paragraph) =>
  paragraph.map(inlineText).join("");

const InlineRun = ({ inline }: { inline: Inline }) =>
  typeof inline === "string" ? (
    <InlineCode>{inline}</InlineCode>
  ) : (
    <TextLink external={inline.href.startsWith("https://")} href={inline.href}>
      {inline.text}
    </TextLink>
  );

/** A paragraph's runs: text with its `backtick` spans as code, and links. */
export const ProseRuns = ({ paragraph }: { paragraph: Paragraph }) =>
  withOffsets(paragraph, (inline) => inlineText(inline).length).map(
    ({ offset, part }) => <InlineRun inline={part} key={offset} />
  );

export const Prose = ({ paragraphs }: { paragraphs: Paragraph[] }) =>
  paragraphs.map((paragraph) => (
    <Text key={paragraphKey(paragraph)}>
      <ProseRuns paragraph={paragraph} />
    </Text>
  ));
