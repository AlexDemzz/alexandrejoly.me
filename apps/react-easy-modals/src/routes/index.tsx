import { buttonVariants } from "@portfolio/ui/components/button";
import {
  CodeBlock,
  CodeBlockContent,
  CodeBlockHeader,
  CodeBlockLine,
  CodeBlockTitle,
} from "@portfolio/ui/components/code-block";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemSeparator,
  ItemTitle,
} from "@portfolio/ui/components/item";
import {
  Section,
  SectionContent,
  SectionTitle,
} from "@portfolio/ui/components/section";
import { Text, textLinkVariants } from "@portfolio/ui/components/text";
import { createFileRoute, Link } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import type { Root } from "hast";

import { GitHubIcon } from "@/components/brand-icons";
import { CodeSnippet } from "@/components/code-snippet";
import { HastLine } from "@/components/hast";
import { Features } from "@/components/landing/features";
import { HeroDemo } from "@/components/landing/hero-demo";
import type { SnippetName } from "@/components/landing/snippets";
import { LogoMark } from "@/components/logo";
import { SiteFooter } from "@/components/site-footer";
import { getLandingCode } from "@/lib/landing-code";
import type { LandingCode } from "@/lib/landing-code";
import { pageHead } from "@/lib/seo";
import { GITHUB_URL, SITE_DESCRIPTION, SITE_NAME } from "@/lib/site";
import { source } from "@/lib/source";

interface DocsEntry {
  title: string;
  description?: string;
  slug: string;
}

const getDocsIndex = createServerFn({ method: "GET" }).handler(() => {
  const entries: DocsEntry[] = [];

  for (const node of source.getPageTree().children) {
    if (node.type === "page") {
      const page = source.getNodePage(node);
      if (!page) {
        continue;
      }
      entries.push({
        title: page.data.title,
        description: page.data.description,
        slug: page.slugs.join("/"),
      });
    }
  }

  return entries;
});

const Home = () => {
  const { code } = Route.useLoaderData();

  return (
    <main className="flex flex-1 flex-col px-6 pt-12 pb-12 sm:pb-24">
      <Header />
      <div className="max-w-breakout mx-auto mt-8 w-full">
        <HeroDemo code={code.hero} />
      </div>
      <div className="max-w-column mx-auto mt-10 flex w-full flex-col">
        <GetStarted code={code.snippets} />
        <Section>
          <SectionTitle>Features</SectionTitle>
          <SectionContent>
            <Features code={code.snippets} />
          </SectionContent>
        </Section>
        <Shadcn code={code} />
        <Docs />
      </div>
      <div className="max-w-column mx-auto mt-auto w-full pt-6">
        <SiteFooter />
      </div>
    </main>
  );
};

const Header = () => (
  <header className="max-w-column mx-auto flex w-full flex-col">
    <div className="flex items-center justify-between">
      <LogoMark className="text-foreground size-10" />
      <a
        href={GITHUB_URL}
        target="_blank"
        rel="noopener noreferrer"
        className={buttonVariants({ variant: "outline" })}
      >
        <GitHubIcon data-icon="inline-start" />
        GitHub
      </a>
    </div>
    <div className="text-muted-foreground mt-6 text-xl leading-relaxed text-balance">
      <h1 className="text-foreground inline font-medium">{SITE_NAME}</h1> is a
      headless, zero-dependency modal stack for React. Open a modal like you
      call a function, and get its answer back.
    </div>
    <Link
      to="/docs"
      className={buttonVariants({ size: "lg", className: "mt-5 w-fit" })}
    >
      Read the docs
    </Link>
  </header>
);

const STEPS: {
  title: string;
  body: string;
  code: SnippetName;
  copy: boolean;
}[] = [
  {
    title: "Install",
    body: "One package, no dependencies besides React.",
    code: "install",
    copy: true,
  },
  {
    title: "Add the provider",
    body: "It renders the stack at the root of your app.",
    code: "provider",
    copy: false,
  },
  {
    title: "Open a modal",
    body: "Any component works. Its close value is the result.",
    code: "open",
    copy: false,
  },
];

const GetStarted = ({ code }: { code: LandingCode["snippets"] }) => (
  <Section>
    <SectionTitle>Get started</SectionTitle>
    <SectionContent>
      <ol className="flex flex-col gap-8">
        {STEPS.map((step) => (
          <li key={step.title} className="flex flex-col gap-3">
            <Text>
              <span className="font-book text-foreground">{step.title}.</span>{" "}
              {step.body}
            </Text>
            <CodeSnippet copyable={step.copy} snippet={code[step.code]} />
          </li>
        ))}
      </ol>
    </SectionContent>
  </Section>
);

// The line variants draw the markers; screen readers get them as words.
const DiffLine = ({
  line,
  kind,
}: {
  line: Root;
  kind: "removed" | "added";
}) => (
  <CodeBlockLine variant={kind}>
    <span className="sr-only">
      {kind === "removed" ? "Removed: " : "Added: "}
    </span>
    <HastLine tree={line} />
  </CodeBlockLine>
);

const Shadcn = ({ code }: { code: LandingCode }) => (
  <Section>
    <SectionTitle>shadcn/ui</SectionTitle>
    <SectionContent>
      <div className="flex flex-col items-start gap-4">
        <Text>
          Add a Modal built on your Base UI Dialog, from the @alexandrejoly
          registry.
        </Text>
        <CodeSnippet snippet={code.snippets.shadcn} />
        <CodeBlock>
          <CodeBlockHeader>
            <CodeBlockTitle>settings-page.tsx</CodeBlockTitle>
          </CodeBlockHeader>
          <CodeBlockContent>
            {code.diff.removed.map((line, index) => (
              <DiffLine line={line} key={`removed-${index}`} kind="removed" />
            ))}
            {code.diff.added.map((line, index) => (
              <DiffLine line={line} key={`added-${index}`} kind="added" />
            ))}
          </CodeBlockContent>
        </CodeBlock>
        <Link
          className={textLinkVariants()}
          params={{ _splat: "registry" }}
          to="/docs/$"
        >
          Read the registry guide
        </Link>
      </div>
    </SectionContent>
  </Section>
);

const Docs = () => {
  const entries = Route.useLoaderData().docs;

  return (
    <Section>
      <SectionTitle>Docs</SectionTitle>
      <SectionContent>
        <ul>
          {entries.map((entry, index) => (
            <li key={entry.slug}>
              {index > 0 && <ItemSeparator />}
              <Item
                variant="underline"
                render={<Link to="/docs/$" params={{ _splat: entry.slug }} />}
              >
                <ItemContent>
                  <ItemTitle>{entry.title}</ItemTitle>
                  {entry.description ? (
                    <ItemDescription>{entry.description}</ItemDescription>
                  ) : null}
                </ItemContent>
              </Item>
            </li>
          ))}
        </ul>
      </SectionContent>
    </Section>
  );
};

export const Route = createFileRoute("/")({
  head: () => {
    const head = pageHead({ path: "/", description: SITE_DESCRIPTION });
    return {
      ...head,
      meta: [
        ...head.meta,
        { title: `${SITE_NAME}: modals you can await` },
        { property: "og:title", content: `${SITE_NAME}: modals you can await` },
      ],
    };
  },
  loader: async () => {
    const [docs, code] = await Promise.all([getDocsIndex(), getLandingCode()]);
    return { docs, code };
  },
  component: Home,
});
