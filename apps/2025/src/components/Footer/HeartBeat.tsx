"use client";
import { motion, useAnimationControls } from "framer-motion";
import { useEffect } from "react";

const HeartBeat = () => {
  const controls = useAnimationControls();

  useEffect(() => {
    const startBeat = async () => {
      while (true) {
        await controls.start({
          scale: 1.2,
          transition: { duration: 0.2, ease: "easeInOut" },
        });
        await controls.start({
          scale: 1,
          transition: { duration: 0.2, ease: "easeInOut" },
        });
        await new Promise((resolve) => setTimeout(resolve, 10));
        await controls.start({
          scale: 1.2,
          transition: { duration: 0.2, ease: "easeInOut" },
        });
        await controls.start({
          scale: 1,
          transition: { duration: 0.2, ease: "easeInOut" },
        });
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    };
    startBeat();
    return () => controls.stop();
  }, [controls]);

  return (
    <motion.span animate={controls} className="inline-block">
      ♥
    </motion.span>
  );
};

export default HeartBeat;
