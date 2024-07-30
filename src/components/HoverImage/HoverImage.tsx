"use client";
import Portal from "@/components/Portal";
import {
  useBreakpoints,
  useMouseAcceleration,
  useMouseIndexSwitcher,
} from "@/lib/hooks";
import { AnimatePresence, motion, useSpring } from "framer-motion";
import Image, { StaticImageData } from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import Video from "../Video";
// import { Asset } from "next-video/dist/assets.js";

const HoverImage = ({
  images,
  videos,
  children,
}: {
  images: StaticImageData[] | undefined;
  // videos: Asset[] | string[] | undefined;
  videos: string[] | undefined;
  children: React.ReactNode;
}) => {
  const breakpoints = useBreakpoints();
  const [isHover, setIsHover] = useState(false);
  const containerRef = useRef(null);
  const [currIndex] = useMouseIndexSwitcher(
    containerRef,
    images || videos || [],
    200
  );
  const mouseAcceleration = useMouseAcceleration();

  const xSpring = useSpring(0, { stiffness: 300, damping: 30 });
  const ySpring = useSpring(0, { stiffness: 300, damping: 30 });

  const delayedXSpring = useSpring(0, { stiffness: 300, damping: 30 });
  const delayedYSpring = useSpring(0, { stiffness: 300, damping: 30 });

  const updateDelayed = useCallback(() => {
    delayedXSpring.set(
      (mouseAcceleration.horizontalDirection *
        -1 *
        mouseAcceleration.horizontalSpeed) /
        10
    );
    delayedYSpring.set(
      (mouseAcceleration.verticalDirection *
        -1 *
        mouseAcceleration.verticalSpeed) /
        10
    );
  }, [
    delayedXSpring,
    delayedYSpring,
    mouseAcceleration.horizontalDirection,
    mouseAcceleration.horizontalSpeed,
    mouseAcceleration.verticalDirection,
    mouseAcceleration.verticalSpeed,
  ]);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      xSpring.set(event.clientX);
      ySpring.set(event.clientY);
      updateDelayed();
    };
    updateDelayed();
    if (breakpoints.get({ xs: false, md: true })) {
      document.addEventListener("mousemove", handleMouseMove);
    }
    return () => {
      if (breakpoints.get({ xs: false, md: true })) {
        document.removeEventListener("mousemove", handleMouseMove);
      }
    };
  }, [
    xSpring,
    ySpring,
    delayedXSpring,
    delayedYSpring,
    updateDelayed,
    breakpoints,
  ]);

  const variants = {
    enter: {
      clipPath: "polygon(0% 0%, 0% 100%, 100% 100%, 100% 0%)",
      opacity: 1,
    },
    initial: {
      clipPath: "polygon(0% 0%, 0% 100%, 0% 100%, 0% 0%)",
      opacity: 0,
    },
    exit: {
      clipPath: "polygon(0% 0%, 0% 100%, 0% 100%, 0% 0%)",
      opacity: 0,
    },
  };

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
    >
      {children}
      <AnimatePresence>
        {isHover &&
          breakpoints.get({ xs: false, md: true })(
            <Portal>
              <motion.div
                initial="initial"
                animate="enter"
                exit="exit"
                variants={variants}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                style={{
                  x: xSpring,
                  y: ySpring,
                  transform: "translate(10%, -110%)",
                  pointerEvents: "none",
                }}
                className="fixed z-10 overflow-hidden w-[400px] h-[200px] bg-foreground border-foreground flex items-center justify-center"
              >
                <motion.div
                  style={{
                    x: delayedXSpring,
                    y: delayedYSpring,
                    pointerEvents: "none",
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  {videos ? (
                    <Video
                      key={`uniq-hover-videos-index-${currIndex}`}
                      src={videos[currIndex]}
                      className="object-fill"
                    />
                  ) : (
                    <Image
                      key={`uniq-hover-index-images-${currIndex}`}
                      src={images ? images[currIndex] : ""}
                      alt=""
                      className="object-fill"
                    />
                  )}
                </motion.div>
              </motion.div>
            </Portal>
          )}
      </AnimatePresence>
    </div>
  );
};

export default HoverImage;
