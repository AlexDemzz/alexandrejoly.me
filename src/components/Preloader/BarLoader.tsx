import { animate, motion, useAnimation } from "framer-motion";
import React, { useEffect, useRef, useState } from "react";

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
    return () => controls.stop();
  }, [percent, size, controls, onAnimationEnd]);

  const nodeRef = useRef<HTMLSpanElement>(null);

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
        if (nodeRef.current)
          nodeRef.current.textContent = value.toFixed(0).padStart(3, "0");
      },
    });
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [percent, oldPercent]);

  return (
    <div className="container">
      <div className="grid grid-cols-1 md:grid-cols-8">
        {/* <div
        style={{ width: size, height }}
        className="border rounded-full bg-grid overflow-hidden"
      >
        <motion.div className="bg-foreground h-full w-0" animate={controls} />
      </div> */}
        <div className="text-[100px] md:text-[15vw] font-black mt-2 text-background md:col-start-2 md:col-span-6">
          <motion.span style={{ display: "inline-block" }} ref={nodeRef} />
        </div>
      </div>
    </div>
  );
};

export default BarLoader;
