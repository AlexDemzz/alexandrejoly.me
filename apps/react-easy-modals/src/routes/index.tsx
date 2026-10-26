import {
  CodeBlock,
  CodeBlockContent,
  CodeBlockHeader,
  CodeBlockLine,
  CodeBlockTitle,
} from "@portfolio/ui/components/code-block";
import {
  Item,
  ItemActions,
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
import {
  Text,
  TextLink,
  textLinkVariants,
} from "@portfolio/ui/components/text";
import { createFileRoute, Link } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import type { Root } from "hast";

import { GitHubIcon, NpmIcon } from "@/components/brand-icons";
import { CodeSnippet } from "@/components/code-snippet";
import { HastLine } from "@/components/hast";
import { Features } from "@/components/landing/features";
import { HeroDemo } from "@/components/landing/hero-demo";
import type { SnippetName } from "@/components/landing/snippets";
import { SiteFooter } from "@/components/site-footer";
import { SiteIdentity } from "@/components/site-identity";
import { getLandingCode } from "@/lib/landing-code";
import type { LandingCode } from "@/lib/landing-code";
import { pageHead } from "@/lib/seo";
import { GITHUB_URL, NPM_URL, SITE_DESCRIPTION, SITE_NAME } from "@/lib/site";
import { source } from "@/lib/source";

interface DocsEntry {
  group: string;
  title: string;
  description?: string;
  slug: string;
}

const getDocsIndex = createServerFn({ method: "GET" }).handler(() => {
  const entries: DocsEntry[] = [];
  let group = "";

  for (const node of source.getPageTree().children) {
    if (node.type === "separator") {
      group = String(node.name ?? "");
    } else if (node.type === "page") {
      const page = source.getNodePage(node);
      if (!page) {
        continue;
      }
      entries.push({
        group,
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
    <main className="mx-auto w-full max-w-180 px-6 py-12 sm:py-32 md:py-16">
      <Header />
      <div className="pt-10">
        <HeroDemo code={code.hero} />
      </div>
      <GetStarted code={code.snippets} />
      <Section>
        <SectionTitle>Features</SectionTitle>
        <SectionContent>
          <Features code={code.snippets} />
        </SectionContent>
      </Section>
      <Shadcn code={code} />
      <Docs />
      <SiteFooter />
    </main>
  );
};

const Header = () => (
  <header className="flex flex-col gap-5">
    <SiteIdentity linked={false} nameAs="h1" />
    <Text>
      A headless, zero-dependency modal stack for React. Open a modal like you
      call a function, and get its answer back.
    </Text>
    <Text>
      Start with{" "}
      <Link
        className={textLinkVariants()}
        params={{ _splat: "getting-started" }}
        to="/docs/$"
      >
        Getting started
      </Link>
      , or read the source on{" "}
      <TextLink external href={GITHUB_URL}>
        <GitHubIcon />
        GitHub
      </TextLink>{" "}
      and the package on{" "}
      <TextLink external href={NPM_URL}>
        <NpmIcon />
        npm
      </TextLink>
      .
    </Text>
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
        <ul className="flex flex-col">
          {entries.map((entry, index) => (
            <li key={entry.slug}>
              <Item
                render={<Link to="/docs/$" params={{ _splat: entry.slug }} />}
              >
                <ItemContent>
                  <ItemTitle>{entry.title}</ItemTitle>
                  {entry.description ? (
                    <ItemDescription>{entry.description}</ItemDescription>
                  ) : null}
                </ItemContent>
                <ItemActions className="hidden self-start sm:flex">
                  <Text>{entry.group}</Text>
                </ItemActions>
              </Item>
              {index < entries.length - 1 ? <ItemSeparator /> : null}
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
