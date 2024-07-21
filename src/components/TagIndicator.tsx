import { config, useSpring, animated } from "@react-spring/web";
import React, { useEffect, useState } from "react";

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
  const [show, setShow] = useState(false);

  const style = useSpring({
    y: show ? 0 : height,
    from: { y: height },
    delay,
  });

  useEffect(() => {
    setShow(true);
  }, []);

  return (
    <div className={`relative ${className}`}>
      {children}
      <div
        className={`absolute select-none overflow-hidden h-[24px] ${
          position === "bottom" && "bottom-[-24px]"
        } ${position === "top" && "top-[-24px]"}`}
      >
        <animated.div
          style={animate ? style : {}}
          className={`font-mono bg-foreground text-background font-bold left-0 text-sm`}
        >
          <span>{"<"}</span>
          {tag}
          <span>{"/>"}</span>
        </animated.div>
      </div>
    </div>
  );
};

export default TagIndicator;
