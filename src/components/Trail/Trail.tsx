"use client";
import { DEFAULT_TRANSITION, MOTION_TRANSITION } from "@/lib/constants";
import { motion, useInView } from "framer-motion";
import React, { useState, useEffect, useRef } from "react";

const Trail = ({
  children,
  className = "",
  delay = 0,
  noSplit = false,
  as: Component = "div",
  split = /(\s+)/,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  noSplit?: boolean;
  split?: RegExp | string;
  as?: keyof JSX.IntrinsicElements | React.ElementType;
}) => {
  const items = React.Children.toArray(
    noSplit || typeof children !== "string" ? children : children.split(split)
  );
  const tempRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);
  const inViewRef = useRef(null);
  const isInView = useInView(inViewRef, { once: true });

  const updateHeight = () => {
    if (tempRef.current && tempRef.current.offsetHeight > 0) {
      setHeight(tempRef.current.offsetHeight);
    }
  };

  useEffect(() => {
    updateHeight();
    window.addEventListener("resize", updateHeight);
    return () => {
      window.removeEventListener("resize", updateHeight);
    };
  }, [isInView]);

  return (
    <Component ref={inViewRef}>
      {/* Temp element to measure height */}
      <span ref={tempRef} className={`invisible absolute ${className}`}>
        {items[0]}
      </span>
      {!height && <span className={`${className} opacity-0`}>{items[0]}</span>}

      {!!height &&
        items.map((item, index) => (
          <span
            style={{ height }}
            className="overflow-y-hidden inline-block"
            key={index}
          >
            <motion.span
              initial={{ opacity: 0, y: height }}
              animate={{ opacity: isInView ? 1 : 0, y: isInView ? 0 : height }}
              transition={{
                delay: index * 0.02 + delay / 1000,
                ...DEFAULT_TRANSITION,
              }}
              style={{ display: "inline-block", whiteSpace: "pre" }}
              className={className}
            >
              {item}
            </motion.span>
          </span>
        ))}
    </Component>
  );
};

export default Trail;
