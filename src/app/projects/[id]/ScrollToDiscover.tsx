import React, { useState, useEffect, useRef } from "react";
import { useMeasure, useWindowScroll } from "@uidotdev/usehooks";
import Trail from "@/components/Trail";
import { Project } from "@/lib/types";
import {
  useScroll,
  motion,
  useTransform,
  useMotionValueEvent,
  animate,
  AnimateSharedLayout,
  useSpring,
} from "framer-motion";
import { useRouter } from "next/navigation";

const ScrollToDiscover = ({ data }: { data: Project }) => {
  const [ref, { height }] = useMeasure();
  const foregroundRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef(null);
  const [isAtBottom, setIsAtBottom] = useState(false);
  const [{ y }] = useWindowScroll();
  const { scrollYProgress } = useScroll({ container: scrollContainerRef });
  const motionHeight = useTransform(scrollYProgress, [0, 1], [0, height]);
  const router = useRouter();
  const scale = useSpring(1);

  useEffect(() => {
    console.log("y", y);
    if (y) {
      const viewportHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      if (viewportHeight + y >= documentHeight) {
        setIsAtBottom(true);
      } else {
        setIsAtBottom(false);
        if (foregroundRef.current) {
          foregroundRef.current.style.height = "0px";
        }
      }
    }
  }, [y, height]);

  useMotionValueEvent(motionHeight, "change", (latest) => {
    if (latest === height) {
      animate(scale, [1, 1.2, 1], {
        duration: 0.1,
        ease: "backInOut",
        onComplete: () => {
          router.push(data.id, { scroll: false });
        },
      });
    }
  });

  return (
    <div className="container pt-20 flex items-center justify-center flex-col">
      <Trail className="font-bold text-3xl">SCROLL TO DISCOVER</Trail>
      <motion.div
        className="relative flex items-center justify-center "
        style={{ scale: scale }}
      >
        <div className="text-[8vw] font-black leading-none uppercase overflow-hidden text-center">
          <Trail className="font-outline-1 text-background" aria-hidden="true">
            {data.title}
          </Trail>
        </div>
        <motion.div
          className="absolute top-0 left-0 right-0 overflow-hidden"
          style={{ height: motionHeight }}
          ref={foregroundRef}
        >
          <div
            ref={ref}
            className="text-[8vw] font-black text-foreground leading-none uppercase overflow-hidden text-center"
          >
            <Trail aria-hidden="true">{data.title}</Trail>
          </div>
        </motion.div>
      </motion.div>
      <div
        ref={scrollContainerRef}
        className="fixed bottom-0 left-0 right-0 h-[100vh] overflow-y-scroll scroll no-scrollbar"
        style={{
          pointerEvents: isAtBottom ? "auto" : "none",
        }}
      >
        <div style={{ height: "200vh" }} />
      </div>
    </div>
  );
};

export default ScrollToDiscover;
