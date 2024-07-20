import React from "react";
import { useSpring, animated } from "@react-spring/web";
import "tailwindcss/tailwind.css"; // Ensure Tailwind CSS is imported

const ProjectTitle = ({ children, className }) => {
  const text = children;

  const styles = useSpring({
    loop: true,
    from: { transform: "translateX(100%)" },
    to: { transform: "translateX(-100%)" },
    config: { duration: 10000 }, // Adjust duration to control the speed
  });

  return (
    <div className="overflow-hidden whitespace-nowrap flex">
      <animated.div style={styles} className="inline-flex items-center">
        {Array.from({ length: 20 }).map((_, i) => (
          <span
            key={i}
            className={`px-2 ${
              i % 2 === 0
                ? "text-white"
                : "text-transparent border-2 border-white"
            } ${className}`}
          >
            {text}
          </span>
        ))}
      </animated.div>
    </div>
  );
};

export default ProjectTitle;
