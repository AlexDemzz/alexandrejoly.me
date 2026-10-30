import { buttonVariants } from "@portfolio/ui/components/button";
import {
  CodeBlock,
  CodeBlockContent,
  CodeBlockHeader,
  CodeBlockTitle,
} from "@portfolio/ui/components/code-block";
import { Kbd, KbdGroup } from "@portfolio/ui/components/kbd";
import {
  Text,
  TextLink,
  textLinkVariants,
} from "@portfolio/ui/components/text";
import { cn } from "@portfolio/ui/lib/utils";
import { createFileRoute, Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

import { AnchoredSection } from "@/components/anchored-section";
import { Emphasis } from "@/components/emphasis";
import { Film } from "@/components/film";
import { GitHubIcon } from "@/components/github-icon";
import { LogoMark } from "@/components/logo";
import { SiteFooter } from "@/components/site-footer";
import {
  DOWNLOAD_URL,
  GITHUB_URL,
  LICENSE_URL,
  SITE_NAME,
  SITE_URL,
} from "@/lib/site";

// Every claim is backed by Carbon's v1 spec (carbon/.scratch/carbon-v1) and
// its Swift sources; never promise more than they do.
const Home = () => (
  <main className="flex flex-1 flex-col px-6 pt-12 pb-12 sm:pb-24">
    <Header />
    <div className="max-w-breakout mx-auto mt-16 w-full">
      <Film />
    </div>
    <div className="max-w-column mx-auto mt-16 flex w-full flex-col gap-12">
      <AnchoredSection
        spacing="none"
        id="starts"
        title="It starts with your call"
      >
        <Text>
          When Zoom, Google Meet, Teams or any other meeting app starts using
          your microphone, Carbon starts transcribing.{" "}
          <Emphasis>The dot in its menu bar icon stays red</Emphasis> for as
          long as it does. Click Stop on its notification and nothing is kept.
        </Text>
      </AnchoredSection>
      <AnchoredSection
        spacing="none"
        id="speakers"
        title="It knows who said what"
      >
        <Text>
          Your voice is labelled Me, the others Speaker A, B and C. Your
          calendar event names the meeting and its participants, and in a 1:1
          the other person’s lines carry their name.{" "}
          <Emphasis>Name a voice once and Carbon recognizes it</Emphasis> in
          your next meetings. When it isn’t sure, it doesn’t guess.
        </Text>
      </AnchoredSection>
      <AnchoredSection
        spacing="none"
        id="files"
        title="It writes a file your agent can read"
      >
        <Text>
          Each meeting is a plain Markdown file, one line per turn with the
          speaker and the time, so{" "}
          <Emphasis>a search hit always says who and when</Emphasis>. Press{" "}
          <KbdGroup>
            <Kbd>⇧</Kbd>
            <Kbd>⌘</Kbd>
            <Kbd>C</Kbd>
          </KbdGroup>{" "}
          on a meeting to copy its path for Claude Code, Codex or any agent.
        </Text>
        <SampleFile />
      </AnchoredSection>
      <AnchoredSection
        spacing="none"
        id="private"
        title="It never leaves your Mac"
      >
        <Text>
          Carbon transcribes with Apple’s on-device speech recognition and
          deletes the audio once the transcript is written.{" "}
          <Emphasis>No account, no analytics, no server.</Emphasis>{" "}
          <Link className={textLinkVariants()} to="/privacy">
            Read the privacy details
          </Link>
          .
        </Text>
      </AnchoredSection>
      <Faq />
      <ClosingCall />
    </div>
    <SiteFooter />
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

const Faq = () => (
  <AnchoredSection spacing="none" id="faq" title="FAQ">
    <div className="flex flex-col">
      {FAQ.map((item) => (
        <details
          className="group border-border border-b py-3.5 first:pt-0 last:border-b-0 last:pb-0"
          key={item.question}
        >
          <summary className="text-foreground font-book flex cursor-pointer list-none items-center justify-between gap-4 [&::-webkit-details-marker]:hidden">
            {item.question}
            <span
              aria-hidden="true"
              className="text-muted-foreground transition-transform duration-200 ease-out group-open:rotate-45"
            >
              +
            </span>
          </summary>
          <Text className="mt-2">{item.answer}</Text>
        </details>
      ))}
    </div>
  </AnchoredSection>
);

const ClosingCall = () => (
  <section className="mt-4 mb-6 flex flex-col">
    <h2 className="text-xl text-balance">
      You take the call. Carbon writes it down.
    </h2>
    <Text className="mt-2">
      Install it once, and every meeting lands in a folder on your Mac.
    </Text>
    <DownloadButton className="mt-6" />
    <div className="mt-6 flex flex-col gap-5">
      <Text>
        Carbon is free. Drag it to Applications and it shows up in your menu
        bar. It updates itself.
      </Text>
      <Text>
        macOS 26 or later on Apple silicon. Carbon asks for microphone, system
        audio recording and calendar access, to notice your calls and name them
        after your events.
      </Text>
    </div>
  </section>
);

const SAMPLE_FILE = `---
provider: Google Meet
date: 2026-10-27T10:00:00-04:00
title: Launch sync
duration: 42:10
participants:
  - Dana Kim <dana@example.com>
  - Marcus Lee <marcus@example.com>
---

## Transcript

**Me** [0:04] Can we lock the launch date today?

**Dana Kim** [0:09] Yes. We moved it to November 12.

**Marcus Lee** [0:15] I'll update the announcement this afternoon.`;

const SampleFile = () => (
  <CodeBlock>
    <CodeBlockHeader>
      <CodeBlockTitle>~/Documents/Carbon/2026/Launch sync.md</CodeBlockTitle>
    </CodeBlockHeader>
    <CodeBlockContent wrap>{SAMPLE_FILE}</CodeBlockContent>
  </CodeBlock>
);

interface FaqItem {
  answer: ReactNode;
  question: string;
}

const FAQ: FaqItem[] = [
  {
    answer:
      "No. Carbon listens on your Mac and never joins the call, so nobody sees a bot. That also means telling the others they’re being recorded is up to you.",
    question: "Does anyone on the call know Carbon is running?",
  },
  {
    answer:
      "Zoom, Microsoft Teams and Webex in their apps, Google Meet and other calls in your browser, and FaceTime, including iPhone calls relayed to your Mac. Zoom, Teams and Webex calls start Carbon even when you join muted. If it ever misses a call, choose Start Transcribing in its menu.",
    question: "Which meeting apps does it work with?",
  },
  {
    answer:
      "No. Carbon has no account, no analytics and no server. It goes online only to check for updates and to download Apple’s speech recognition for your languages.",
    question: "Does anything leave my Mac?",
  },
  {
    answer:
      "Any language Apple’s on-device speech recognition supports. Choose Add Languages… in the Meeting Language menu to pick yours. If a call turns out to be in another one, switch from the notification or the menu bar and Carbon transcribes it again from the start.",
    question: "Which languages does it transcribe?",
  },
  {
    answer:
      "Click Stop on the notification and Carbon throws away everything it captured. To skip an app for good, add it to Ignored Apps in Settings, or turn off Transcribe Meetings automatically and choose for each call.",
    question: "What if I don’t want a call transcribed?",
  },
  {
    answer:
      "Yes. Open it in Carbon or in any editor. Carbon never overwrites your changes, even when you name a speaker later.",
    question: "Can I edit a transcript?",
  },
  {
    answer:
      "Carbon deletes the audio once the transcript is written. Turn on Keep audio after transcribing in Settings to keep each meeting’s recording.",
    question: "Can I keep the recording?",
  },
  {
    answer:
      "Carbon transcribes with SpeechTranscriber, the on-device speech recognition Apple built into macOS 26.",
    question: "Why does Carbon need macOS 26?",
  },
  {
    answer: (
      <>
        Yes. Carbon is{" "}
        <TextLink external href={LICENSE_URL}>
          MIT licensed
        </TextLink>{" "}
        and its code is on{" "}
        <TextLink external href={GITHUB_URL}>
          GitHub
        </TextLink>
        .
      </>
    ),
    question: "Is Carbon free?",
  },
];

export const Route = createFileRoute("/")({
  component: Home,
  head: () => ({
    links: [{ href: `${SITE_URL}/`, rel: "canonical" }],
    meta: [{ content: `${SITE_URL}/`, property: "og:url" }],
  }),
});
