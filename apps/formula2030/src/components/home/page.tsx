import { useEffect, useRef, useState } from "react";
import type { CSSProperties, MouseEvent, ReactNode, RefObject } from "react";

import type { FormulaItem, Register } from "@/lib/registry";
import { REGISTER_INFO, themeItem } from "@/lib/registry";
import {
  AGENT_PROMPT,
  AUTHOR_URL,
  REGISTRY_URL,
  SITE_NAME,
  SOURCE_URL,
  UI_SDK_URL,
  installCommand,
} from "@/lib/site";
import {
  Glass,
  GlassBrackets,
  GlassCaption,
} from "@/registry/formula/ui/formula/glass";

import { FoldKey, FoldPanel, viaOf } from "./code";
import type { Via } from "./code";
import { Breakable, CopyKey, CopyLine } from "./copy";
import {
  CHAPTER_REGISTERS,
  codeId,
  itemsIn,
  numberOf,
  partsOf,
  rowsIn,
  sharedItems,
  tileId,
  usageOf,
} from "./data";
import { Stage } from "./stage";

const CLI_COMMAND = installCommand("switch");
const TOKENS_ID = "home-tile-tokens";

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

/* Wayfinding: the chapter under the upper middle of the viewport is current. */

const useActiveChapter = () => {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && entry.target instanceof HTMLElement) {
            const spy = entry.target.dataset.spy ?? "none";
            setActive(spy === "none" ? null : spy);
          }
        }
      },
      { rootMargin: "-40% 0px -60% 0px" }
    );
    for (const section of document.querySelectorAll<HTMLElement>(
      ".home [data-spy]"
    )) {
      observer.observe(section);
    }
    return () => observer.disconnect();
  }, []);

  return active;
};

const RAIL = [
  ...CHAPTER_REGISTERS.map((register) => ({
    count: itemsIn(register).length,
    id: register,
    label: REGISTER_INFO[register].title,
  })),
  { count: sharedItems.length, id: "shared", label: "Shared" },
];

const ChapterRail = ({ active }: { active: string | null }) => (
  <nav aria-label="Chapters" className="home-rail">
    <ol className="home-rail-list">
      {RAIL.map(({ count, id, label }) => (
        <li key={id}>
          <a
            aria-current={active === id ? "true" : undefined}
            className="home-rail-link"
            href={`#${id}`}
          >
            <span aria-hidden="true" className="home-rail-marker" />
            <span>{label}</span>
            <span className="home-rail-count">
              {count}
              <span className="sr-only">
                {count === 1 ? " component" : " components"}
              </span>
            </span>
          </a>
        </li>
      ))}
    </ol>
  </nav>
);

/* A full-bleed ground whose content sits on the one column. */

const Band = ({
  children,
  className,
  ground,
  id,
  labelledBy,
  spy,
}: {
  children: ReactNode;
  className?: string;
  ground: string;
  id?: string;
  labelledBy?: string;
  spy?: string;
}) => (
  <section
    aria-labelledby={labelledBy}
    className={`home-band${className ? ` ${className}` : ""}`}
    data-ground={ground}
    data-spy={spy}
    id={id}
  >
    {children}
  </section>
);

/*
 * Contact sheet: each tile carries its caption, install command and a
 * disclosure; the usage code folds open as a full row of the sheet under the
 * tile's row. Folds are independent, so two can be read side by side.
 */

const TileCaption = ({
  children,
  install,
  name,
  part,
}: {
  children?: ReactNode;
  install: string;
  name: string;
  part: string | undefined;
}) => (
  <div className="home-tile-caption">
    {part ? <p className="home-tile-part">{part}</p> : null}
    <CopyLine object={`the ${name} install command`} text={install} />
    {children}
  </div>
);

const Tile = ({
  item,
  onToggle,
  open,
}: {
  item: FormulaItem;
  onToggle: (event: MouseEvent) => void;
  open: boolean;
}) => {
  const { Demo } = item;
  const titleId = `${tileId(item.name)}-title`;

  return (
    <article
      aria-labelledby={titleId}
      className="home-tile"
      data-item={item.name}
      id={tileId(item.name)}
    >
      <h4 className="home-tile-name" id={titleId}>
        <span aria-hidden="true" className="home-num">
          {numberOf(item.name)}
        </span>
        {item.title}
      </h4>
      {Demo ? (
        <section aria-label={`${item.title}, demo`} className="home-tile-stage">
          <Demo />
        </section>
      ) : null}
      <TileCaption
        install={installCommand(item.name)}
        name={item.title}
        part={partsOf(item)}
      >
        {usageOf(item.name) ? (
          <FoldKey
            controls={codeId(item.name)}
            onToggle={onToggle}
            open={open}
            title={item.title}
          />
        ) : null}
      </TileCaption>
    </article>
  );
};

