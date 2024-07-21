"use client";
import React from "react";
import {
  useSpring,
  animated,
  useScroll,
  useIsomorphicLayoutEffect,
} from "@react-spring/web";
import Image from "next/image";

const ScrollImage = ({ children, className = "", speed = 5 }) => {
  // Calculez la tension et la friction en fonction de la valeur de speed
  const tension = 200 - speed * 20;
  const friction = 20 + speed * 10;

  const { scrollYProgress } = useScroll();

  const [springs, api] = useSpring(() => ({
    y: 0,
  }));

  useIsomorphicLayoutEffect(() => {
    api.start({
      from: {
        y: 0,
      },
      to: {
        y: scrollYProgress.to([0, 1], [-100, 100]),
      },
      config: { tension, friction },
    });
  }, [scrollYProgress]);

  return (
    <div className={`${className}`}>
      <div className="flex justify-center flex-col h-full">
        <animated.div style={springs}>{children}</animated.div>
      </div>
    </div>
  );
};

export default ScrollImage;
