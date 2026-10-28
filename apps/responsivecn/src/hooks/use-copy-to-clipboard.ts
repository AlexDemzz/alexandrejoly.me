import * as React from "react";

// Copy text to the clipboard and briefly flag what was copied. `copied` holds
// the key of the last successful copy (defaults to the copied text) and resets
// after `timeout`; pass an explicit key to tell multiple copy targets apart.
export const useCopyToClipboard = ({ timeout = 2000 } = {}) => {
  const [copied, setCopied] = React.useState<string | null>(null);
  const resetTimer = React.useRef(0);

  React.useEffect(() => () => window.clearTimeout(resetTimer.current), []);

  const copy = React.useCallback(
    async (text: string, key: string = text) => {
      try {
        await navigator.clipboard.writeText(text);
      } catch {
        return;
      }
      setCopied(key);
      window.clearTimeout(resetTimer.current);
      resetTimer.current = window.setTimeout(() => setCopied(null), timeout);
    },
    [timeout]
  );

  return { copied, copy };
};
