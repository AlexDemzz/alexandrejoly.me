import { useEffect, useState } from "react";

const FLASH_MS = 2000;

// A state that falls back to `rest` a moment after each `flash`, e.g. a
// "Copied" label.
export const useFlash = <T>(rest: T, ms = FLASH_MS) => {
  const [flashed, setFlashed] = useState<{ value: T } | null>(null);

  useEffect(() => {
    if (!flashed) {
      return;
    }
    const timeout = window.setTimeout(() => setFlashed(null), ms);
    return () => window.clearTimeout(timeout);
  }, [flashed, ms]);

  const flash = (value: T) => setFlashed({ value });
  return [flashed ? flashed.value : rest, flash] as const;
};
