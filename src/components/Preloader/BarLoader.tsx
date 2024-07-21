import React from "react";
import { useSpring, animated, config, Globals } from "@react-spring/web";

const BarLoader: React.FC<{
  percent: number;
  oldPercent: number;
  height?: number;
  width?: number;
  onAnimationEnd: () => void;
}> = ({ oldPercent, percent, height = 6, width = 100, onAnimationEnd }) => {
  const animatedProps = useSpring({
    to: {
      width: `${(percent / 100) * width}px`,
    },
    config: { duration: 400, ease: "easeInOut" },
    onRest: () => {
      if (percent === 100) {
        onAnimationEnd();
      }
    },
  });

  const percentProps = useSpring({
    from: { number: oldPercent },
    to: { number: percent },
    config: { duration: 400, ease: "easeInOut" },
  });

  return (
    <div className="flex flex-col items-center">
      <div
        style={{ width, height }}
        className="border rounded-full bg-grid overflow-hidden"
      >
        <animated.div
          className="bg-foreground h-full"
          style={{ ...animatedProps }}
        />
      </div>
      <div className="text-sm font-bold font-mono mt-2 text-foreground">
        <span>&#91;</span>
        <animated.div className="inline">
          {percentProps.number.to((n) => n.toFixed(0))}
        </animated.div>
        <span>%</span>
        <span>&#93;</span>
      </div>
    </div>
  );
};

export default BarLoader;
