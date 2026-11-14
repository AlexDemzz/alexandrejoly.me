import { Fragment, useEffect, useRef, useState } from "react";
import type { RefObject } from "react";

import { CheckGlyph, CopyGlyph } from "@/components/glyphs";
import { Button } from "@/registry/formula/ui/formula/button";
import {
  Glass,
  GlassCaption,
  GlassBrackets,
} from "@/registry/formula/ui/formula/glass";

type CopyState = "idle" | "copied" | "selected";

const COPIED_MS = 2000;

const writeClipboard = async (text: string) => {
  if (!navigator.clipboard?.writeText) {
    return false;
  }
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
};

const selectContents = (node: HTMLElement | null) => {
  const selection = window.getSelection();
  if (node && selection) {
    selection.selectAllChildren(node);
  }
};

const useCopy = (text: string, source: RefObject<HTMLElement | null>) => {
  const [state, setState] = useState<CopyState>("idle");

  useEffect(() => {
    if (state !== "copied") {
      return;
    }
    const timer = setTimeout(() => setState("idle"), COPIED_MS);
    return () => clearTimeout(timer);
  }, [state]);

  const copy = async () => {
    if (await writeClipboard(text)) {
      setState("copied");
      return;
    }
    selectContents(source.current);
    setState("selected");
  };

  return { copy, state };
};

// After a path slash, but never inside "://".
const URL_BREAK = /(?<=[^:/]\/)/u;

/** Lets a long URL wrap after its path slashes instead of mid-word. */
const Breakable = ({ text }: { text: string }) =>
  text.split(URL_BREAK).map((part, index) => (
    // oxlint-disable-next-line no-array-index-key -- the parts never reorder
    <Fragment key={index}>
      {index > 0 ? <wbr /> : null}
      {part}
    </Fragment>
  ));

const FALLBACK = "Selected. Press Ctrl+C or ⌘C to copy.";

/** A long text on glass, with a labelled copy key on the plate below it. */
export const CopyBlock = ({
  action,
  caption,
  text,
}: {
  action: string;
  caption: string;
  text: string;
}) => {
  const source = useRef<HTMLElement>(null);
  const { copy, state } = useCopy(text, source);

  return (
    <div className="copy-block">
      <Glass className="copy-block-glass">
        <GlassBrackets />
        <GlassCaption>{caption}</GlassCaption>
        <code className="copy-block-text" ref={source}>
          <Breakable text={text} />
        </code>
      </Glass>
      <div className="copy-block-plate">
        <Button onClick={copy} pendingAnnouncement="">
          {state === "copied" ? <CheckGlyph /> : <CopyGlyph />}
          {action}
        </Button>
        <output className="copy-status" data-state={state}>
          {state === "copied" ? "Copied to the clipboard" : null}
          {state === "selected" ? FALLBACK : null}
        </output>
      </div>
    </div>
  );
};

/** One install command with an icon copy key; its caption shows the copy status. */
export const CopyCommand = ({
  label,
  text,
}: {
  label: string;
  text: string;
}) => {
  const source = useRef<HTMLElement>(null);
  const { copy, state } = useCopy(text, source);

  return (
    <div className="copy-command">
      <span
        aria-hidden="true"
        className="copy-command-caption"
        data-state={state}
      >
        {state === "idle" ? "Install" : null}
        {state === "copied" ? "Copied to the clipboard" : null}
        {state === "selected" ? FALLBACK : null}
      </span>
      <output className="sr-only">
        {state === "copied" ? "Copied to the clipboard" : null}
        {state === "selected" ? FALLBACK : null}
      </output>
      <code className="copy-command-text" ref={source}>
        <Breakable text={text} />
      </code>
      <Button
        aria-label={label}
        className="copy-command-key"
        onClick={copy}
        pendingAnnouncement=""
        size="icon"
      >
        {state === "copied" ? <CheckGlyph /> : <CopyGlyph />}
      </Button>
    </div>
  );
};
