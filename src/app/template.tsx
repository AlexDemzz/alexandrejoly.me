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

  useEffect(() => {
    if (exitComplete) {
      window.scrollTo({ top: 0 });
    }
  }, [pathname, exitComplete]);

  return (
    <>
      <AnimatePresence
        mode="wait"
        initial={false}
        onExitComplete={() => setExitComplete(true)}
      >
        <motion.div key={pathname}>
          <AnimatedGrid />
          <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 1 }}
            transition={{ duration: 0.8, ease: [0.27, 0.94, 0.48, 1.0] }}
            onAnimationStart={() => {
              setExitComplete(false);
            }}
          >
            <FrozenRouter>{children}</FrozenRouter>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </>
  );
}
