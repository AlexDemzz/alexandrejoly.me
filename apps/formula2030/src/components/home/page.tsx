import { GithubLogoIcon } from "@phosphor-icons/react";
import { FormulaPanel } from "@portfolio/formula2030/panel";
import type { CSSProperties, ReactNode } from "react";

import { TextLink } from "@/components/text-link";
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
import { KEY } from "./key";

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
  id,
  labelledBy,
}: {
  children: ReactNode;
  className: string;
  id?: string;
  labelledBy?: string;
}) => (
  <section
    aria-labelledby={labelledBy}
    className={`band bg-ground text-fg ${className}`}
    id={id}
  >
    {children}
  </section>
);

/*
 * The contact sheet's columns: one, then two (Button keeps a whole row),
 * then twelve tracks with two tiles of mixed proportion per row. Each
 * pairing was measured so neither tile in a row is left with a block of
 * empty ground.
 */
const SPANS: Record<string, string> = {
  button: "@[34rem]/sheet:col-span-full",
  checkbox: "@[52rem]/sheet:col-span-5",
  glass: "@[52rem]/sheet:col-span-4",
  knob: "@[52rem]/sheet:col-span-7",
  meter: "@[52rem]/sheet:col-span-7",
  "number-input": "@[52rem]/sheet:col-span-5",
  progress: "@[52rem]/sheet:col-span-5",
  radio: "@[52rem]/sheet:col-span-5",
  "segmented-control": "@[52rem]/sheet:col-span-7",
  slider: "@[52rem]/sheet:col-span-8",
  sound: "@[52rem]/sheet:col-span-5",
  switch: "@[52rem]/sheet:col-span-7",
  tile: "@[52rem]/sheet:col-span-5",
  tokens: "@[52rem]/sheet:col-span-7",
  toggle: "@[52rem]/sheet:col-span-7",
};

/*
 * Every plate is the same card on the ice ground, in the bed colour a tile
 * group shows between its tiles, so a group's seams run on into the card.
 * The demo inside carries its own material. The transparent border keeps
 * cards apart in forced colours.
 */
const tileClass = (name: string) =>
  `ground-bed grid min-w-0 grid-rows-[auto_1fr] border border-transparent bg-ground text-fg ${SPANS[name] ?? "@[52rem]/sheet:col-span-6"}`;

const STAGE = "@container/stage grid content-center gap-seam px-seam pb-seam";

/** How a demo sits in its plate, by its register or its own needs. */
const stageClass = (item: FormulaItem) => {
  const fills = item.register !== "strata";
  const classes = [
    STAGE,
    // The demo fills its stage, so two plates in a row keep one height:
    // glasses stretch, and tile groups, even inside a group such as the
    // checkbox one, grow their tiles.
    fills ? "content-stretch *:h-full *:*:data-[slot=tile-group]:h-full" : "",
    // Bands start at the top, so two strata demos in a row line up.
    item.register === "strata" ? "content-start" : "",
    // The indeterminate bar sweeps past its track; keep it inside the tile.
    item.name === "progress"
      ? "overflow-x-clip [overflow-clip-margin:calc(var(--formula-ring)+2px)]"
      : "",
  ];
  return classes.filter(Boolean).join(" ");
};

