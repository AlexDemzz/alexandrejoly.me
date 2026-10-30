import { Code } from "@portfolio/ui/components/code";
import { Text, TextLink } from "@portfolio/ui/components/text";
import { createFileRoute } from "@tanstack/react-router";

import { AnchoredSection } from "@/components/anchored-section";
import { Emphasis } from "@/components/emphasis";
import { HomeBreadcrumb } from "@/components/home-breadcrumb";
import { SiteFooter } from "@/components/site-footer";
import { CONTACT_EMAIL, GITHUB_URL, SITE_NAME, SITE_URL } from "@/lib/site";

// Every claim is backed by the Privacy section of Carbon's README and v1 spec
// (carbon/.scratch/carbon-v1); never promise more than they do.
const TITLE = `Privacy – ${SITE_NAME}`;
const DESCRIPTION =
  "Everything Carbon hears stays on your Mac: no account, no analytics, no server. Audio and transcripts never leave it.";
const PAGE_URL = `${SITE_URL}/privacy`;

const Privacy = () => (
  <main className="max-w-column mx-auto flex w-full flex-col px-6 pt-12 pb-12 sm:pb-24">
    <HomeBreadcrumb />
    <div className="text-muted-foreground mt-6 text-xl leading-relaxed text-balance">
      <h1 className="text-foreground inline font-medium">Privacy.</h1>{" "}
      Everything Carbon hears stays on your Mac.
    </div>
    <Text className="mt-5">
      I built Carbon to get my meeting transcripts without sending my calls to
      anyone, me included. So there’s{" "}
      <Emphasis>no account, no analytics and no server</Emphasis>. Here’s what
      that means in practice.
    </Text>

    <AnchoredSection id="meetings" title="Your meetings never leave your Mac">
      <Text>
        Carbon records and transcribes on your Mac, with Apple’s on-device
        speech recognition. It tells speakers apart on your Mac too, with models
        that ship inside the app, so nothing is downloaded for it.
      </Text>
      <Text>
        Each transcript is a plain Markdown file in <Code>~/Carbon</Code>, or
        the folder you choose. The audio is deleted once the transcript is
        written, unless you turn on Keep audio.{" "}
        <Emphasis>I never see any of it.</Emphasis>
      </Text>
    </AnchoredSection>

    <AnchoredSection id="voices" title="Voices stay on your Mac too">
      <Text>
        When you name a speaker, Carbon remembers their voice as a Voice Print,
        a numeric voice signature. Voice Prints are stored only on your Mac, and
        Carbon never sends them anywhere. You can delete them, or turn voice
        recognition off, in Settings.
      </Text>
    </AnchoredSection>

    <AnchoredSection id="tracking" title="Carbon doesn’t track you">
      <Text>
        No account to sign in to, no analytics, and no server of mine for Carbon
        to report to. Nothing about your meetings, or how you use Carbon, is
        sent anywhere.
      </Text>
    </AnchoredSection>

    <AnchoredSection id="updates" title="Checking for updates">
      <Text>
        Carbon asks <Code>carbon.alexandrejoly.me</Code> whether a newer version
        exists, and downloads it if there is one. That’s Sparkle, and it’s the
        only call Carbon makes. You can turn automatic checks off in Settings.
      </Text>
      <Text>
        The only other traffic is macOS downloading Apple’s own speech models.
      </Text>
    </AnchoredSection>

    <AnchoredSection id="recording" title="Telling people you’re recording">
      <Text>
        By default, Carbon starts transcribing when a call starts, and the dot
        in its menu bar icon stays red while it does. You’re responsible for
        telling the others on the call that they’re being recorded.
      </Text>
    </AnchoredSection>

    <AnchoredSection id="this-site" title="This site">
      <Text>
        carbon.alexandrejoly.me sets no cookies and runs no analytics or
        tracking scripts. It runs on{" "}
        <TextLink external href="https://www.cloudflare.com/privacypolicy/">
          Cloudflare
        </TextLink>
        , which processes each request, including your IP address and browser
        details, to serve the page and protect it from abuse. Request logs are
        kept for a few days to debug errors.
      </Text>
    </AnchoredSection>

    <AnchoredSection id="questions" title="Questions">
      <Text>
        Write to{" "}
        <TextLink href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</TextLink>,
        or open an issue on{" "}
        <TextLink external href={`${GITHUB_URL}/issues`}>
          Carbon’s repository
        </TextLink>
        . If any of this changes, I’ll update this page.
      </Text>
    </AnchoredSection>
    <SiteFooter />
  </main>
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
