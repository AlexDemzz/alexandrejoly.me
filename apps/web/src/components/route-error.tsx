import { Button } from "@portfolio/ui/components/button";
import type { ErrorComponentProps } from "@tanstack/react-router";
import { useEffect, useMemo } from "react";

import Loader from "./loader";

const RELOAD_STORAGE_KEY = "chunk-reload";
const MAX_RELOADS = 3;
const RELOAD_WINDOW_MS = 60_000;
const BASE_RELOAD_DELAY_MS = 1000;

// Chrome, Firefox and Safari wordings for a dynamic import that 404s.
const MODULE_NOT_FOUND_MESSAGES = [
  "Failed to fetch dynamically imported module",
  "error loading dynamically imported module",
  "Importing a module script failed",
];

const isModuleNotFoundError = (error: unknown) =>
  error instanceof Error &&
  MODULE_NOT_FOUND_MESSAGES.some((message) =>
    error.message.startsWith(message)
  );

interface ReloadState {
  count: number;
  firstAt: number;
}

// Without storage the reload loop cannot be bounded, so report no state.
const readReloadState = (now: number): ReloadState | undefined => {
  try {
    const stored = sessionStorage.getItem(RELOAD_STORAGE_KEY);
    const state = stored ? (JSON.parse(stored) as ReloadState) : undefined;
    if (state && now - state.firstAt < RELOAD_WINDOW_MS) {
      return state;
    }
    return { count: 0, firstAt: now };
  } catch {
    return undefined;
  }
};

const canReload = () => {
  const state = readReloadState(Date.now());
  return state !== undefined && state.count < MAX_RELOADS;
};

/*
 * Right after a deploy, the HTML can reference chunks that are not yet on
 * every edge, and an open tab can reference chunks that no longer exist.
 * Reload a few times with backoff before giving up.
 */
const scheduleReload = () => {
  const state = readReloadState(Date.now()) ?? { count: 0, firstAt: 0 };
  try {
    sessionStorage.setItem(
      RELOAD_STORAGE_KEY,
      JSON.stringify({ ...state, count: state.count + 1 })
    );
  } catch {
    // canReload already checked storage; nothing else to do.
  }
  const delay = BASE_RELOAD_DELAY_MS * 2 ** state.count;
  const timeout = window.setTimeout(() => window.location.reload(), delay);
  return () => window.clearTimeout(timeout);
};

const RouteError = ({ error }: ErrorComponentProps) => {
  const isReloading = useMemo(
    () => isModuleNotFoundError(error) && canReload(),
    [error]
  );

  useEffect(() => (isReloading ? scheduleReload() : undefined), [isReloading]);

  if (isReloading) {
    return <Loader />;
  }

  return (
    <div className="flex flex-col items-center gap-4 px-4 pt-16 text-center">
      <p className="text-muted-foreground text-sm">Something went wrong.</p>
      <Button onClick={() => window.location.reload()} variant="outline">
        Reload
      </Button>
    </div>
  );
};

export default RouteError;
