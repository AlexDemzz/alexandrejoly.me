"use client";
import React, { useEffect, useRef, useState } from "react";
import { motion, useAnimationControls } from "framer-motion";
import { useMouseAcceleration } from "@/lib/hooks";

const Marquee = ({ children }) => {
  const [duration, setDuration] = useState(3); // Initial duration
  const marqueeRef = useRef(null);
  const controls = useAnimationControls();
  const mouseAcceleration = useMouseAcceleration();

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
