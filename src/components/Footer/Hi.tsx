"use client";
import { HI_LANGUAGES } from "@/lib/constants";
import { cubicBezier, useAnimate, useInView } from "framer-motion";
import React, { useEffect } from "react";

const Hi = () => {
  const [scope, animate] = useAnimate();
  const isInView = useInView(scope);
  const HEIGHT = 24;
  const items = HI_LANGUAGES;

  useEffect(() => {
    let isCancelled = false;

    if (isInView) {
      const handleAnim = async () => {
        while (!isCancelled) {
          for (let i = 1; i < items.length; i++) {
            await animate(
              scope.current,
              { y: HEIGHT * -i },
              { duration: 0.6, ease: cubicBezier(0.77, 0, 0.18, 1), delay: 1 }
            );
            if (isCancelled) return;
          }
          await animate(
            scope.current,
            { y: 0 },
            { duration: 0, ease: "linear", delay: 0.1 }
          );
          if (isCancelled) return;
        }
      };
      handleAnim();
    }

    return () => {
      isCancelled = true;
    };
  }, [animate, scope, items.length, isInView]);

  return (
    <div className="overflow-hidden h-6 relative w-full">
      <div
        ref={scope}
        className="flex flex-col"
        style={{ height: HEIGHT * HI_LANGUAGES.length }}
      >
        {items.map((item, i) => (
          <div key={i} className="h-6 font-bold">
            {item}
          </div>
        ))}
      </div>
    </div>
  );
};

export default React.memo(Hi);