/** One component as a plate: its number and name over the live demo. */
const Tile = ({ item }: { item: FormulaItem }) => {
  const { Demo } = item;
  const code = usageOf(item.name);

  return (
    <article
      aria-label={item.title}
      className={tileClass(item.name)}
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
        <div className={stageClass(item)} data-stage={item.name}>
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
  <article aria-label="Theme tokens" className={tileClass("tokens")}>
    <TileName number={TOKENS_NUMBER}>Theme tokens</TileName>
    {/* The chips grow to fill whatever height the row gives the tile. */}
    <ul
      aria-label="Token colours"
      className="gap-x-seam px-seam grid grid-cols-[repeat(auto-fill,minmax(3.5rem,1fr))] gap-y-3 pt-1 pb-2 @[34rem]/sheet:grid-cols-7"
    >
      {SWATCHES.map((token) => (
        <li
          className="grid grid-rows-[1fr_auto] gap-1"
          key={token}
          style={{ "--swatch": `var(--formula-${token})` } as CSSProperties}
        >
          <span
            aria-hidden="true"
            className="border-ink/12 block min-h-12 border bg-(--swatch)"
          />
          <code className="text-dim px-1 text-xs font-normal wrap-anywhere">
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
    className="ground-ice py-chapter"
    id="components"
    labelledBy="home-components-title"
  >
    <h2 className="sr-only" id="home-components-title">
      Components
    </h2>
    <div className="@container/sheet">
      <div className="gap-seam grid grid-cols-1 @[34rem]/sheet:grid-cols-2 @[52rem]/sheet:grid-cols-12">
        {SHOWCASE.map((item) => (
          <Tile item={item} key={item.name} />
        ))}
        {themeItem ? <TokensTile /> : null}
      </div>
    </div>
  </Band>
);

/*
 * Opening: the title, the dictionary entry, the prompt, then the panel. On
 * first load the title, the entry and the panel settle in turn; the fades
 * stay when motion is reduced, the movement does not.
 */

const SETTLE =
  "transition duration-700 ease-formula starting:opacity-0 motion-safe:starting:translate-y-3";

const Opening = () => (
  <Band
    className="ground-hi pb-chapter pt-10 sm:pt-14 lg:pt-22"
    labelledBy="home-title"
  >
    <div className="mb-4 grid grid-cols-1 gap-x-8 gap-y-6 md:grid-cols-[minmax(0,1fr)_18rem] md:items-end lg:mb-7">
      <h1
        className={`text-5xl leading-none font-normal tracking-tighter sm:text-6xl lg:text-7xl ${SETTLE}`}
        id="home-title"
      >
        {SITE_NAME}
      </h1>
      <dl className="ease-formula grid max-w-72 gap-2 transition-opacity delay-80 duration-700 starting:opacity-0">
        {/* On one column the entry stays body size, so it never rivals the title. */}
        <dt className="md:text-3xl md:leading-tight md:tracking-tight">
          <dfn className="not-italic">Formula</dfn>{" "}
          <span className="text-dim tracking-normal" lang="en-fonipa">
            /ˈfɔː.mjə.lə/
          </span>
        </dt>
        <dd>
          <span className="text-dim">Noun.</span> A set rule, or method, used to
          solve a problem or show things relate to one another.
        </dd>
      </dl>
    </div>
    <div className="grid max-w-88 justify-items-start gap-3">
      <p>
        Themed components for <TextLink href={UI_SDK_URL}>UI SDK</TextLink>,
        installed from a shadcn registry. Every control here is a UI SDK
        component underneath.
      </p>
      <InstallHint prompt={AGENT_PROMPT} />
    </div>
    {/* The hero: the lab's panel, alone on an ice ground like a photograph. */}
    <div
      className={`bg-ice max-sm:-mx-gutter mt-8 grid justify-items-center px-4 py-8 delay-160 sm:py-12 lg:mt-14 lg:py-20 ${SETTLE}`}
      data-formula-stage
    >
      <FormulaPanel />
    </div>
  </Band>
);

const FOOTER_LINK = "inline-block py-1 text-fg";

const Footer = () => (
  <footer className="band ground-hi bg-ground text-dim">
    <div className="flex flex-wrap justify-between gap-x-12 gap-y-4 py-6">
      <p className="max-w-md">
        Inspired by{" "}
        <TextLink href={POLESTAR_URL} rel="noopener noreferrer" target="_blank">
          Polestar’s Formula 2030 concept
        </TextLink>
        . Not affiliated with Polestar or Vercel.
      </p>
      <ul className="flex flex-wrap gap-x-6 gap-y-1">
        <li>
          Made by{" "}
          <TextLink className={FOOTER_LINK} href={AUTHOR_URL}>
            Alexandre Joly
          </TextLink>
        </li>
        <li>
          <TextLink className={FOOTER_LINK} href={UI_SDK_URL}>
            UI SDK
          </TextLink>
        </li>
        <li>
          <TextLink className={FOOTER_LINK} href={SOURCE_URL}>
            Source
          </TextLink>
        </li>
        <li>
          <TextLink className={FOOTER_LINK} href={REGISTRY_URL}>
            registry.json
          </TextLink>
        </li>
      </ul>
    </div>
  </footer>
);

/*
 * The home page: a showcase. The title, the prompt and the panel open it;
 * then one sheet holds every component as a live plate, each on its own
 * material (ice tiles, tonal bands, black glass), and each plate's title
 * opens its usage code.
 */
export const HomePage = () => (
  <div
    className="ground-hi bg-ground text-fg min-h-svh text-sm/normal [&_:is(p,h1,h2,h3,h4,dd)]:wrap-break-word **:[[id]]:scroll-mt-6"
    data-page="home"
  >
    <a
      className="focus-ring rounded-formula bg-ink text-on-ink sr-only z-30 px-4 py-2.5 text-sm no-underline [--ground-focus:var(--formula-signal)] focus-visible:not-sr-only focus-visible:absolute focus-visible:top-3 focus-visible:left-3"
      href="#main"
    >
      Skip to content
    </a>
    <header className="band border-tile-line border-b">
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-1 py-3">
        <nav aria-label="Breadcrumb">
          <ol className="flex flex-wrap">
            <li>
              <TextLink className="inline-block py-1" href={AUTHOR_URL} quiet>
                Alexandre Joly
              </TextLink>
            </li>
            <li>
              <span aria-hidden="true" className="text-dim px-2">
                /
              </span>
              <TextLink
                aria-current="page"
                className="inline-block py-1"
                href="/"
                quiet
              >
                Formula2030
              </TextLink>
            </li>
          </ol>
        </nav>
        <a className={KEY} href={SOURCE_URL}>
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
