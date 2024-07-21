"use client";

import Preloader from "@/components/Preloader";
import React, { createContext, ReactNode, useState } from "react";

interface PreloaderContextType {
  isLoaded: boolean;
  setIsLoaded: (isLoaded: boolean) => void;
}

export const PreloaderContext = createContext<PreloaderContextType | undefined>(
  undefined
);

const PreloaderProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isLoaded, setIsLoaded] = useState(false);

  console.log("isLoaded", isLoaded);

  return (
    <PreloaderContext.Provider value={{ isLoaded, setIsLoaded }}>
      {/* <Preloader onLoad={() => setIsLoaded(true)} /> */}
      {/* {isLoaded && children} */}
      {children}
    </PreloaderContext.Provider>
  );
};

export default PreloaderProvider;
