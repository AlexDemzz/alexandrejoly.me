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

/*
 * Hints: a dotted underline marks text that opens a popover, on hover or on
 * a press. The popover is a pane of glass beside its trigger, so its colour
 * roles are glass whatever ground it was opened on.
 */
const TRIGGER =
  "focus-ring inline cursor-pointer touch-manipulation rounded-xs text-start underline decoration-current/55 decoration-dotted decoration-1 underline-offset-4 transition-colors duration-150 ease-out hover:decoration-current data-open:decoration-current";

const CARD =
  "ground-glass origin-(--transform-origin) text-sm/normal font-normal tracking-normal text-fg shadow-pane transition-opacity duration-150 ease-formula data-ending-style:opacity-0 data-starting-style:opacity-0 motion-safe:transition motion-safe:data-ending-style:scale-96 motion-safe:data-starting-style:scale-96";

const PANE = "flex max-h-[min(32rem,70svh)] flex-col gap-3";

const NOTE = "flex-none text-dim";

/** The prompt for a coding agent, on glass under the trigger that opens it. */
export const InstallHint = ({ prompt }: { prompt: string }) => (
  <Popover>
    <PopoverTrigger className={TRIGGER}>Installation prompt</PopoverTrigger>
    <PopoverContent
      align="start"
      className={`${CARD} w-[min(28rem,100vw-2rem)]`}
      collisionPadding={EDGE}
      sideOffset={OFFSET}
    >
      <Glass className={PANE} data-hint-glass>
        <PopoverTitle render={<p />}>
          <GlassCaption>Prompt for a coding agent</GlassCaption>
        </PopoverTitle>
        <code className="selection:bg-lamp/35 font-normal wrap-break-word">
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
        <p className={NOTE}>
          Replace{" "}
          {siteImports.map((path, index) => (
            <Fragment key={path}>
              {index > 0 ? " and " : null}
              <code className="font-medium">{path}</code>
            </Fragment>
          ))}{" "}
          with your own.
        </p>
      ) : null}
      {name === "sound" ? (
        <p className={NOTE}>
          Mount <code className="font-medium">{"<FormulaSound />"}</code> once
          in your app.
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
  <h3 className="flex items-baseline gap-2 px-3.5 pt-3 pb-2.5 text-sm/[1.3] font-medium">
    <span aria-hidden="true" className="text-xs font-normal tabular-nums">
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
      <PopoverTrigger className={TRIGGER}>
        {title}
        <span className="sr-only"> usage code</span>
      </PopoverTrigger>
    </TileName>
    <PopoverContent
      align="start"
      className={`${CARD} w-[min(36rem,100vw-2rem)]`}
      collisionPadding={EDGE}
      sideOffset={OFFSET}
    >
      <Glass className={PANE} data-hint-glass>
        <div className="flex flex-none flex-wrap items-center justify-between gap-x-4 gap-y-2">
          <PopoverTitle className="text-base/[1.3] font-medium" render={<p />}>
            {title}
          </PopoverTitle>
          <CopyKey object={`the ${title} usage code`} text={code} />
        </div>
        <Notes code={code} name={name} />
        {/* The whole source shows; only long lines scroll, inside the block. */}
        <section
          aria-label={`${title} usage code`}
          className="focus-ring border-line -mx-4.5 -mb-4.5 min-h-0 flex-1 overflow-auto overscroll-contain border-t [--focus-offset:-4px]"
          // oxlint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- a scroll region must be reachable by keyboard
          tabIndex={0}
        >
          <pre className="w-max min-w-full px-4.5 pt-3.5 pb-4.5">
            <code className="selection:bg-lamp/35 font-mono text-sm/[1.6] font-normal whitespace-pre [tab-size:2]">
              {code}
            </code>
          </pre>
        </section>
      </Glass>
    </PopoverContent>
  </Popover>
);
