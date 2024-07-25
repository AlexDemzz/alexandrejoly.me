import React, { useEffect } from "react";
import {
  motion,
  useAnimation,
  useMotionValue,
  useTransform,
} from "framer-motion";

const BarLoader: React.FC<{
  percent: number;
  oldPercent: number;
  height?: number;
  width?: number;
  onAnimationEnd: () => void;
}> = ({ oldPercent, percent, height = 6, width = 100, onAnimationEnd }) => {
  const controls = useAnimation();
  const percentMotionValue = useMotionValue(oldPercent);
  const percentDisplay = useTransform(percentMotionValue, (value) =>
    value.toFixed(0)
  );

  useEffect(() => {
    controls
      .start({
        width: `${(percent / 100) * width}px`,
        transition: { duration: 0.4, ease: "easeInOut" },
      })
      .then(() => {
        if (percent === 100) {
          setTimeout(() => {
            onAnimationEnd();
          }, 1000);
        }
      });

    percentMotionValue.set(percent);
  }, [percent, width, controls, onAnimationEnd, percentMotionValue]);

  return (
    <div className="flex flex-col items-center">
      <div
        style={{ width, height }}
        className="border rounded-full bg-grid overflow-hidden"
      >
        <motion.div className="bg-foreground h-full" animate={controls} />
      </div>
      <div className="text-sm font-bold font-mono mt-2 text-foreground">
        <span>&#91;</span>
        <motion.span style={{ display: "inline-block" }}>
          {percentDisplay}
        </motion.span>
        <span>%</span>
        <span>&#93;</span>
      </div>
    </div>
  );
};

export default BarLoader;
