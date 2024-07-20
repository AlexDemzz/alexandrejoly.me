import React from "react";

const getRandomChar = () => {
  const chars = "!#$%&()*+,-./:;<=>?@[]^_{|}~";
  return chars[Math.floor(Math.random() * chars.length)];
};

const TagIndicator = ({
  children,
  tag,
  position = "bottom",
  className = "",
}) => {
  return (
    <div className={`relative ${className}`}>
      {children}
      <div
        className={`font-mono bg-foreground text-background inline font-bold absolute select-none ${
          position === "bottom" && "bottom-[-24px]"
        } ${position === "top" && "top-[-24px]"} left-0 text-sm`}
      >
        <span>{"<"}</span>
        {tag}
        <span>{"/>"}</span>
      </div>
    </div>
  );
};

export default TagIndicator;
