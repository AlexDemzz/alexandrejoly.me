"use client";

import React, { createContext, useState, ReactNode } from "react";

interface AppContextState {
  glassesMode: boolean;
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
  const [state, setState] = useState<AppContextState>({ glassesMode: false });

  return (
    <AppContext.Provider value={[state, setState]}>
      {children}
    </AppContext.Provider>
  );
};

export default AppProvider;
