import { Code } from "@portfolio/ui/components/code";
import {
  Section,
  SectionContent,
  SectionTitle,
} from "@portfolio/ui/components/section";
import { Text, TextLink } from "@portfolio/ui/components/text";
import { Link, createFileRoute } from "@tanstack/react-router";
import type { ReactNode } from "react";

import { LogoMark } from "@/components/logo";
import { CONTACT_EMAIL, GITHUB_URL, SITE_NAME, SITE_URL } from "@/lib/site";

// Every claim is backed by the Privacy section of Carbon's README and v1 spec
// (carbon/.scratch/carbon-v1); never promise more than they do.
const TITLE = `Privacy – ${SITE_NAME}`;
const DESCRIPTION =
  "Carbon has no account, no analytics and no server. Audio and transcripts stay on your Mac; the only network traffic is update checks and Apple’s speech model downloads.";
const PAGE_URL = `${SITE_URL}/privacy`;

const Privacy = () => (
  <main className="max-w-column mx-auto flex w-full flex-col px-6 pt-12 pb-12 sm:pb-24">
    <Link aria-label={SITE_NAME} className="w-fit" to="/">
      <LogoMark className="text-foreground size-10" />
    </Link>
    <div className="text-muted-foreground mt-6 text-xl leading-relaxed text-balance">
      <h1 className="text-foreground inline font-medium">Privacy.</h1> Carbon
      has no account, no analytics and no server. Your meetings stay on your
      Mac.
    </div>

    <PrivacySection title="Your meetings">
      <Text>
        Carbon records and transcribes on your Mac. Apple’s on-device speech
        recognition writes the transcript. Telling speakers apart also happens
        on your Mac, with models that ship inside the app, so nothing is
        downloaded for it.
      </Text>
      <Text>
        The audio is deleted once the transcript is written, unless you turn on
        Keep audio. Transcripts are plain Markdown files in{" "}
        <Code>~/Documents/Carbon</Code>, or in the folder you choose in
        Settings.
      </Text>
    </PrivacySection>

    <PrivacySection title="Voice Prints">
      <Text>
        When you name a speaker, Carbon remembers their voice as a Voice Print,
        a numeric voice signature. Voice Prints are stored only on your Mac, and
        Carbon never sends them anywhere. You can delete them, or turn voice
        recognition off, in Settings.
      </Text>
    </PrivacySection>

    <PrivacySection title="Network">
      <Text>
        Carbon only goes online for updates. Sparkle checks{" "}
        <Code>carbon.alexandrejoly.me/appcast.xml</Code> for a new version and
        downloads it from the same domain. You can turn automatic checks off in
        Settings. The only other traffic is Apple’s own download of its speech
        models.
      </Text>
    </PrivacySection>

    <PrivacySection title="Recording others">
      <Text>
        By default, Carbon starts transcribing when a call starts, and the dot
        in its menu bar icon stays red while it does. You’re responsible for
        telling the others on the call that they’re being recorded.
      </Text>
    </PrivacySection>

    <PrivacySection title="This website">
      <Text>
        This site sets no cookies and runs no analytics or tracking scripts.
        Text uses your device’s own fonts, and the film comes from this domain.
      </Text>
      <Text>
        The site, update checks and downloads run on{" "}
        <TextLink external href="https://www.cloudflare.com/privacypolicy/">
          Cloudflare
        </TextLink>
        , which processes each request, including your IP address and browser
        details, to serve it and protect it from abuse. Request logs are kept
        for a few days to debug errors.
      </Text>
    </PrivacySection>

    <PrivacySection title="Questions">
      <Text>
        Write to{" "}
        <TextLink href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</TextLink>,
        or open an issue on{" "}
        <TextLink external href={`${GITHUB_URL}/issues`}>
          Carbon’s repository
        </TextLink>
        .
      </Text>
    </PrivacySection>
  </main>
);

const PrivacySection = ({
  children,
  title,
}: {
  children: ReactNode;
  title: string;
}) => (
  <Section>
    <SectionTitle>{title}</SectionTitle>
    <SectionContent className="flex flex-col gap-5">{children}</SectionContent>
  </Section>
);

export const Route = createFileRoute("/privacy")({
  component: Privacy,
  head: () => ({
    links: [{ href: PAGE_URL, rel: "canonical" }],
    meta: [
      { title: TITLE },
      { content: DESCRIPTION, name: "description" },
      { content: TITLE, property: "og:title" },
      { content: DESCRIPTION, property: "og:description" },
      { content: PAGE_URL, property: "og:url" },
    ],
  }),
});
