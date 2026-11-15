import { Fragment, useEffect, useState } from "react";
import type { RefObject } from "react";

import { CheckGlyph, CopyGlyph } from "@/components/glyphs";

type CopyState = "idle" | "copied" | "selected";

const COPIED_MS = 2000;
const COPIED = "Copied to the clipboard";
const FALLBACK = "Selected. Press Ctrl+C or ⌘C to copy.";

// After "://", after each dot and after each path slash.
const URL_BREAK = /(?<=:\/\/|[^:/]\/|\.)/u;

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

const statusOf = (state: CopyState) => {
  if (state === "copied") {
    return COPIED;
  }
  return state === "selected" ? FALLBACK : "";
};

/** Copies the text, or selects its source when the clipboard is refused. */
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
    const selection = window.getSelection();
    if (source.current && selection) {
      selection.selectAllChildren(source.current);
    }
    setState("selected");
  };

  return { copy, state };
};

/** Lets a long URL wrap between its parts instead of mid-word. */
export const Breakable = ({ text }: { text: string }) =>
  text.split(URL_BREAK).map((part, index) => (
    // oxlint-disable-next-line no-array-index-key -- the parts never reorder
    <Fragment key={index}>
      {index > 0 ? <wbr /> : null}
      {part}
    </Fragment>
  ));

/** Its visible word starts the accessible name; the object follows unseen. */
const Key = ({
  object,
  onClick,
  state,
}: {
  object: string;
  onClick: () => void;
  state: CopyState;
}) => (
  <button
    className="home-key"
    data-state={state}
    onClick={onClick}
    type="button"
  >
    {state === "copied" ? <CheckGlyph /> : <CopyGlyph />}
    {state === "copied" ? "Copied" : "Copy"}
    <span className="sr-only"> {object}</span>
  </button>
);

/** A copy key for a text shown beside it. */
export const CopyKey = ({
  object,
  source,
  text,
}: {
  object: string;
  source: RefObject<HTMLElement | null>;
  text: string;
}) => {
  const { copy, state } = useCopy(text, source);

  return (
    <div className="home-copy-key">
      <Key object={object} onClick={copy} state={state} />
      <span aria-hidden="true" className="home-copy-status">
        {statusOf(state)}
      </span>
      <output className="sr-only">{statusOf(state)}</output>
    </div>
  );
};
