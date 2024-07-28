"use client";
import { AnimatePresence, motion } from "framer-motion";
import AnimatedLink from "@/components/AnimatedLink";
import { DEFAULT_TRANSITION, EMAIL } from "@/lib/constants";
import { useApp, useTime } from "@/lib/hooks";
import Logo from "../Logo";

const Header = () => {
  const [{ glassesMode }] = useApp();
  const time = useTime();

  return (
    <div className="fixed top-0 z-50 right-0 left-0 mix-blend-difference">
      <div className="container">
        <div className="flex justify-between items-center w-full py-6 relative z-20">
          <AnimatedLink href="/" scroll={false}>
            <Logo />
          </AnimatedLink>
          <AnimatePresence>
            {!glassesMode && (
              <motion.div
                className="absolute left-0 right-0 pointer-events-none flex items-center justify-center"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ ...DEFAULT_TRANSITION }}
              >
                <div className="bg-foreground text-background font-mono text-sm font-bold px-1 hidden sm:inline-block">
                  GENEVA, {time.toString()}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <nav className="flex items-center gap-7">
            <AnimatedLink
              href={`mailto:${EMAIL}`}
              className="uppercase font-bold md:text-base"
            >
              Contact
            </AnimatedLink>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default Header;
