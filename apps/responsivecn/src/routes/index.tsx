import { createFileRoute, Link } from "@tanstack/react-router";
import { FileCodeIcon, MonitorIcon, SmartphoneIcon } from "lucide-react";
import * as React from "react";

import { BaseUIIcon, RadixIcon, ReactAriaIcon } from "@/components/base-icons";
import {
  BREAKPOINT,
  DEFAULT_PAIR,
  DEFAULT_WIDTH,
  PAIRS,
  npxCommand,
  pairByDesktop,
} from "@/components/create/pairs";
import type { DesktopName } from "@/components/create/pairs";
import { Playground } from "@/components/create/playground";
import { GitHubIcon } from "@/components/github-icon";
import { InstallCommand } from "@/components/landing/install-command";
import { Mark } from "@/components/mark";
import { buttonVariants } from "@/components/ui/button";
import {
  CodeBlock,
  CodeBlockActions,
  CodeBlockContent,
  CodeBlockCopyButton,
  CodeBlockHeader,
  CodeBlockLine,
  CodeBlockTitle,
} from "@/components/ui/code-block";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useHighlightedCode } from "@/hooks/use-highlighted-code";
import { homeJsonLd, homeSeo, pageHead } from "@/lib/seo";
import { appName, githubUrl } from "@/lib/shared";
import { cn } from "@/lib/utils";

const BASE_UI_URL = "https://base-ui.com/react/overview/quick-start";
const RADIX_URL = "https://www.radix-ui.com/primitives";

const BASES = [
  {
    name: "Base UI",
    href: BASE_UI_URL,
    icon: BaseUIIcon,
    description: "shadcn’s default base. The mobile side is Base UI’s Drawer.",
  },
  {
    name: "Radix",
    href: RADIX_URL,
    icon: RadixIcon,
    description: "The mobile side is the Vaul Drawer that shadcn ships.",
  },
  {
    name: "React Aria",
    href: "https://react-spectrum.adobe.com/react-aria/",
    icon: ReactAriaIcon,
    description:
      "Not supported: its shadcn components have a different set of parts.",
  },
] as const;

// The width the Desktop toggle sets: the smallest common laptop viewport.
const DESKTOP_WIDTH = 1024;

const MIGRATION = `import {
  DialogDrawer,
  DialogDrawerContent,
  DialogDrawerTrigger,
} from "@/components/ui/dialog-drawer"

<DialogDrawer>
  <DialogDrawerTrigger>Edit profile</DialogDrawerTrigger>
  <DialogDrawerContent drawer={{ className: "max-h-[85svh]" }}>
    …
  </DialogDrawerContent>
</DialogDrawer>`;