/** How many columns the sheet's grid has right now. */
const useColumns = (sheet: RefObject<HTMLElement | null>) => {
  const [columns, setColumns] = useState(1);

  useEffect(() => {
    const node = sheet.current;
    if (!node) {
      return;
    }
    const observer = new ResizeObserver(() => {
      setColumns(getComputedStyle(node).gridTemplateColumns.split(" ").length);
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, [sheet]);

  return columns;
};

/*
 * Side by side, a row's tiles come first and their folds after, so the DOM,
 * the tab order and the eye all go down the row's tiles, then into the code
 * opened under them. In one column each fold follows its own tile.
 */
const Sheet = ({
  children,
  register,
  rows,
}: {
  children?: ReactNode;
  register: string;
  rows: FormulaItem[][];
}) => {
  const sheet = useRef<HTMLDivElement>(null);
  const columns = useColumns(sheet);
  const [folds, setFolds] = useState<Partial<Record<string, Via>>>({});

  const toggle = (name: string, event: MouseEvent) => {
    const via = viaOf(event);
    setFolds((current) => ({
      ...current,
      [name]: current[name] ? undefined : via,
    }));
  };

  const tileOf = (item: FormulaItem) => (
    <Tile
      item={item}
      key={`tile-${item.name}`}
      onToggle={(event) => toggle(item.name, event)}
      open={Boolean(folds[item.name])}
    />
  );

  const foldOf = (item: FormulaItem) => {
    const code = usageOf(item.name);
    return code ? (
      <FoldPanel
        code={code}
        id={codeId(item.name)}
        key={`fold-${item.name}`}
        name={item.name}
        number={numberOf(item.name)}
        open={Boolean(folds[item.name])}
        title={item.title}
        via={folds[item.name] ?? "pointer"}
      />
    ) : null;
  };

  return (
    <div className="home-sheet-frame">
      <div className="home-sheet" data-register={register} ref={sheet}>
        {children}
        {rows.flatMap((row) =>
          columns > 1
            ? [...row.map(tileOf), ...row.map(foldOf)]
            : row.flatMap((item) => [tileOf(item), foldOf(item)])
        )}
      </div>
    </div>
  );
};

const ChapterHead = ({ id, title }: { id: string; title: string }) => (
  <h3 className="home-head-title" id={id}>
    {title}
  </h3>
);

const Chapter = ({ register }: { register: Register }) => {
  const ground = GROUNDS[register];
  const { title } = REGISTER_INFO[register];
  const titleId = `home-${register}-title`;

  return (
    <Band
      className="home-chapter"
      ground={ground}
      id={register}
      labelledBy={titleId}
      spy={register}
    >
      <ChapterHead id={titleId} title={title} />
      <Sheet register={register} rows={rowsIn(register)} />
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

const Shared = () => (
  <Band
    className="home-chapter"
    ground="hi"
    id="shared"
    labelledBy="home-shared-title"
    spy="shared"
  >
    <ChapterHead id="home-shared-title" title="Every register" />
    <Sheet register="other" rows={[sharedItems]}>
      {themeItem ? (
        <article
          aria-labelledby={`${TOKENS_ID}-title`}
          className="home-tile"
          data-item="tokens"
          id={TOKENS_ID}
        >
          <h4 className="home-tile-name" id={`${TOKENS_ID}-title`}>
            Theme tokens
          </h4>
          <ul aria-label="Token colours" className="home-swatches">
            {SWATCHES.map((token) => (
              <li
                key={token}
                style={
                  {
                    "--home-swatch": `var(--formula-${token})`,
                  } as CSSProperties
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
          <TileCaption
            install={installCommand(themeItem.name)}
            name="theme tokens"
            part="--formula-* custom properties"
          />
        </article>
      ) : null}
    </Sheet>
  </Band>
);

/* Opening */

const Opening = () => (
  <Band className="home-opening" ground="hi" labelledBy="home-title" spy="none">
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
    <Stage />
    <div className="home-intro">
      <p>
        Themed components for{" "}
        <a className="link" href={UI_SDK_URL}>
          UI SDK
        </a>
        , installed from a shadcn registry. Every control is a UI SDK component
        underneath, so it keeps that component’s keyboard and screen reader
        behaviour.
      </p>
      <p>
        They are drawn in three registers taken from a concept car’s control
        panel, stacked from dark to light: glass you read, bands you choose
        from, tiles you press.
      </p>
      <p className="home-statement">
        Below, the page steps down through all three.
      </p>
    </div>
  </Band>
);

const Install = () => {
  const prompt = useRef<HTMLElement>(null);
  const cli = useRef<HTMLElement>(null);

  return (
    <Band
      className="home-install"
      ground="hi"
      id="install"
      labelledBy="home-install-title"
      spy="none"
    >
      <header className="home-section-head">
        <h2 className="home-section-title" id="home-install-title">
          Install
        </h2>
      </header>
      <div className="home-sheet-frame">
        <ul className="home-sheet" data-register="install">
          <li className="home-tile" data-ground="glass" data-item="prompt">
            <Glass className="home-install-glass">
              <GlassBrackets />
              <GlassCaption>Agent prompt</GlassCaption>
              <code className="home-install-text" ref={prompt}>
                <Breakable text={AGENT_PROMPT} />
              </code>
              <div className="home-install-foot">
                <CopyKey
                  object="the prompt for a coding agent"
                  source={prompt}
                  text={AGENT_PROMPT}
                />
              </div>
            </Glass>
          </li>
          <li className="home-tile" data-item="cli">
            <p className="home-install-caption">shadcn CLI</p>
            <code className="home-install-text" ref={cli}>
              <Breakable text={CLI_COMMAND} />
            </code>
            <div className="home-install-foot">
              <CopyKey
                object="the shadcn command for Switch"
                source={cli}
                text={CLI_COMMAND}
              />
            </div>
          </li>
        </ul>
      </div>
    </Band>
  );
};

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

export const HomePage = () => {
  const active = useActiveChapter();

  return (
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
        </div>
      </header>
      <ChapterRail active={active} />
      <main id="main">
        <Opening />
        <Install />
        <section aria-labelledby="home-components-title" id="components">
          <Band className="home-entry-band" ground="hi" spy="none">
            <header className="home-section-head">
              <h2 className="home-section-title" id="home-components-title">
                Components
              </h2>
            </header>
          </Band>
          <Chapter register="machined" />
          <Chapter register="strata" />
          <Steps />
          <Chapter register="readout" />
          <Shared />
        </section>
      </main>
      <Footer />
    </div>
  );
};
