"use client";
import React, { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useWindowScroll, useWindowSize } from "@uidotdev/usehooks";

const Scrollbar = () => {
  const constraintsRef = useRef(null);
  const { height: windowHeight } = useWindowSize();
  const [_, scrollTo] = useWindowScroll();
  const [contentHeight, setContentHeight] = useState(1);
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

  const knobHeight = ((windowHeight || 1) / contentHeight) * scrollbarHeight;

  // const knobY = 0;
  const knobY = useTransform(
    scrollYProgress,
    [0, 1],
    [0, scrollbarHeight - knobHeight]
  );

  // const handleDrag = (event, info) => {
  //   const lol = constraintsRef.current.getBoundingClientRect();
  //   const progression = info.point.y - lol.top;

  //   // Calcul du pourcentage de progression
  //   let progress = (progression / lol.height) * 100;

  //   // Assurer que le pourcentage soit entre 0 et 100
  //   progress = Math.min(Math.max(progress, 0), 100);

  //   // Calculer la nouvelle position de défilement
  //   const newScrollY = (progress / 100) * (contentHeight - windowHeight);

  //   console.log("Progression en pixels:", progression);
  //   console.log("Progression en pourcentage:", progress, "%");
  //   console.log("Nouvelle position de défilement:", newScrollY);

  //   // Faire défiler la fenêtre à la nouvelle position
  //   window.scrollTo({ top: newScrollY });
  // };

  return (
    <div
      ref={constraintsRef}
      // type="button"
      className="fixed right-[0.375rem] md:right-5 top-1/2 transform -translate-y-1/2 z-50 h-[200px] w-1 rounded-full hidden md:block"
      style={{ background: "rgba(255,255,255,0.5)" }}
    >
      <motion.div
        style={{ height: knobHeight, y: knobY }}
        className="bg-foreground rounded-full w-full"
        // drag="y"
        // dragElastic={0}
        // dragConstraints={constraintsRef}
        // onDrag={handleDrag}
      />
    </div>
  );
};

export default Scrollbar;
