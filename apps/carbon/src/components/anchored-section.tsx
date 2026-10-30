import { HeadingAnchor } from "@portfolio/ui/components/heading-anchor";
import {
  Section,
  SectionContent,
  SectionTitle,
} from "@portfolio/ui/components/section";
import type { ComponentProps, ReactNode } from "react";

/** A `stacked` section whose title links to its own `#id`. */
export const AnchoredSection = ({
  children,
  id,
  spacing,
  title,
}: {
  spacing?: ComponentProps<typeof Section>["spacing"];
  children: ReactNode;
  id: string;
  title: string;
}) => (
  <Section spacing={spacing} variant="stacked">
    <SectionTitle className="scroll-mt-6" id={id}>
      <HeadingAnchor id={id}>{title}</HeadingAnchor>
    </SectionTitle>
    <SectionContent className="flex flex-col gap-5">{children}</SectionContent>
  </Section>
);
