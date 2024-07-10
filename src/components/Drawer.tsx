"use client";

import React, { useState } from "react";

const Drawer = () => {
  const [points, setPoints] = useState([{ x: 200, y: 200 }]); // Initial central point
  const [selectedPointIndex, setSelectedPointIndex] = useState(null); // Index of the selected point

  const handleSvgClick = (e) => {
    if (selectedPointIndex === null) return; // Do nothing if no point is selected

    const svg = e.currentTarget;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const svgPoint = pt.matrixTransform(svg.getScreenCTM().inverse());

    setPoints([...points, { x: svgPoint.x, y: svgPoint.y }]);
  };

  const handlePointClick = (index) => {
    setSelectedPointIndex(index);
  };

  return (
    <svg
      width="400"
      height="400"
      onClick={handleSvgClick}
      style={{ border: "1px solid black" }}
    >
      {points.map((point, index) => (
        <circle
          key={index}
          cx={point.x}
          cy={point.y}
          r="5"
          fill={index === selectedPointIndex ? "blue" : "red"}
          onClick={(e) => {
            e.stopPropagation(); // Prevent triggering svg click event
            handlePointClick(index);
          }}
        />
      ))}
      {points.slice(1).map((point, index) => (
        <line
          key={index}
          x1={points[index].x}
          y1={points[index].y}
          x2={point.x}
          y2={point.y}
          stroke="black"
        />
      ))}
      {selectedPointIndex !== null && (
        <line
          x1={points[selectedPointIndex].x}
          y1={points[selectedPointIndex].y}
          x2={points[points.length - 1].x}
          y2={points[points.length - 1].y}
          stroke="transparent"
          strokeDasharray="5,5"
        />
      )}
    </svg>
  );
};

export default Drawer;
