import React from "react";

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
        className={`font-mono bg-background text-foreground inline font-bold absolute mix-blend-difference select-none ${
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
