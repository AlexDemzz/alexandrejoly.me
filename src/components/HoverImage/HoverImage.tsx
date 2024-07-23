"use client";
import Portal from "@/components/Portal";
import { useMouseAcceleration } from "@/lib/hooks";
import { motion, AnimatePresence, useSpring } from "framer-motion";
import BackgroundVideo from "next-video/background-video";
import Image from "next/image";
import { useEffect } from "react";

const HoverImage = ({
  visible,
  images,
  videos,
}: {
  visible: boolean;
  images: string[];
}) => {
  const mouseAcceleration = useMouseAcceleration();

  const xSpring = useSpring(0, { stiffness: 300, damping: 30 });
  const ySpring = useSpring(0, { stiffness: 300, damping: 30 });

  const delayedXSpring = useSpring(0, { stiffness: 300, damping: 30 });
  const delayedYSpring = useSpring(0, { stiffness: 300, damping: 30 });

  useEffect(() => {
    const handleMouseMove = (event) => {
      xSpring.set(event.clientX);
      ySpring.set(event.clientY);

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
    };
    document.addEventListener("mousemove", handleMouseMove);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
    };
  }, [
    xSpring,
    ySpring,
    delayedXSpring,
    delayedYSpring,
    mouseAcceleration.horizontalDirection,
    mouseAcceleration.horizontalSpeed,
    mouseAcceleration.verticalDirection,
    mouseAcceleration.verticalSpeed,
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
    <div>
      <AnimatePresence>
        {visible && (
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
              }}
              className="fixed z-10 pointer-events-none overflow-hidden w-[400px] h-[250px] bg-foreground border-foreground flex items-center justify-center"
            >
              <motion.div
                style={{
                  scale: 1.3,
                  x: delayedXSpring,
                  y: delayedYSpring,
                }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                {videos ? (
                  <BackgroundVideo src={videos[0]} />
                ) : (
                  <Image src={images[0]} alt="" className="object-fill" />
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
