import {
  Popover,
  PopoverContent,
  PopoverTitle,
  PopoverTrigger,
} from "@ui-sdk/react/popover";
import { Fragment } from "react";
import type { ReactNode } from "react";

import { Glass, GlassCaption } from "@/registry/formula/ui/formula/glass";

import { Breakable, CopyKey } from "./copy";
import { siteImportsOf } from "./data";

const HOVER_DELAY = 250;
const HOVER_CLOSE_DELAY = 150;
const OFFSET = 8;
const EDGE = 16;

/** The prompt for a coding agent, on glass under the trigger that opens it. */
export const InstallHint = ({ prompt }: { prompt: string }) => (
  <Popover>
    <PopoverTrigger className="home-hint">Installation prompt</PopoverTrigger>
    <PopoverContent
      align="start"
      className="home-hint-card"
      data-hint="install"
      collisionPadding={EDGE}
      sideOffset={OFFSET}
    >
      <Glass className="home-hint-glass">
        <PopoverTitle render={<p />}>
          <GlassCaption>Prompt for a coding agent</GlassCaption>
        </PopoverTitle>
        <code className="home-hint-prompt">
          <Breakable text={prompt} />
        </code>
        <CopyKey object="the prompt for a coding agent" text={prompt} />
      </Glass>
    </PopoverContent>
  </Popover>
);

const Notes = ({ code, name }: { code: string; name: string }) => {
  const siteImports = siteImportsOf(code);

  return (
    <>
      {siteImports.length > 0 ? (
        <p className="home-hint-note">
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
        <p className="home-hint-note">
          Mount <code>{"<FormulaSound />"}</code> once in your app.
        </p>
      ) : null}
    </>
  );
};

/** A plate's number and name. */
export const TileName = ({
  children,
  number,
}: {
  children: ReactNode;
  number: string;
}) => (
  <h3 className="home-tile-name">
    <span aria-hidden="true" className="home-num">
      {number}
    </span>
    {children}
  </h3>
);

/**
 * A component's title as the trigger of its usage code. Resting the pointer
 * on it opens the code; a press, Enter or Space does too, so touch and
 * keyboard reach it. The popup renders in place, so it sits beside the
 * heading rather than inside it.
 */
export const CodeHint = ({
  code,
  name,
  number,
  title,
}: {
  code: string;
  name: string;
  number: string;
  title: string;
}) => (
  <Popover closeDelay={HOVER_CLOSE_DELAY} delay={HOVER_DELAY} openOnHover>
    <TileName number={number}>
      <PopoverTrigger className="home-hint">
        {title}
        <span className="sr-only"> usage code</span>
      </PopoverTrigger>
    </TileName>
    <PopoverContent
      align="start"
      className="home-hint-card"
      data-hint="code"
      collisionPadding={EDGE}
      sideOffset={OFFSET}
    >
      <Glass className="home-hint-glass">
        <div className="home-hint-head">
          <PopoverTitle className="home-hint-title" render={<p />}>
            {title}
          </PopoverTitle>
          <CopyKey object={`the ${title} usage code`} text={code} />
        </div>
        <Notes code={code} name={name} />
        <section
          aria-label={`${title} usage code`}
          className="home-code"
          // oxlint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- a scroll region must be reachable by keyboard
          tabIndex={0}
        >
          <pre>
            <code>{code}</code>
          </pre>
        </section>
      </Glass>
    </PopoverContent>
  </Popover>
);
