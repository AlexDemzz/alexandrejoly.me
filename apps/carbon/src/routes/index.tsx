import { buttonVariants } from "@portfolio/ui/components/button";
import { Code } from "@portfolio/ui/components/code";
import {
  Section,
  SectionContent,
  SectionTitle,
} from "@portfolio/ui/components/section";
import { Text, TextLink } from "@portfolio/ui/components/text";
import { createFileRoute } from "@tanstack/react-router";
import type { ReactNode } from "react";

import { Film } from "@/components/film";
import { LogoMark } from "@/components/logo";
import { SiteFooter } from "@/components/site-footer";
import { X_URL } from "@/lib/site";

// Every claim below is backed by Carbon's v1 product design and UI mock
// (carbon/.scratch/carbon-v1/issues/01 and 12). Keep it that way.
const Home = () => (
  <main className="flex flex-1 flex-col px-6 pt-12 pb-12 sm:pb-24">
    <Header />
    <div className="max-w-breakout mx-auto mt-8 w-full">
      <Film />
    </div>
    <div className="max-w-column mx-auto mt-10 flex w-full flex-col">
      <Prose title="How it works">
        <Text>
          Carbon lives in your menu bar. When Zoom, Google Meet, Teams or any
          other meeting app starts using your microphone, Carbon starts
          transcribing and the dot in its icon turns red. It stops on its own
          when the call ends. If you’d rather not keep a call, Stop throws it
          away.
        </Text>
        <Text>
          It listens on your Mac instead of joining the call, so it works with
          any meeting app, in the browser or not, and nobody sees a note taker
          show up.
        </Text>
      </Prose>
      <Prose title="After the call">
        <Text>
          Each meeting opens on a summary, key points then next steps, written
          by the model built into macOS. Below it comes the full transcript,
          line by line: what you said is marked Me, and the other voices are
          split into speakers you can name.
        </Text>
        <Text>
          Pick the language a meeting is in from the menu bar, even mid-call.
        </Text>
      </Prose>
      <Prose title="Ready for your agent">
        <Text>
          Every meeting is a Markdown file in <Code>~/Documents/Carbon</Code>.
          Copy Path puts its location on your clipboard, so you can hand the
          meeting to an AI agent, or open it in any editor. Your edits stay in
          the file.
        </Text>
      </Prose>
      <Prose title="Private by design">
        <Text>
          Carbon transcribes with Apple’s speech recognition, on your Mac. The
          audio is deleted once the transcript is written, unless you choose to
          keep it. There is no account and no cloud: your meetings never leave
          your Mac.
        </Text>
      </Prose>
      <Prose title="Availability">
        <Text>
          I’m building Carbon right now. It will be free, for macOS 26, and I
          plan to open-source it. Summaries need Apple Intelligence.{" "}
          <TextLink href={X_URL} external>
            I share progress on X
          </TextLink>
          .
        </Text>
      </Prose>
    </div>
    <div className="max-w-column mx-auto mt-auto w-full pt-6">
      <SiteFooter />
    </div>
  </main>
);

const Header = () => (
  <header className="max-w-column mx-auto flex w-full flex-col">
    <LogoMark className="text-foreground size-10" />
    <div className="text-muted-foreground mt-6 text-xl leading-relaxed text-balance">
      <h1 className="text-foreground inline font-medium">Carbon</h1> is a menu
      bar app that transcribes your meetings on your Mac. No bot joins the call,
      and nothing goes to the cloud.
    </div>
    <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2">
      <a
        className={buttonVariants({ size: "lg" })}
        href={X_URL}
        rel="noopener noreferrer"
        target="_blank"
      >
        Follow the build on X
        <span className="sr-only"> (opens in a new tab)</span>
      </a>
      <p className="text-muted-foreground text-sm">
        Not available yet. Free, for macOS 26.
      </p>
    </div>
  </header>
);

const Prose = ({ title, children }: { title: string; children: ReactNode }) => (
  <Section>
    <SectionTitle>{title}</SectionTitle>
    <SectionContent className="flex flex-col gap-4">{children}</SectionContent>
  </Section>
);

export const Route = createFileRoute("/")({
  component: Home,
});