const Home = () => {
  const [desktop, setDesktop] = React.useState<DesktopName>(
    DEFAULT_PAIR.desktop
  );
  const [width, setWidth] = React.useState(DEFAULT_WIDTH);
  const pair = pairByDesktop(desktop);

  return (
    <main className="flex flex-1 flex-col px-6 pt-12 pb-12 sm:pb-24">
      <header className="max-w-column mx-auto flex w-full flex-col">
        <div className="flex items-center justify-between">
          <Mark
            drawer={width < BREAKPOINT}
            className="text-foreground size-10"
          />
          <a
            href={githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="responsivecn on GitHub"
            className={buttonVariants({ variant: "ghost", size: "icon-lg" })}
          >
            <GitHubIcon />
          </a>
        </div>
        <div className="text-muted-foreground mt-6 text-xl leading-relaxed text-balance">
          <h1 className="text-foreground inline font-medium">{appName}</h1>{" "}
          makes shadcn/ui overlays responsive: a Dialog on desktop, a Drawer on
          a phone. Swap the import and keep every prop, on Base UI or Radix.
        </div>
        <Link
          to="/docs/$"
          params={{ _splat: "" }}
          className={buttonVariants({ size: "lg", className: "mt-5 w-fit" })}
        >
          Read the docs
        </Link>
        <InstallCommand command={npxCommand(pair.slug)} className="mt-4" />
      </header>

      <section
        aria-label="Playground"
        className="max-w-breakout mx-auto mt-8 w-full"
      >
        <Playground
          desktop={desktop}
          onDesktopChange={setDesktop}
          width={width}
          onWidthChange={setWidth}
          trailing={
            <ViewportToggle
              mobile={width < BREAKPOINT}
              onChange={(mobile) =>
                setWidth(mobile ? DEFAULT_WIDTH : DESKTOP_WIDTH)
              }
            />
          }
          className="bg-background bg-dot-grid h-[34rem] rounded-2xl border"
        />
      </section>

      <div className="max-w-column mx-auto mt-10 flex w-full flex-col">
        <Section title="Pairs">
          <ul>
            {PAIRS.map((item) => (
              <Row key={item.slug}>
                <Link
                  to="/docs/$"
                  params={{ _splat: item.slug }}
                  className="group/row flex flex-col"
                >
                  <RowTitle>
                    {item.desktop}
                    {item.mobile}
                  </RowTitle>
                  <span className="text-muted-foreground">
                    A {item.desktop} at 768px and up, a {item.mobile} below.
                  </span>
                </Link>
              </Row>
            ))}
          </ul>
        </Section>

        <Section title="Drop-in replacement">
          <p className="text-muted-foreground text-pretty">
            Change the import, rename the tags, and every prop of your{" "}
            <span className="text-foreground">Dialog</span> keeps working. Props
            both sides share reach the mobile side too; to change it alone, use{" "}
            <code className="text-foreground font-mono text-sm">drawer</code> or{" "}
            <code className="text-foreground font-mono text-sm">popover</code>.
          </p>
          <MigrationCode />
        </Section>

        <Section
          title={
            <>
              Works on{" "}
              <BaseLink href={BASE_UI_URL} icon={BaseUIIcon} name="Base UI" />{" "}
              and <BaseLink href={RADIX_URL} icon={RadixIcon} name="Radix" />
            </>
          }
        >
          <p className="text-muted-foreground mb-4 text-pretty">
            One file per pair, built on the shadcn components you already
            installed, so it takes their props and runs on their base.
          </p>
          <ul>
            {BASES.map((base) => (
              <Row key={base.name}>
                <a
                  href={base.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group/row flex flex-col"
                >
                  <RowTitle>
                    <base.icon className="me-2 inline-block size-4 align-[-0.125em]" />
                    {base.name}
                  </RowTitle>
                  <span className="text-muted-foreground text-pretty">
                    {base.description}
                  </span>
                </a>
              </Row>
            ))}
          </ul>
        </Section>
      </div>

      <footer className="max-w-column text-muted-foreground mx-auto mt-auto flex w-full flex-wrap gap-x-4 gap-y-1 pt-16 text-sm">
        <span>{appName}</span>
        <Link to="/docs/$" params={{ _splat: "" }} className="link-text">
          Docs
        </Link>
        <a
          href={githubUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="link-text"
        >
          GitHub
        </a>
      </footer>
    </main>
  );
};

const MigrationCode = () => {
  const lines = useHighlightedCode(MIGRATION, "tsx");
  return (
    <CodeBlock className="mt-4">
      <CodeBlockHeader>
        <CodeBlockTitle>
          <FileCodeIcon />
          edit-profile.tsx
        </CodeBlockTitle>
        <CodeBlockActions>
          <CodeBlockCopyButton value={MIGRATION} />
        </CodeBlockActions>
      </CodeBlockHeader>
      <CodeBlockContent>
        {lines.map((line, index) => (
          <CodeBlockLine key={index}>{line}</CodeBlockLine>
        ))}
      </CodeBlockContent>
    </CodeBlock>
  );
};

const BaseLink = ({
  href,
  icon: Icon,
  name,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  name: string;
}) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="link-text text-foreground"
  >
    <Icon className="me-1 inline-block size-[1em] align-[-0.125em]" />
    {name}
  </a>
);

const ViewportToggle = ({
  mobile,
  onChange,
}: {
  mobile: boolean;
  onChange: (mobile: boolean) => void;
}) => (
  <ToggleGroup
    aria-label="Viewport"
    value={[mobile ? "mobile" : "desktop"]}
    onValueChange={([next]) => {
      if (next === "desktop" || next === "mobile") {
        onChange(next === "mobile");
      }
    }}
    variant="outline"
    size="sm"
    spacing={0}
    className="ms-auto"
  >
    <ToggleGroupItem value="desktop" aria-label="Desktop, 768px and up">
      <MonitorIcon />
    </ToggleGroupItem>
    <ToggleGroupItem value="mobile" aria-label="Mobile, below 768px">
      <SmartphoneIcon />
    </ToggleGroupItem>
  </ToggleGroup>
);

const Section = ({
  title,
  children,
}: {
  title: React.ReactNode;
  children: React.ReactNode;
}) => {
  const id = React.useId();
  return (
    <section aria-labelledby={id} className="py-10">
      <h2 id={id} className="text-muted-foreground mb-4">
        {title}
      </h2>
      {children}
    </section>
  );
};

const Row = ({ children }: { children: React.ReactNode }) => (
  <li className="border-b py-3.5 leading-relaxed first:pt-0 last:border-b-0 last:pb-0">
    {children}
  </li>
);

const RowTitle = ({ children }: { children: React.ReactNode }) => (
  <span
    className={cn(
      "font-book text-foreground w-fit underline decoration-transparent underline-offset-3 transition-colors duration-200 ease-out",
      "group-focus-visible/row:decoration-underline can-hover:group-hover/row:decoration-underline"
    )}
  >
    {children}
  </span>
);

export const Route = createFileRoute("/")({
  component: Home,
  head: () => pageHead({ ...homeSeo, jsonLd: homeJsonLd() }),
});
