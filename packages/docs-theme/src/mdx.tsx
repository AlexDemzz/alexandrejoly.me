import { HeadingAnchor } from "@portfolio/ui/components/heading-anchor";
import { cn } from "@portfolio/ui/lib/utils";
import { Step, Steps } from "fumadocs-ui/components/steps";
import { Tab, Tabs } from "fumadocs-ui/components/tabs";
import defaultMdxComponents from "fumadocs-ui/mdx";
import type { MDXComponents } from "mdx/types";
import type { ComponentProps } from "react";

type HeadingTag = "h2" | "h3" | "h4" | "h5" | "h6";

// The design system's heading anchor in place of Fumadocs' copy-link button.
// `not-prose` keeps the prose link colour and underline off the title.
const DocsHeading = ({
  as: Tag,
  children,
  className,
  id,
  ...props
}: ComponentProps<HeadingTag> & { as: HeadingTag }) => {
  if (!id) {
    return (
      <Tag className={className} {...props}>
        {children}
      </Tag>
    );
  }
  return (
    <Tag className={cn("scroll-m-6", className)} id={id} {...props}>
      {/* oxlint-disable-next-line shadcn/no-unknown-classes -- Fumadocs' prose opt-out marker, not a utility */}
      <span className="not-prose">
        <HeadingAnchor id={id}>{children}</HeadingAnchor>
      </span>
    </Tag>
  );
};

// The MDX components every docs site renders; a site spreads its own demos
// after these.
const docsMdxComponents = {
  ...defaultMdxComponents,
  h2: (props: ComponentProps<"h2">) => <DocsHeading as="h2" {...props} />,
  h3: (props: ComponentProps<"h3">) => <DocsHeading as="h3" {...props} />,
  h4: (props: ComponentProps<"h4">) => <DocsHeading as="h4" {...props} />,
  h5: (props: ComponentProps<"h5">) => <DocsHeading as="h5" {...props} />,
  h6: (props: ComponentProps<"h6">) => <DocsHeading as="h6" {...props} />,
  Step,
  Steps,
  Tab,
  Tabs,
} satisfies MDXComponents;

export { docsMdxComponents };
