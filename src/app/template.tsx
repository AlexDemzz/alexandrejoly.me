"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { LayoutRouterContext } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { useContext, useRef } from "react";

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
  let pathname = usePathname();
  const numBars = 8;
  const [exitComplete, setExitComplete] = useState(false);
  const [showChildren, setShowChildren] = useState(true);

  useEffect(() => {
    if (exitComplete) {
      window.scrollTo({ top: 0 });
    }
  }, [pathname, exitComplete]);

  return (
    <>
      <AnimatePresence
        mode={"wait"}
        initial={false}
        onExitComplete={() => setExitComplete(true)}
      >
        <motion.div key={pathname}>
          <div className="container h-[100vh] flex items-stretch w-full fixed top-0 right-0 left-0 z-[999] bottom-0 pointer-events-none">
            {new Array(numBars).fill("").map((_, i) => (
              <motion.div
                className={`bg-background border-b-foreground border-b-[1rem] ${
                  i < numBars - 1 ? "border-l" : "border-l border-r"
                } flex-1`}
                initial={{ y: "0%" }}
                animate={{ y: "-100%" }}
                exit={{ y: "0%" }}
                transition={{ delay: i * 0.05, tension: 180, friction: 12 }}
                key={`grid-elem-${i}`}
                onAnimationComplete={() => {
                  if (i === numBars - 1) {
                    setShowChildren(true);
                  }
                }}
              />
            ))}
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: [0.27, 0.94, 0.48, 1.0] }}
            onAnimationStart={() => setExitComplete(false)}
          >
            {showChildren && <FrozenRouter>{children}</FrozenRouter>}
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </>
  );
}
