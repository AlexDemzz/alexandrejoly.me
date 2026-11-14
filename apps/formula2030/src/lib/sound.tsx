import { createContext, use, useMemo, useSyncExternalStore } from "react";
import type { ReactNode } from "react";

import { FormulaSound } from "@/registry/formula/ui/formula/sound";

interface SoundState {
  on: boolean;
  setOn: (on: boolean) => void;
}

const STORAGE_KEY = "formula2030:sound";
const listeners = new Set<() => void>();
// Holds the choice for this visit when storage is unavailable (private mode).
let remembered: boolean | null = null;

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
};

const readOn = () => {
  if (remembered !== null) {
    return remembered;
  }
  try {
    return localStorage.getItem(STORAGE_KEY) !== "off";
  } catch {
    return true;
  }
};

const writeOn = (on: boolean) => {
  remembered = on;
  try {
    localStorage.setItem(STORAGE_KEY, on ? "on" : "off");
  } catch {
    // Storage is blocked: `remembered` keeps the choice until the page closes.
  }
  for (const listener of listeners) {
    listener();
  }
};

// The server cannot know the visitor's choice, so it renders the default.
const serverOn = () => true;

const SoundContext = createContext<SoundState | null>(null);

/** Interaction sounds for the whole page: on by default, remembered across visits. */
export const SoundProvider = ({ children }: { children: ReactNode }) => {
  const on = useSyncExternalStore(subscribe, readOn, serverOn);
  const value = useMemo(() => ({ on, setOn: writeOn }), [on]);

  return (
    <SoundContext value={value}>
      {children}
      <FormulaSound muted={!on} />
    </SoundContext>
  );
};

export const useSound = () => {
  const state = use(SoundContext);
  if (!state) {
    throw new Error("useSound needs a SoundProvider above it.");
  }
  return state;
};
