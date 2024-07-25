import { useColumns } from "@/lib/hooks";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const AnimatedGrid = ({
  animate = true,
  onAnimationEnd = () => undefined,
}: {
  animate?: boolean;
  onAnimationEnd?: () => void;
}) => {
  const [paddingX, setPaddingX] = useState("3rem");
  const columns = useColumns();

  useEffect(() => {
    const container = document.querySelector(".container");
    if (container) {
      const style = getComputedStyle(container);
      const px = style.paddingLeft;
      setPaddingX(px);
    }
  }, []);

  return (
    <div className="w-full h-[100vh] flex items-stretch fixed top-0 right-0 left-0 z-[999] bottom-0 pointer-events-none">
      {new Array(columns + 2).fill("").map((_, i, arr) => {
        let isXPadding = i === 0 || i === arr.length - 1;
        return (
          <motion.div
            style={{
              width: isXPadding ? paddingX : undefined,
              flex: isXPadding ? undefined : "1",
            }}
            className={`bg-background border-b-foreground border-grid border-b-[1rem] ${
              i < columns + 2 - 1 ? "border-r" : ""
            }`}
            initial={{ y: "0%" }}
            animate={{ y: animate ? "-100%" : "0%" }}
            exit={{ y: "0%" }}
            transition={{ delay: i * 0.03, tension: 180, friction: 12 }}
            key={`grid-elem-${i}`}
            onAnimationEnd={() => {
              if (i === arr.length - 1) {
                onAnimationEnd();
              }
            }}
          />
        );
      })}
    </div>
  );
};

export default AnimatedGrid;
