import { FormulaPanel } from "@portfolio/formula2030/panel";
import { Fragment } from "react";
import type { CSSProperties, ReactNode } from "react";

import type { FormulaItem, Register } from "@/lib/registry";
import { REGISTER_INFO, themeItem } from "@/lib/registry";
import {
  AGENT_PROMPT,
  AUTHOR_URL,
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

const GROUNDS: Record<Register, string> = {
  machined: "ice",
  readout: "glass",
  strata: "t4",
};

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

const Sheet = ({
  children,
  items,
  register,
}: {
  children?: ReactNode;
  items: FormulaItem[];
  register: string;
}) => (
  <div className="home-sheet-frame">
    <div className="home-sheet" data-register={register}>
      {children}
      {items.map((item) => (
        <Tile item={item} key={item.name} />
      ))}
    </div>
  </div>
);

const Chapter = ({ register }: { register: Register }) => {
  const titleId = `home-${register}-title`;

  return (
    <Band
      className="home-chapter"
      ground={GROUNDS[register]}
      id={register}
      labelledBy={titleId}
    >
      <h2 className="home-head-title" id={titleId}>
        {REGISTER_INFO[register].title}
      </h2>
      <Sheet items={rowsIn(register).flat()} register={register} />
    </Band>
  );
};

/** The break between bands and glass: three more steps, each one darker. */
const Steps = () => (
  <div aria-hidden="true" className="home-steps">
    <span data-ground="t3" />
    <span data-ground="t2" />
    <span data-ground="t1" />
  </div>
);

const TokensTile = () => (
  <article aria-label="Theme tokens" className="home-tile" data-item="tokens">
    <h3 className="home-tile-name">Theme tokens</h3>
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

const Shared = () => (
  <Band
    className="home-chapter"
    ground="hi"
    id="shared"
    labelledBy="home-shared-title"
  >
    <h2 className="home-head-title" id="home-shared-title">
      Every register
    </h2>
    <Sheet items={sharedItems} register="other">
      {themeItem ? <TokensTile /> : null}
    </Sheet>
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
        Inspired by Polestar’s Formula 2030 concept. Not affiliated with
        Polestar or Vercel.
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
        <nav aria-label="Sections" className="home-top-nav">
          <a className="link" href="#components">
            Components
          </a>
          <a className="link" href={SOURCE_URL}>
            Source
          </a>
        </nav>
      </div>
    </header>
    <main id="main">
      <Opening />
      <div id="components">
        {CHAPTER_REGISTERS.map((register) => (
          <Fragment key={register}>
            <Chapter register={register} />
            {register === "strata" ? <Steps /> : null}
          </Fragment>
        ))}
        <Shared />
      </div>
    </main>
    <Footer />
  </div>
);
