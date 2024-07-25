"use client";
import { MOTION_TRANSITION } from "@/lib/constants";
import {
  motion,
  useInView,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { useEffect, useRef, useState } from "react";

const ParallaxItem = ({
  children,
  className = "",
  speed = 5,
  overflow = true,
  delay,
  range = [-100, 100],
}) => {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true });
  const [childrenHeight, setChildrenHeight] = useState("100%");
  const childRef = useRef(null);

  useEffect(() => {
    const updateHeight = () => {
      if (childRef.current) {
        const rangeHeight = Math.abs(range[1] - range[0]);
        const newHeight = childRef.current.scrollHeight - rangeHeight;
        console.log("newHeight", newHeight);
        console.log(rangeHeight);
        setChildrenHeight(newHeight + "px");
      }
    };
    if (!overflow) {
      updateHeight();
      window.addEventListener("resize", updateHeight);
    }
    return () => {
      if (!overflow) window.removeEventListener("resize", updateHeight);
    };
  }, [overflow, range]);

  const tension = 200 - speed * 20;
  const friction = 20 + speed * 10;

  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], range);

  const ySpring = useSpring(y, { stiffness: tension, damping: friction });

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{
        delay: delay / 1000,
        opacity: isInView ? 1 : 0,
        y: isInView ? 0 : 50,
      }}
      transition={{
        ...MOTION_TRANSITION,
      }}
      ref={containerRef}
      className={`flex justify-center flex-col ${className}`}
      style={{
        height: overflow ? undefined : childrenHeight,
        overflow: overflow ? undefined : "hidden",
      }}
    >
      <motion.div style={{ y: ySpring }} ref={childRef}>
        {children}
      </motion.div>
    </motion.div>
  );
};

export default ParallaxItem;
