import { buttonVariants } from "@portfolio/ui/components/button";
import { Code, codeVariants } from "@portfolio/ui/components/code";
import { Text } from "@portfolio/ui/components/text";
import { cn } from "@portfolio/ui/lib/utils";
import { createFileRoute } from "@tanstack/react-router";
import type { ReactNode } from "react";

import { Film } from "@/components/film";
import { GitHubIcon } from "@/components/github-icon";
import { LogoMark } from "@/components/logo";
import { DOWNLOAD_URL, GITHUB_URL, SITE_NAME, SITE_URL } from "@/lib/site";

// The library landings' header (apps/responsivecn, apps/react-easy-modals),
// the film, then a letter after the copper page: the hook, the problem, how
// it works, why it can be trusted, then the download. Every claim is backed
// by Carbon's v1 spec and UI mock (carbon/.scratch/carbon-v1).
const Home = () => (
  <main className="flex flex-1 flex-col px-6 pt-12 pb-12 sm:pb-24">
    <Header />
    <div className="max-w-breakout mx-auto mt-8 w-full">
      <Film />
    </div>
    <Column>
      <Text>
        Halfway through a call, you think “I should write this down” and keep
        listening instead. By the end, your notes are half a sentence.{" "}
        <Emphasis>
          What was decided, who said they’d do what, the number someone
          mentioned
        </Emphasis>
        : gone, unless you let a note taker bot into the call.
      </Text>
      <Text>
        Carbon writes it all down for you, with no one else in the call.
      </Text>
      <Text>
        When Zoom, Google Meet, Teams or any other meeting app starts using your
        microphone, Carbon starts transcribing and the dot in its icon turns
        red. When the call ends, the meeting opens on its transcript: every
        word, with who said it and when.
      </Text>
      <Text>
        Each meeting is a plain Markdown file in <Code>~/Documents/Carbon</Code>
        , so <Emphasis>any AI agent can read it</Emphasis>. Right-click a
        meeting, press <Key>⇧</Key> <Key>⌘</Key> <Key>C</Key> to copy its path,
        and paste it into Claude Code, Codex or whatever you use.
      </Text>
      <Text>
        Calls are private, and Carbon keeps them that way: no account to sign in
        to, no bot in the call and nothing uploaded. Carbon transcribes with
        Apple’s on-device speech recognition and deletes the audio once the
        transcript is written.{" "}
        <Emphasis>Your calls never leave your Mac.</Emphasis>
      </Text>
      <DownloadButton />
      <p className="text-muted-foreground text-sm">
        Carbon is free. Drag it to Applications and it shows up in your menu
        bar. It updates itself.
      </p>
      <p className="text-muted-foreground text-sm">
        macOS 26 or later on Apple silicon. Carbon asks for microphone, system
        audio recording and calendar access, to notice your calls and name them
        after your events.
      </p>
    </Column>
  </main>
);

const Header = () => (
  <header className="max-w-column mx-auto flex w-full flex-col">
    <div className="flex items-center justify-between">
      <LogoMark className="text-foreground size-10" />
      <a
        className={buttonVariants({ variant: "outline" })}
        href={GITHUB_URL}
        rel="noopener noreferrer"
        target="_blank"
      >
        <GitHubIcon data-icon="inline-start" />
        GitHub
      </a>
    </div>
    <div className="text-muted-foreground mt-6 text-xl leading-relaxed text-balance">
      <h1 className="text-foreground inline font-medium">{SITE_NAME}</h1> is a
      lightweight, native macOS app that turns every meeting into a Markdown
      file on your Mac, ready for any AI agent. No sign-in, no bot, no cloud.
    </div>
    <DownloadButton className="mt-5" />
  </header>
);

const DownloadButton = ({ className }: { className?: string }) => (
  <a
    className={buttonVariants({
      className: cn("w-fit", className),
      size: "lg",
    })}
    href={DOWNLOAD_URL}
  >
    Download Carbon for Mac
  </a>
);

const Column = ({ children }: { children: ReactNode }) => (
  <div className="max-w-column mx-auto mt-10 flex w-full flex-col gap-5">
    {children}
  </div>
);

const Emphasis = ({ children }: { children: ReactNode }) => (
  <span className="text-foreground">{children}</span>
);

const Key = ({ children }: { children: string }) => (
  <kbd className={codeVariants()}>{children}</kbd>
);

export const Route = createFileRoute("/")({
  component: Home,
  head: () => ({
    links: [{ href: `${SITE_URL}/`, rel: "canonical" }],
    meta: [{ content: `${SITE_URL}/`, property: "og:url" }],
  }),
});
