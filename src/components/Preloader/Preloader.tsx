"use client";

import React, { useEffect, useState } from "react";
import { useSpring, animated, config, Spring } from "@react-spring/web";
import Logo from "../Logo";
import BarLoader from "./BarLoader";

const Preloader: React.FC<{ onLoad: () => void }> = ({ onLoad }) => {
  const originalWarn = console.warn;
  console.warn = (message) => {
    if (
      message.includes(
        "Cannot call the manual advancement of rafz whilst frameLoop is not set as demand"
      )
    ) {
      return;
    }
    originalWarn(message);
  };

  const [triggerAnimation, setTriggerAnimation] = useState(false);
  const [percent, setPercent] = useState(0);
  const [oldPercent, setOldPercent] = useState(0);

  const handleAnimationEnd = () => {
    setTriggerAnimation(true);
  };

  useEffect(() => {
    setTimeout(() => {
      setPercent(50);
    }, 500);

    setTimeout(() => {
      setOldPercent(percent);
      setPercent(100);
    }, 1000);
  }, [onLoad, percent]);

  const animations = new Array(8).fill("").map((_, i) => {
    const delay = i * 50;
    return useSpring({
      from: { y: "2%" },
      to: {
        y: triggerAnimation ? "-110%" : "2%",
      },
      config: config.slow,
      delay: delay,
    });
  });

  const loaderStyle = useSpring({
    from: { y: "0%", opacity: 1 },
    to: {
      y: triggerAnimation ? "-60%" : "0%",
      opacity: triggerAnimation ? 0 : 1,
    },
    config: config.wobbly,
    onRest: () => {
      onLoad();
    },
  });

  return (
    <div className="container h-[100vh] flex items-stretch w-full fixed top-0 right-0 left-0 z-[999] bottom-0 pointer-events-none">
      <animated.div
        style={{ ...loaderStyle }}
        className="flex items-center justify-center absolute top-0 right-0 bottom-0 left-0 z-10"
      >
        <div className="gap-2 flex items-center justify-center flex-col">
          <div>
            <BarLoader
              percent={percent}
              oldPercent={oldPercent}
              onAnimationEnd={handleAnimationEnd}
            />
          </div>
        </div>
      </animated.div>
      {animations.map((springProps, i, arr) => (
        <animated.div
          className={`bg-background border-b-foreground border-b-[1rem] ${
            i < arr.length - 1 ? "border-l" : "border-l border-r"
          } flex-1`}
          style={springProps}
          key={`grid-elem-${i}`}
        />
      ))}
    </div>
  );
};

export default Preloader;
