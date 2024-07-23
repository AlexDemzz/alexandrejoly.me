"use client";
import Portal from "@/components/Portal";
import { useMouseAcceleration } from "@/lib/hooks";
import { motion, AnimatePresence, useSpring } from "framer-motion";
import BackgroundVideo from "next-video/background-video";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

const HoverImage = ({
  visible,
  images,
  videos,
}: {
  visible: boolean;
  images: string[];
}) => {
  const [currIndex, setCurrIndex] = useState(0);
  const [distance, setDistance] = useState(0); // État pour la distance parcourue
  const [lastMousePosition, setLastMousePosition] = useState({ x: 0, y: 0 }); // État pour stocker la dernière position de la souris

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
    const handleMouseMove = (event) => {
      const dx = event.clientX - lastMousePosition.x;
      const dy = event.clientY - lastMousePosition.y;
      const newDistance = Math.sqrt(dx * dx + dy * dy);
      setDistance((prevDistance) => {
        const totalDistance = prevDistance + newDistance;
        if (totalDistance >= 50) {
          setCurrIndex(
            (prevIndex) => (prevIndex + 1) % (images?.length || videos.length)
          );
          return totalDistance - 50;
        }
        return totalDistance;
      });
      setLastMousePosition({ x: event.clientX, y: event.clientY });
      xSpring.set(event.clientX);
      ySpring.set(event.clientY);
      updateDelayed();
    };
    updateDelayed();
    document.addEventListener("mousemove", handleMouseMove);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
    };
  }, [
    xSpring,
    ySpring,
    delayedXSpring,
    delayedYSpring,
    lastMousePosition.x,
    lastMousePosition.y,
    images?.length,
    videos?.length,
    updateDelayed,
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
              className="fixed z-10 pointer-events-none overflow-hidden w-[400px] h-[200px] bg-foreground border-foreground flex items-center justify-center"
            >
              <motion.div
                style={{
                  x: delayedXSpring,
                  y: delayedYSpring,
                }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                {videos ? (
                  <BackgroundVideo src={videos[currIndex]} />
                ) : (
                  <Image
                    src={images[currIndex]}
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
