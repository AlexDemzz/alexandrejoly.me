import { Link } from "@tanstack/react-router";
import type { ComponentType } from "react";

import { CodeBlock } from "@/components/code-block";
import { Heading } from "@/components/ui/heading";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Text, TextLink } from "@/components/ui/text";
import type { LandingCode } from "@/lib/landing-code";

import {
  GuardDemo,
  LazyDemo,
  NestedDemo,
  StackDemo,
  TransitionDemo,
} from "./demos";
import type { SnippetName } from "./snippets";

interface Feature {
  /** Also names its snippet. */
  id: SnippetName;
  title: string;
  summary: string;
  doc: { label: string; slug: string };
  Demo: ComponentType;
}

const FEATURES: Feature[] = [
  {
    id: "stack",
    title: "A modal stack",
    summary: "A new modal hides the one below it until it closes.",
    doc: { label: "How the stack works", slug: "how-it-works" },
    Demo: StackDemo,
  },
  {
    id: "nested",
    title: "Nested modals",
    summary: "Open a modal inside a modal, and close any level of the chain.",
    doc: { label: "Nested modals", slug: "nested" },
    Demo: NestedDemo,
  },
  {
    id: "guards",
    title: "Close guards",
    summary: "Keep a modal open until the user is ready to leave.",
    doc: { label: "useBeforeClose", slug: "use-before-close" },
    Demo: GuardDemo,
  },
  {
    id: "transitions",
    title: "Exit animations",
    summary: "Play the exit animation first, then unmount.",
    doc: { label: "Transitions", slug: "transitions" },
    Demo: TransitionDemo,
  },
  {
    id: "lazy",
    title: "Lazy loading",
    summary: "Load a modal’s code only when it opens.",
    doc: { label: "Lazy loading", slug: "lazy-loading" },
    Demo: LazyDemo,
  },
];

export const Features = ({ code }: { code: LandingCode["snippets"] }) => (
  <div className="flex flex-col gap-12">
    {FEATURES.map(({ id, title, summary, doc, Demo }) => (
      <article
        key={id}
        aria-labelledby={`feature-${id}`}
        className="flex flex-col items-start gap-4"
      >
        <div>
          <Heading id={`feature-${id}`} level={3}>
            {title}
          </Heading>
          <Text>{summary}</Text>
        </div>
        <Tabs defaultValue="preview" className="w-full">
          <TabsList aria-label={`${title} example`}>
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="code">Code</TabsTrigger>
          </TabsList>
          {/* The docs demos carry their own vertical margin. */}
          <TabsContent value="preview" className="[&>[data-slot=preview]]:my-0">
            <Demo />
          </TabsContent>
          <TabsContent value="code">
            <CodeBlock hast={code[id]} />
          </TabsContent>
        </Tabs>
        <TextLink render={<Link to="/docs/$" params={{ _splat: doc.slug }} />}>
          {doc.label}
        </TextLink>
      </article>
    ))}
  </div>
);
