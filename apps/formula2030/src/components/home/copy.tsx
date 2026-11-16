import { CheckIcon, CopyIcon } from "@phosphor-icons/react";
import { Fragment, useEffect, useState } from "react";

import { KEY } from "./key";

const COPIED_MS = 3000;

// After "://", after each dot and after each path slash.
const URL_BREAK = /(?<=:\/\/|[^:/]\/|\.)/u;

/** Lets a long URL wrap between its parts instead of mid-word. */
export const Breakable = ({ text }: { text: string }) =>
  text.split(URL_BREAK).map((part, index) => (
    // oxlint-disable-next-line no-array-index-key -- the parts never reorder
    <Fragment key={index}>
      {index > 0 ? <wbr /> : null}
      {part}
    </Fragment>
  ));

/** A copy key for a text shown beside it. */
export const CopyKey = ({ object, text }: { object: string; text: string }) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) {
      return;
    }
    const timer = setTimeout(() => setCopied(false), COPIED_MS);
    return () => clearTimeout(timer);
  }, [copied]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      // A refused clipboard leaves the key as it was.
    }
  };

  return (
    <>
      <button
        className={KEY}
        data-state={copied ? "copied" : "idle"}
        onClick={copy}
        type="button"
      >
        {copied ? (
          <CheckIcon aria-hidden size={20} />
        ) : (
          <CopyIcon aria-hidden size={20} />
        )}
        Copy
        <span className="sr-only"> {object}</span>
      </button>
      <output className="sr-only">{copied ? "Copied" : ""}</output>
    </>
  );
};
