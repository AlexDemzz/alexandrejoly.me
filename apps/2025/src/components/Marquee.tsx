"use client";
import { motion, useAnimationControls } from "framer-motion";
import React, { useEffect, useRef, useState } from "react";

type MarqueeProps = React.PropsWithChildren<{}>;

const Marquee: React.FC<MarqueeProps> = ({ children }) => {
  const [duration, setDuration] = useState(3);
  const marqueeRef = useRef<HTMLDivElement>(null);
  const controls = useAnimationControls();

  useEffect(() => {
    const calculateDuration = () => {
      if (marqueeRef.current) {
        const width = marqueeRef.current.offsetWidth;
        // Adjust the duration based on the width (e.g., larger width -> longer duration)
        const newDuration = width / 500; // Adjust this ratio as needed
        setDuration(newDuration);
      }
    };

    calculateDuration();
    window.addEventListener("resize", calculateDuration);

    return () => window.removeEventListener("resize", calculateDuration);
  }, [children]);

  useEffect(() => {
    controls.start({
      x: ["0%", "-50%"],
      transition: {
        x: {
          repeat: Infinity,
          repeatType: "loop",
          duration: duration,
          ease: "linear",
        },
      },
    });
    return () => controls.stop();
  }, [controls, duration]);

  return (
    <div className="whitespace-nowrap">
      <motion.div className="inline-block" animate={controls} ref={marqueeRef}>
        <span className="mr-8">{children}</span>
        <span className="mr-8">{children}</span>
      </motion.div>
    </div>
  );
};

export default Marquee;
