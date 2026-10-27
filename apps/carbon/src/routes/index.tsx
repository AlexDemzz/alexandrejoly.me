import { buttonVariants } from "@portfolio/ui/components/button";
import { codeVariants } from "@portfolio/ui/components/code";
import { Text } from "@portfolio/ui/components/text";
import { cn } from "@portfolio/ui/lib/utils";
import { createFileRoute } from "@tanstack/react-router";
import type { ReactNode } from "react";

import { Film } from "@/components/film";
import { LogoMark } from "@/components/logo";
import { SiteFooter } from "@/components/site-footer";
import { X_URL } from "@/lib/site";

// A letter after the copper page: the hook as the h1, the problem, why
// Carbon exists, the film, what it is, how it works, why it can be trusted,
// then the call to action. Every claim is backed by Carbon's v1 product
// design and UI mock (carbon/.scratch/carbon-v1/issues/01 and 12).
const Home = () => (
  <main className="flex flex-1 flex-col px-6 pt-12 pb-12 sm:pb-24">
    <Letter>
      <LogoMark className="text-foreground size-10" />
      <h1 className="text-foreground mt-1 text-xl leading-relaxed text-balance">
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
      <Text>
        I wanted the transcript without the bot, so I’m building Carbon.
      </Text>
    </Letter>

    <div className="max-w-breakout mx-auto mt-8 w-full">
      <Film />
    </div>

    <Letter className="mt-8">
      <p className="text-foreground font-medium text-balance">
        Carbon is a menu bar app that transcribes your meetings on your Mac and
        keeps each one as a Markdown file an AI agent can read.
      </p>
      <Text>
        When Zoom, Google Meet, Teams or any other meeting app starts using your
        microphone, Carbon starts transcribing and the dot in its icon turns
        red. When the call ends, the meeting opens on a summary, key points then
        next steps, with the full transcript below it. What you said is marked
        Me, everyone else Them.
      </Text>
      <Text>
        To hand a meeting to an agent, right-click it, press <Key>⇧</Key>{" "}
        <Key>⌘</Key> <Key>C</Key> to copy its path, and paste it into Claude
        Code, Codex or any agent that reads files. Speaking French in this one?
        Switch the meeting’s language from the menu bar, even mid-call.
      </Text>
      <Text>
        I wanted something I could trust with every call. So Carbon doesn’t join
        the call, doesn’t upload anything and doesn’t need an account. It
        transcribes with Apple’s on-device speech recognition and deletes the
        audio once the transcript is written.{" "}
        <Emphasis>Everything stays on your Mac.</Emphasis>
      </Text>
      <Text>
        If this feels like something you’d use, it will be free. Carbon isn’t
        out yet: I’m building it now, and I plan to open-source it.
      </Text>
      <a
        className={buttonVariants({ className: "w-fit", size: "lg" })}
        href={X_URL}
        rel="noopener noreferrer"
        target="_blank"
      >
        Follow the build on X
        <span className="sr-only"> (opens in a new tab)</span>
      </a>
      <p className="text-muted-foreground text-sm">
        I share progress there, and I’ll post the download when it’s ready.
      </p>
      <p className="text-muted-foreground text-sm">
        macOS 26 or later. Summaries need Apple Intelligence. Carbon asks for
        microphone, system audio recording and calendar access, to notice your
        calls and name them after your events.
      </p>
    </Letter>

    <div className="max-w-column mx-auto mt-auto w-full pt-6">
      <SiteFooter />
    </div>
  </main>
);

const Letter = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => (
  <div
    className={cn("max-w-column mx-auto flex w-full flex-col gap-5", className)}
  >
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
