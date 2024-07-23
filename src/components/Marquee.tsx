import React, { useEffect, useState } from "react";
import { motion, useAnimationControls } from "framer-motion";

const Marquee = ({ children }) => {
  const [oddOutline, setOddOutline] = useState(false);
  const controls = useAnimationControls();

  useEffect(() => {
    controls.start({
      x: ["0%", "-50%"],
      transition: {
        x: {
          repeat: Infinity,
          repeatType: "loop",
          duration: 3,
          ease: "linear",
        },
      },
    });
  }, []);

  return (
    <div className="overflow-hidden whitespace-nowrap">
      <motion.div className="inline-block" animate={controls}>
        <span className="mr-8">{children}</span>
        <span className="mr-8">{children}</span>
      </motion.div>
    </div>
  );
};

export default Marquee;
