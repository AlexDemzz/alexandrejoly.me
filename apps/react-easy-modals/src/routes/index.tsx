import { createFileRoute, Link } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import type { Root } from "hast";

import { GitHubIcon, NpmIcon } from "@/components/brand-icons";
import { CodeBlock } from "@/components/code-block";
import { HastLine } from "@/components/hast";
import { Features } from "@/components/landing/features";
import { HeroDemo } from "@/components/landing/hero-demo";
import type { SnippetName } from "@/components/landing/snippets";
import { SiteFooter } from "@/components/site-footer";
import { SiteIdentity } from "@/components/site-identity";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemSeparator,
  ItemTitle,
} from "@/components/ui/item";
import { Section, SectionContent, SectionTitle } from "@/components/ui/section";
import { Text, TextLink } from "@/components/ui/text";
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
    <SiteIdentity
      className="mb-1"
      linked={false}
      nameAs="h1"
      tagline="Modals you can await."
    />
    <Text>
      A headless, zero-dependency modal stack for React. Open a modal like you
      call a function, and get its answer back.
    </Text>
    <Text>
      Start with{" "}
      <TextLink
        render={<Link to="/docs/$" params={{ _splat: "getting-started" }} />}
      >
        Getting started
      </TextLink>
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
            <CodeBlock
              action={step.copy ? undefined : null}
              hast={code[step.code]}
            />
          </li>
        ))}
      </ol>
    </SectionContent>
  </Section>
);

// Removed lines stay highlighted but recede; the markers carry the diff.
const DiffLine = ({
  line,
  kind,
}: {
  line: Root;
  kind: "removed" | "added";
}) => {
  const removed = kind === "removed";
  return (
    <span className="block">
      <span aria-hidden="true" className="text-faint-foreground select-none">
        {removed ? "- " : "+ "}
      </span>
      <span className="sr-only">{removed ? "Removed: " : "Added: "}</span>
      <span className={removed ? "opacity-55" : undefined}>
        <HastLine tree={line} />
      </span>
    </span>
  );
};

const Shadcn = ({ code }: { code: LandingCode }) => (
  <Section>
    <SectionTitle>shadcn/ui</SectionTitle>
    <SectionContent>
      <div className="flex flex-col items-start gap-4">
        <Text>
          Add a Modal built on your Base UI Dialog, from the @alexandrejoly
          registry.
        </Text>
        <CodeBlock className="w-full" hast={code.snippets.shadcn} />
        <CodeBlock className="w-full" title="settings-page.tsx" action={null}>
          <pre className="shiki">
            <code>
              {code.diff.removed.map((line, index) => (
                <DiffLine line={line} key={`removed-${index}`} kind="removed" />
              ))}
              {code.diff.added.map((line, index) => (
                <DiffLine line={line} key={`added-${index}`} kind="added" />
              ))}
            </code>
          </pre>
        </CodeBlock>
        <TextLink
          render={<Link to="/docs/$" params={{ _splat: "registry" }} />}
        >
          Read the registry guide
        </TextLink>
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
        <ItemGroup>
          {entries.map((entry) => (
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
                  {entry.group}
                </ItemActions>
                <ItemSeparator />
              </Item>
            </li>
          ))}
        </ItemGroup>
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
