import React, { useState, useRef, useEffect } from "react";
import { useSpring, animated } from "@react-spring/web";

const ElasticLine = () => {
  const [lineTouched, setLineTouched] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 50 });
  const containerRef = useRef(null);
  const svgRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [lineHeight, setLineHeight] = useState(2); // Assuming a default stroke width of 2px

  const { d } = useSpring({
    d:
      isHovered && lineTouched
        ? `M0,50 Q${mousePos.x},${mousePos.y} ${containerWidth},50`
        : `M0,50 Q50,50 ${containerWidth},50`,
    config: { tension: 180, friction: 12 },
  });

  const handleMouseMove = (e) => {
    const { clientX, clientY } = e;
    const rect = e.target.getBoundingClientRect();
    setMousePos({
      x: ((clientX - rect.left) / rect.width) * containerWidth,
      y: ((clientY - rect.top) / rect.height) * 100,
    });
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setLineTouched(false);
  };

  const handleLineTouched = () => {
    setLineTouched(true);
  };

  useEffect(() => {
    if (containerRef.current) {
      setContainerWidth(containerRef.current.getBoundingClientRect().width);
    }
  }, [containerRef.current, svgRef.current]);

  return (
    <div
      ref={containerRef}
      className="flex items-center"
      style={{ width: "100%", height: `${lineHeight}px` }}
    >
      <div style={{ height: "100px", overflow: "hidden" }}>
        <svg
          ref={svgRef}
          width="100%"
          height="100%"
          viewBox={`0 0 ${containerWidth} 100`}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <animated.path
            d={d}
            stroke="hsl(var(--foreground))"
            strokeWidth="2"
            fill="transparent"
            onMouseEnter={handleLineTouched}
            className="mix-blend-difference"
          />
        </svg>
      </div>
    </div>
  );
};

export default ElasticLine;
