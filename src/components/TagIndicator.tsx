import { MOTION_TRANSITION } from "@/lib/constants";
import { motion, useInView } from "framer-motion";
import React, { useEffect, useRef, useState } from "react";

const getRandomChar = () => {
  const chars = "!#$%&()*+,-./:;<=>?@[]^_{|}~";
  return chars[Math.floor(Math.random() * chars.length)];
};

const TagIndicator = ({
  children,
  tag,
  position = "bottom",
  className = "",
  delay = 0,
  animate = true,
}) => {
  const height = 24;
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <div className={`relative ${className}`} ref={ref}>
      {children}
      <div
        className={`absolute select-none overflow-hidden h-[24px] ${
          position === "bottom" && "bottom-[-24px]"
        } ${position === "top" && "top-[-24px]"}`}
      >
        <motion.div
          initial={{ y: height }}
          animate={{ y: isInView ? 0 : height }}
          transition={{ delay: delay / 1000, ...MOTION_TRANSITION }}
          className={`font-mono bg-foreground text-background font-bold left-0 text-sm`}
        >
          <span>{"<"}</span>
          {tag}
          <span>{"/>"}</span>
        </motion.div>
      </div>
    </div>
  );
};

export default TagIndicator;
