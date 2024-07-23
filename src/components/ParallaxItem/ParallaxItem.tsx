"use client";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";

const ScrollImage = ({ children, className = "", speed = 5 }) => {
  const tension = 200 - speed * 20;
  const friction = 20 + speed * 10;

  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [-100, 100]);

  const ySpring = useSpring(y, { stiffness: tension, damping: friction });

  return (
    <div className={`${className}`}>
      <div className="flex justify-center flex-col h-full">
        <motion.div style={{ y: ySpring }}>{children}</motion.div>
      </div>
    </div>
  );
};

export default ScrollImage;
