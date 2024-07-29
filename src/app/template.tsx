"use client";

import AnimatedGrid from "@/components/AnimatedGrid";
import { AnimatePresence, motion } from "framer-motion";
import { LayoutRouterContext } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { usePathname } from "next/navigation";
import React, { useContext, useEffect, useRef, useState } from "react";

function FrozenRouter(props: { children: React.ReactNode }) {
  const context = useContext(LayoutRouterContext ?? {});
  const frozen = useRef(context).current;

  return (
    <LayoutRouterContext.Provider value={frozen}>
      {props.children}
    </LayoutRouterContext.Provider>
  );
}

export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [exitComplete, setExitComplete] = useState(false);
  const [showChildren, setShowChildren] = useState(true);

  useEffect(() => {
    if (exitComplete) {
      window.scrollTo({ top: 0 });
      setShowChildren(false);
      setTimeout(() => {
        setShowChildren(true);
      }, 100);
    }
  }, [pathname, exitComplete]);

  useEffect(() => {
    return () => {
      setShowChildren(true);
    };
  }, [pathname]);

  return (
    <>
      <AnimatePresence
        mode="wait"
        initial={false}
        onExitComplete={() => setExitComplete(true)}
      >
        <motion.div key={pathname}>
          <AnimatedGrid
            onAnimationStart={() => {
              setExitComplete(false);
            }}
          />
          <FrozenRouter>{showChildren && children}</FrozenRouter>
        </motion.div>
      </AnimatePresence>
    </>
  );
}
