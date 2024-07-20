import { useSpring, animated } from "@react-spring/web";
import React, { useState, useEffect, useRef } from "react";

const Trail = ({ children, className, delay = 0, noSplit = false }) => {
  const [show, setShow] = useState(false);
  const items = React.Children.toArray(
    noSplit ? children : children.split(/(\s+)/)
  ); // Split the children text into words
  const containerRef = useRef(null);
  const tempRef = useRef(null);
  const [height, setHeight] = useState(0);

  const springs = items.map((_, index) =>
    useSpring({
      opacity: show ? 1 : 0,
      y: show ? 0 : height,
      from: { opacity: 0, y: height },

      delay: index * 20 + delay,
    })
  );

  useEffect(() => {
    if (tempRef.current && tempRef.current.offsetHeight > 0) {
      setHeight(tempRef.current.offsetHeight);
      setShow(true);
    }
  }, [tempRef]);

  return (
    <div ref={containerRef}>
      {/* Temp element to measure height */}
      <span ref={tempRef} className={`invisible absolute ${className}`}>
        {items[0]}
      </span>
      {!height && <span className={`${className} opacity-0`}>{items[0]}</span>}

      {!!height &&
        springs.map((spring, index) => (
          <span
            style={{ height }}
            className="overflow-y-hidden inline-block"
            key={index}
          >
            <animated.span
              style={{
                opacity: spring.opacity,
                transform: spring.y.to((y) => `translateY(${y}px)`),
                display: "inline-block",
                whiteSpace: "pre",
              }}
              className={className}
            >
              {items[index]}
            </animated.span>
          </span>
        ))}
    </div>
  );
};

export default Trail;
