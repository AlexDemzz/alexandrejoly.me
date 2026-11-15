import { IconChevronDown, IconChevronUp } from "@tabler/icons-react";
import { Fragment, useRef } from "react";
import type { MouseEvent } from "react";

import { CopyKey } from "./copy";
import { needsOf, siteImportsOf } from "./data";

const listed = (words: string[]) =>
  words.length > 1
    ? `${words.slice(0, -1).join(", ")} and ${words.at(-1)}`
    : (words[0] ?? "");

/** How the fold was last opened: a key press opens it without the reveal. */
export type Via = "key" | "pointer";

// A click fired by Enter or Space reports no pointer presses.
export const viaOf = (event: MouseEvent): Via =>
  event.detail > 0 ? "pointer" : "key";

const GLYPH = { "aria-hidden": true, size: 16, stroke: 1.5 } as const;

/**
 * The disclosure under a tile. Its visible words start the accessible name
 * ("Show code for Knob"), and the label and the chevron both carry the state,
 * so it reads without the motion of the panel.
 */
export const FoldKey = ({
  controls,
  onToggle,
  open,
  title,
}: {
  controls: string;
  onToggle: (event: MouseEvent) => void;
  open: boolean;
  title: string;
}) => (
  <button
    aria-controls={controls}
    aria-expanded={open}
    className="home-fold-key"
    onClick={onToggle}
    type="button"
  >
    {open ? <IconChevronUp {...GLYPH} /> : <IconChevronDown {...GLYPH} />}
    {/* Both labels share one cell, so the key keeps its width under the pointer. */}
    <span className="home-fold-words">
      <span data-shown={open ? undefined : ""}>Show code</span>
      <span data-shown={open ? "" : undefined}>Hide code</span>
    </span>
    <span className="sr-only"> for {title}</span>
  </button>
);

/**
 * The usage code of one component, a full row of the sheet under its tile's
 * row. It stays mounted while closed, so its copy status and scroll position
 * survive a fold.
 */
export const FoldPanel = ({
  code,
  id,
  name,
  number,
  open,
  title,
  via,
}: {
  code: string;
  id: string;
  name: string;
  number: string;
  open: boolean;
  title: string;
  via: Via;
}) => {
  const source = useRef<HTMLElement>(null);
  const siteImports = siteImportsOf(code);
  const needs = needsOf(name, code);

  return (
    <div className="home-fold" data-via={via} hidden={!open} id={id}>
      <div className="home-fold-head">
        <p className="home-fold-label">
          {number ? (
            <span aria-hidden="true" className="home-num">
              {number}
            </span>
          ) : null}
          {title} usage
        </p>
        <CopyKey
          object={`the ${title} usage code`}
          source={source}
          text={code}
        />
        {needs.length > 0 ? (
          <p className="home-fold-note">Needs {listed(needs)}.</p>
        ) : null}
        {siteImports.length > 0 ? (
          <p className="home-fold-note">
            Replace{" "}
            {siteImports.map((path, index) => (
              <Fragment key={path}>
                {index > 0 ? " and " : null}
                <code>{path}</code>
              </Fragment>
            ))}{" "}
            with your own.
          </p>
        ) : null}
        {name === "sound" ? (
          <p className="home-fold-note">
            Mount <code>{"<FormulaSound />"}</code> once in your app.
          </p>
        ) : null}
      </div>
      <section
        aria-label={`${title} usage code`}
        className="home-code"
        // oxlint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- a scroll region must be reachable by keyboard
        tabIndex={0}
      >
        <pre>
          <code ref={source}>{code}</code>
        </pre>
      </section>
    </div>
  );
};
