import React, { useEffect, useRef, useState } from "react";
import {
  animate,
  motion,
  useAnimation,
  useMotionValue,
  useTransform,
} from "framer-motion";

const BarLoader: React.FC<{
  percent: number;
  height?: number;
  width?: number;
  onAnimationEnd: () => void;
}> = ({ percent = 0, height = 6, width: size = 100, onAnimationEnd }) => {
  const [oldPercent, setOldPercent] = useState(percent);
  const controls = useAnimation();

  useEffect(() => {
    setOldPercent((oldPercent) => {
      if (oldPercent !== percent) {
        const newOldPercent = oldPercent;
        setOldPercent(percent);
        return newOldPercent;
      }
      return oldPercent;
    });
  }, [percent]);

  useEffect(() => {
    controls.start({
      width: `${percent > 0 ? (percent / 100) * size : 0}px`,
      transition: { duration: 0.4, ease: "easeInOut" },
    });
  }, [percent, size, controls, onAnimationEnd]);

  const nodeRef = useRef<React.RefObject<HTMLSpanElement>>();

  useEffect(() => {
    const controls = animate(oldPercent, percent, {
      onComplete: () => {
        if (percent === 100) {
          setTimeout(() => {
            onAnimationEnd();
            controls.stop();
          }, 500);
        }
      },
      ease: "easeOut",
      onUpdate(value) {
        nodeRef.current.textContent = value.toFixed(0);
      },
    });
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [percent, oldPercent]);

  return (
    <div className="flex flex-col items-center">
      <div
        style={{ width: size, height }}
        className="border rounded-full bg-grid overflow-hidden"
      >
        <motion.div className="bg-foreground h-full w-0" animate={controls} />
      </div>
      <div className="text-sm font-bold font-mono mt-2 text-foreground">
        <span>&#91;</span>
        <motion.span style={{ display: "inline-block" }} ref={nodeRef} />
        <span>%</span>
        <span>&#93;</span>
      </div>
    </div>
  );
};

export default BarLoader;
