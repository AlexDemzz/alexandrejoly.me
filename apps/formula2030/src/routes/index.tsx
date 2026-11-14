import { createFileRoute } from "@tanstack/react-router";
import type { CSSProperties } from "react";

import { CopyBlock, CopyCommand } from "@/components/copy";
import { Gallery } from "@/components/gallery";
import { HeroPanel } from "@/components/hero-panel";
import { Mark } from "@/components/mark";
import { RegisterMark } from "@/components/register-mark";
import { SiteFooter } from "@/components/site-footer";
import { REGISTERS, REGISTER_INFO, themeItem } from "@/lib/registry";
import {
  AGENT_PROMPT,
  REGISTRY_URL,
  SITE_NAME,
  SOURCE_URL,
  UI_SDK_URL,
  installCommand,
} from "@/lib/site";
import { SoundProvider } from "@/lib/sound";

const SWATCHES = [
  "glass",
  "ink",
  "tone-1",
  "tone-2",
  "tone-3",
  "tone-4",
  "tone-5",
  "tile",
  "metal-lo",
  "gold-lo",
  "signal",
  "lamp",
  "limit",
  "cold",
];

const ThemeCard = () =>
  themeItem ? (
    <article aria-labelledby="theme-title" className="theme-card">
      <h3 className="theme-title" id="theme-title">
        Theme tokens
      </h3>
      <p className="theme-description">
        {themeItem.description} Every component installs them as a dependency.
      </p>
      <ul aria-label="Token colours" className="theme-swatches">
        {SWATCHES.map((token) => (
          <li
            key={token}
            style={{ "--swatch": `var(--formula-${token})` } as CSSProperties}
          >
            <span className="sr-only">--formula-{token}</span>
          </li>
        ))}
      </ul>
      <CopyCommand
        label="Copy the theme tokens install command"
        text={installCommand(themeItem.name)}
      />
    </article>
  ) : null;

const Home = () => (
  <SoundProvider>
    <a className="skip-link" href="#main">
      Skip to content
    </a>
    <header className="topbar">
      <a className="topbar-registry link" href={REGISTRY_URL}>
        <Mark />
        registry.json
      </a>
      <nav aria-label="Sections" className="topbar-nav">
        <a className="link" href="#install">
          Install
        </a>
        <a className="link" href="#components">
          Components
        </a>
        <a className="link" href={SOURCE_URL}>
          Source
        </a>
      </nav>
    </header>
    <main className="page" id="main">
      <section aria-labelledby="site-title" className="hero">
        <div className="hero-masthead">
          <h1 id="site-title">{SITE_NAME}</h1>
          <p className="hero-lede">
            Themed components for{" "}
            <a className="link" href={UI_SDK_URL}>
              UI SDK
            </a>
            , installable from a shadcn registry. Every control is a UI SDK
            component underneath, drawn in one of three registers that stack
            from dark to light.
          </p>
        </div>
        <HeroPanel />
        <h2 className="hero-intro-title">Three registers</h2>
        <ol aria-label="The rule" className="hero-rules">
          {REGISTERS.map((register) => (
            <li className="rule" data-register={register} key={register}>
              <div className="rule-text">
                <p className="rule-line">
                  <span className="rule-verb">
                    {REGISTER_INFO[register].verb}
                  </span>
                  <span aria-hidden="true" className="rule-arrow">
                    →
                  </span>
                  <span className="sr-only">: </span>
                  <RegisterMark register={register} />
                  <span>{REGISTER_INFO[register].title}</span>
                </p>
                <p className="rule-gloss">{REGISTER_INFO[register].gloss}</p>
              </div>
              <span aria-hidden="true" className="rule-leader" />
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="install-title" className="section" id="install">
        <div className="section-head">
          <h2 className="section-title" id="install-title">
            Install
          </h2>
          <p className="section-lede">
            Files land in <code>components/ui/formula/</code>, so the theme adds
            to an existing shadcn project without replacing its components.
          </p>
        </div>
        <div className="install-grid">
          <CopyBlock
            action="Copy prompt"
            caption="Prompt for a coding agent"
            text={AGENT_PROMPT}
          />
          <CopyBlock
            action="Copy command"
            caption="One component, with the shadcn CLI"
            text={installCommand("switch")}
          />
          <ThemeCard />
        </div>
      </section>

      <section
        aria-labelledby="components-title"
        className="section"
        id="components"
      >
        <div className="section-head">
          <h2 className="section-title" id="components-title">
            Components
          </h2>
          <p className="section-lede">
            Each one is live. Its card names the UI SDK part underneath and
            gives its own install command.
          </p>
        </div>
        <Gallery />
      </section>
    </main>
    <SiteFooter />
  </SoundProvider>
);

export const Route = createFileRoute("/")({
  component: Home,
});
