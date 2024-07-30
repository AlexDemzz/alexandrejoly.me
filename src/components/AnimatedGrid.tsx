import { useColumns } from "@/lib/hooks";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const AnimatedGrid = ({
  animate = true,
  onAnimationEnd = () => undefined,
  onAnimationStart = () => undefined,
}: {
  animate?: boolean;
  onAnimationEnd?: () => void;
  onAnimationStart?: () => void;
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

  // Fonction pour générer un délai aléatoire
  const getRandomDelay = () => Math.random() * 0.5;

  return (
    <div className="w-full h-[100vh] flex items-stretch fixed top-0 right-0 left-0 z-[999] bottom-0 pointer-events-none">
      {new Array(columns + 2).fill("").map((_, i, arr) => {
        let isXPadding = i === 0 || i === arr.length - 1;
        return (
          <motion.div
            style={{
              width: isXPadding ? paddingX : undefined,
              flex: isXPadding ? undefined : "1",
              willChange: "transform",
            }}
            className={`bg-foreground border-b-background border-b ${
              i < columns + 2 - 1 ? "border-r-background border-r" : ""
            }`}
            initial={{ y: "0%" }}
            animate={{ y: animate ? "-100%" : "0%" }}
            exit={{ y: "0%" }}
            transition={{ delay: getRandomDelay(), tension: 180, friction: 12 }}
            key={`grid-elem-${i}`}
            onAnimationStart={() => {
              if (i === 0) {
                onAnimationStart();
              }
            }}
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
