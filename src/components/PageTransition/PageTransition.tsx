"use client";
import { AnimatePresence, motion } from "framer-motion";
import { AppProps } from "next/app";
import { LayoutRouterContext } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { usePathname } from "next/navigation";
import {
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

function FrozenRouter(props: { children: React.ReactNode }) {
  const context = useContext(LayoutRouterContext ?? {});
  const frozen = useRef(context).current;

  if (!frozen) {
    return <>{props.children}</>;
  }

  return (
    <LayoutRouterContext.Provider value={frozen}>
      {props.children}
    </LayoutRouterContext.Provider>
  );
}

const PageTransition = ({ children }) => {
  const [showChildren, setShowChildren] = useState(true);
  const pathname = usePathname();
  const numBars = 8;

  return (
    <div>
      <AnimatePresence mode="wait" initial={false}>
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
                  if (i === numBars - 3) {
                    setShowChildren(true);
                    console.log("lol");
                  }
                }}
              />
            ))}
          </div>
          <motion.div
            onAnimationStart={() => setShowChildren(false)}
            initial={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 1 } }}
          >
            {showChildren && children}
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default PageTransition;
