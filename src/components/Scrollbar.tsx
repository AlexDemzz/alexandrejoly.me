"use client";
import React, { useEffect, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useWindowSize } from "@uidotdev/usehooks";

const Scrollbar = () => {
  const { height: windowHeight } = useWindowSize();
  const [contentHeight, setContentHeight] = useState(0);
  const { scrollYProgress } = useScroll();
  const scrollbarHeight = 200;

  useEffect(() => {
    const updateContentHeight = () => {
      const body = document.body;
      const html = document.documentElement;
      const height = Math.max(
        body.scrollHeight,
        body.offsetHeight,
        html.clientHeight,
        html.scrollHeight,
        html.offsetHeight
      );
      setContentHeight(height);
    };
    updateContentHeight();
    window.addEventListener("resize", updateContentHeight);
    return () => window.removeEventListener("resize", updateContentHeight);
  }, []);

  const knobHeight = (windowHeight / contentHeight) * scrollbarHeight;

  const knobY = useTransform(
    scrollYProgress,
    [0, 1],
    [0, scrollbarHeight - knobHeight]
  );

  return (
    <div
      className="fixed right-[0.375rem] md:right-5 top-1/2 transform -translate-y-1/2 z-10 h-[200px] w-1 rounded-full"
      style={{ background: "rgba(255,255,255,0.5)" }}
    >
      <motion.div
        style={{ height: knobHeight, y: knobY }}
        className="bg-foreground rounded-full w-full"
      />
    </div>
  );
};

export default Scrollbar;
