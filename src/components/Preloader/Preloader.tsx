"use client";

import Loading from "@/components/Loading";
import AnimatedGrid from "@/components/AnimatedGrid";
import Portal from "@/components/Portal";
import React, { useState } from "react";
import { motion } from "framer-motion";

const Preloader: React.FC<{ onLoad: () => void }> = ({ onLoad }) => {
  const [isComplete, setIsComplete] = useState(false);
  const [triggerAnimation, setTriggerAnimation] = useState(false);

  const handleAnimationEnd = () => {
    onLoad();
    setTriggerAnimation(true);
  };

  const handleComplete = () => {
    setIsComplete(true);
  };

  return (
    <Portal>
      {!isComplete && (
        <>
          <div className="fixed top-0 left-0 right-0 bottom-0 flex items-center justify-center z-[9999] pointer-events-none">
            <motion.div
              className="w-full"
              initial={{ y: 0, opacity: 1 }}
              animate={{
                y: triggerAnimation ? -200 : 0,
                opacity: triggerAnimation ? 0 : 1,
                transition: { delay: 0.1 },
              }}
            >
              <Loading onComplete={handleAnimationEnd} />
            </motion.div>
          </div>
          <AnimatedGrid
            animate={triggerAnimation}
            onAnimationEnd={handleComplete}
          />
        </>
      )}
    </Portal>
  );
};

export default Preloader;
