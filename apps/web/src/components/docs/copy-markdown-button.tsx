import { textLinkVariants } from "@portfolio/ui/components/text";
import { useEffect, useState } from "react";

const COPIED_DURATION = 2000;

export const CopyMarkdownButton = ({ markdown }: { markdown: string }) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) {
      return;
    }
    const timeout = setTimeout(() => setCopied(false), COPIED_DURATION);
    return () => clearTimeout(timeout);
  }, [copied]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(markdown);
      setCopied(true);
    } catch {
      // The label stays "Copy Markdown", so the reader can try again.
    }
  };

  return (
    <>
      <button className={textLinkVariants()} onClick={copy} type="button">
        {copied ? "Copied" : "Copy Markdown"}
      </button>
      <span aria-live="polite" className="sr-only">
        {copied ? "Copied" : ""}
      </span>
    </>
  );
};
