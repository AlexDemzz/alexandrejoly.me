"use client";

import { useWindowScroll } from "@uidotdev/usehooks";
import React, { createContext, useState, ReactNode, useEffect } from "react";

interface AppContextState {
  glassesMode: boolean;
  canEnabledGlassesMode: boolean;
  hoverEnabled: boolean;
}

type AppContextValue = [
  AppContextState,
  React.Dispatch<React.SetStateAction<AppContextState>>
];

export const AppContext = createContext<AppContextValue | undefined>(undefined);
export type { AppContextValue };

interface AppProviderProps {
  children: ReactNode;
}

const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [{ y }, scrollTo] = useWindowScroll();
  const [state, setState] = useState<AppContextState>({
    glassesMode: false,
    canEnabledGlassesMode: false,
    hoverEnabled: false,
  });
  const [topReached, setTopReached] = useState(false);

  useEffect(() => {
    if (state.glassesMode) {
      scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [state.glassesMode, scrollTo]);

  useEffect(() => {
    if (y !== 0 && topReached) {
      setState((s) => ({ ...s, glassesMode: false }));
      setTopReached(false);
    }
  }, [y, topReached]);

  useEffect(() => {
    if (y === 0) {
      setTopReached(true);
    }
  }, [y]);

  return (
    <AppContext.Provider value={[state, setState]}>
      {children}
    </AppContext.Provider>
  );
};

export default AppProvider;
