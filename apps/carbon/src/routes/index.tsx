import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@portfolio/ui/components/breadcrumb";
import { buttonVariants } from "@portfolio/ui/components/button";
import { Code, codeVariants } from "@portfolio/ui/components/code";
import { Text } from "@portfolio/ui/components/text";
import { createFileRoute } from "@tanstack/react-router";
import type { ReactNode } from "react";

import { Film } from "@/components/film";
import { AUTHOR_URL, DOWNLOAD_URL } from "@/lib/site";

// A letter after the copper page: the hook as the h1, the problem, the film,
// what Carbon is, how it works, why it can be trusted, then the download.
// Every claim is backed by Carbon's v1 product design and UI mock
// (carbon/.scratch/carbon-v1/issues/01 and 12).
const Home = () => (
  <main className="flex flex-1 flex-col gap-5 px-6 py-12 sm:py-24">
    <Column>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href={AUTHOR_URL}>Alexandre Joly</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator>/</BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbPage>Carbon</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <h1 className="text-foreground mt-7 text-xl leading-relaxed text-balance">
        You know how you’re on a call, thinking “I should write this down,” but
        you don’t want to stop listening?
      </h1>
      <Text>
        Then the call ends and your notes are half a sentence.{" "}
        <Emphasis>
          What was decided, who said they’d do what, the number someone
          mentioned
        </Emphasis>
        : gone, unless you let a note taker bot into the call.
      </Text>
      <Text>I wanted the transcript without the bot, so I built Carbon.</Text>
    </Column>

    <div className="max-w-breakout mx-auto my-3 w-full">
      <Film />
    </div>

    <Column>
      <p className="text-foreground font-medium text-balance">
        Carbon is a lightweight, native macOS app that sits in your menu bar and
        turns every meeting into a Markdown file on your Mac.
      </p>
      <Text>
        When Zoom, Google Meet, Teams or any other meeting app starts using your
        microphone, Carbon starts transcribing and the dot in its icon turns
        red. When the call ends, the meeting opens on a summary, key points then
        next steps, with the full transcript below it.
      </Text>
      <Text>
        Each meeting is a plain Markdown file in <Code>~/Documents/Carbon</Code>
        , so <Emphasis>any AI agent can read it</Emphasis>. Right-click a
        meeting, press <Key>⇧</Key> <Key>⌘</Key> <Key>C</Key> to copy its path,
        and paste it into Claude Code, Codex or whatever you use.
      </Text>
      <Text>
        I wanted something I could trust with every call. So there’s no account
        to sign in to, no bot in the call and nothing uploaded. Carbon
        transcribes with Apple’s on-device speech recognition and deletes the
        audio once the transcript is written.{" "}
        <Emphasis>Everything stays on your Mac.</Emphasis>
      </Text>
      <Text>If this feels like something you’d use, it’s free.</Text>
      <a
        className={buttonVariants({ className: "w-fit", size: "lg" })}
        href={DOWNLOAD_URL}
      >
        Download Carbon for Mac
      </a>
      <p className="text-muted-foreground text-sm">
        Drag it to Applications and it shows up in your menu bar. It updates
        itself.
      </p>
      <p className="text-muted-foreground text-sm">
        macOS 26 or later. Summaries need Apple Intelligence. Carbon asks for
        microphone, system audio recording and calendar access, to notice your
        calls and name them after your events.
      </p>
    </Column>
  </main>
);

const Column = ({ children }: { children: ReactNode }) => (
  <div className="max-w-column mx-auto flex w-full flex-col gap-5">
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
});
