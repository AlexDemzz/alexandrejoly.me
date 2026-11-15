import { GithubLogoIcon } from "@phosphor-icons/react";
import { FormulaPanel } from "@portfolio/formula2030/panel";
import type { CSSProperties, ReactNode } from "react";

import type { FormulaItem } from "@/lib/registry";
import { themeItem } from "@/lib/registry";
import {
  AGENT_PROMPT,
  AUTHOR_URL,
  POLESTAR_URL,
  REGISTRY_URL,
  SITE_NAME,
  SOURCE_URL,
  UI_SDK_URL,
} from "@/lib/site";

import {
  CHAPTER_REGISTERS,
  numberOf,
  rowsIn,
  sharedItems,
  tileId,
  usageOf,
} from "./data";
import { CodeHint, InstallHint, TileName } from "./hint";

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

/* A full-bleed ground whose content sits on the one column. */

const Band = ({
  children,
  className,
  ground,
  id,
  labelledBy,
}: {
  children: ReactNode;
  className?: string;
  ground: string;
  id?: string;
  labelledBy?: string;
}) => (
  <section
    aria-labelledby={labelledBy}
    className={`home-band${className ? ` ${className}` : ""}`}
    data-ground={ground}
    id={id}
  >
    {children}
  </section>
);

/** One component as a plate: its number and name over the live demo. */
const Tile = ({ item }: { item: FormulaItem }) => {
  const { Demo } = item;
  const code = usageOf(item.name);

  return (
    <article
      aria-label={item.title}
      className="home-tile"
      data-item={item.name}
      data-register={item.register}
      id={tileId(item.name)}
    >
      {code ? (
        <CodeHint
          code={code}
          name={item.name}
          number={numberOf(item.name)}
          title={item.title}
        />
      ) : (
        <TileName number={numberOf(item.name)}>{item.title}</TileName>
      )}
      {Demo ? (
        <div className="home-tile-stage">
          <Demo />
        </div>
      ) : null}
    </article>
  );
};

/** Every component in one sheet, register by register, each on its material. */
const SHOWCASE: FormulaItem[] = [
  ...CHAPTER_REGISTERS.flatMap((register) => rowsIn(register).flat()),
  ...sharedItems,
];

const TOKENS_NUMBER = String(SHOWCASE.length + 1).padStart(2, "0");

const TokensTile = () => (
  <article
    aria-label="Theme tokens"
    className="home-tile"
    data-item="tokens"
    data-register="other"
  >
    <TileName number={TOKENS_NUMBER}>Theme tokens</TileName>
    <ul aria-label="Token colours" className="home-swatches">
      {SWATCHES.map((token) => (
        <li
          key={token}
          style={
            { "--home-swatch": `var(--formula-${token})` } as CSSProperties
          }
        >
          <span aria-hidden="true" className="home-swatch" />
          <code className="home-swatch-name">
            <span className="sr-only">--formula-</span>
            {token}
          </code>
        </li>
      ))}
    </ul>
  </article>
);

const Showcase = () => (
  <Band
    className="home-showcase"
    ground="ice"
    id="components"
    labelledBy="home-components-title"
  >
    <h2 className="sr-only" id="home-components-title">
      Components
    </h2>
    <div className="home-sheet-frame">
      <div className="home-sheet">
        {SHOWCASE.map((item) => (
          <Tile item={item} key={item.name} />
        ))}
        {themeItem ? <TokensTile /> : null}
      </div>
    </div>
  </Band>
);

/* Opening: the title, the dictionary entry, the prompt, then the panel. */

const Opening = () => (
  <Band className="home-opening" ground="hi" labelledBy="home-title">
    <div className="home-masthead">
      <h1 className="home-title" id="home-title">
        {SITE_NAME}
      </h1>
      <dl className="home-word">
        <dt>
          <dfn className="home-word-term">Formula</dfn>{" "}
          <span className="home-word-ipa" lang="en-fonipa">
            /ˈfɔː.mjə.lə/
          </span>
        </dt>
        <dd>
          <span className="home-word-class">Noun.</span> A set rule, or method,
          used to solve a problem or show things relate to one another.
        </dd>
      </dl>
    </div>
    <div className="home-lede">
      <p>
        Themed components for{" "}
        <a className="link" href={UI_SDK_URL}>
          UI SDK
        </a>
        , installed from a shadcn registry. Every control here is a UI SDK
        component underneath.
      </p>
      <InstallHint prompt={AGENT_PROMPT} />
    </div>
    <div className="home-hero" data-formula-stage>
      <FormulaPanel />
    </div>
  </Band>
);

const Footer = () => (
  <footer className="home-band home-footer" data-ground="hi">
    <div className="home-footer-inner">
      <p>
        Inspired by{" "}
        <a
          className="link"
          href={POLESTAR_URL}
          rel="noopener noreferrer"
          target="_blank"
        >
          Polestar’s Formula 2030 concept
        </a>
        . Not affiliated with Polestar or Vercel.
      </p>
      <ul className="home-footer-links">
        <li>
          Made by{" "}
          <a className="link" href={AUTHOR_URL}>
            Alexandre Joly
          </a>
        </li>
        <li>
          <a className="link" href={UI_SDK_URL}>
            UI SDK
          </a>
        </li>
        <li>
          <a className="link" href={SOURCE_URL}>
            Source
          </a>
        </li>
        <li>
          <a className="link" href={REGISTRY_URL}>
            registry.json
          </a>
        </li>
      </ul>
    </div>
  </footer>
);

export const HomePage = () => (
  <div className="home">
    <a className="skip-link" href="#main">
      Skip to content
    </a>
    <header className="home-top">
      <div className="home-top-inner">
        <nav aria-label="Breadcrumb" className="home-crumbs">
          <ol>
            <li>
              <a className="link" href={AUTHOR_URL}>
                Alexandre Joly
              </a>
            </li>
            <li>
              <a aria-current="page" className="link" href="/">
                Formula2030
              </a>
            </li>
          </ol>
        </nav>
        <a className="home-key" href={SOURCE_URL}>
          <GithubLogoIcon aria-hidden size={20} />
          GitHub
        </a>
      </div>
    </header>
    <main id="main">
      <Opening />
      <Showcase />
    </main>
    <Footer />
  </div>
);
