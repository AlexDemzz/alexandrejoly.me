"use client";
import { useApp, useMouseAcceleration } from "@/lib/hooks";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
} from "framer-motion";
import { useEffect, useState } from "react";
import GlassesButton from "../Header/GlassesButton";
import { MOTION_TRANSITION } from "@/lib/constants";
import { usePathname } from "next/navigation";

const getWrapperSize = ({ isHover, isMouseDown }) => {
  const baseSize = isHover ? 80 : 40;
  return isMouseDown ? baseSize * 0.75 : baseSize;
};

const CursorWrapper = ({ children }) => {
  const [{ canEnabledGlassesMode }] = useApp();
  const [isHover, setIsHover] = useState(false);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const mouseAcceleration = useMouseAcceleration();
  const pathname = usePathname();

  const size = useSpring(
    getWrapperSize({ isHover, isMouseDown }),
    MOTION_TRANSITION
  );

  useEffect(() => {
    setIsHover(false);
  }, [pathname]);

  useEffect(() => {
    size.set(getWrapperSize({ isHover, isMouseDown }));
  }, [size, isHover, isMouseDown]);

  useEffect(() => {
    const handleMouseOver = (event) => {
      event.stopPropagation();
      const target = event.target.closest(
        'a, button, [type="button"], [tabindex]'
      );
      if (target) {
        setIsHover(true);
      }
    };

    const handleMouseOut = (event) => {
      event.stopPropagation();
      const target = event.target.closest(
        'a, button, [type="button"], [tabindex]'
      );
      if (target) {
        setIsHover(false);
      }
    };

    const handleMouseDown = () => {
      setIsMouseDown(true);
    };

    const handleMouseUp = () => {
      setIsMouseDown(false);
    };

    document.addEventListener("mouseover", handleMouseOver);
    document.addEventListener("mouseout", handleMouseOut);
    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mouseover", handleMouseOver);
      document.removeEventListener("mouseout", handleMouseOut);
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const xSpring = useSpring(0, { stiffness: 300, damping: 30 });
  const ySpring = useSpring(0, { stiffness: 300, damping: 30 });

  useEffect(() => {
    const handleMouseMove = (event) => {
      x.set(event.clientX);
      y.set(event.clientY);
      xSpring.set(event.clientX);
      ySpring.set(event.clientY);
    };
    document.addEventListener("mousemove", handleMouseMove);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
    };
  }, [x, y, xSpring, ySpring]);

  return (
    <>
      {mouseAcceleration && (
        <>
          <motion.div
            style={{
              x,
              y,
              translateX: "-50%",
              translateY: "-50%",
              pointerEvents: "none",
            }}
            transition={{ duration: 0 }}
            className="fixed w-16 h-16 mix-blend-difference z-[9999]"
          >
            {children({
              isHover,
              isMoving: mouseAcceleration.speed > 0,
              isMouseDown,
            })}
          </motion.div>
          <AnimatePresence>
            {canEnabledGlassesMode && (
              <motion.div
                style={{
                  x: xSpring,
                  y: ySpring,
                  translateY: "-110%",
                  pointerEvents: "none",
                }}
                initial={{ scale: 0.5, opacity: 0, rotate: -20 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                exit={{ scale: 0.5, opacity: 0, rotate: -20 }}
                transition={{ ...MOTION_TRANSITION }}
                className="fixed mix-blend-difference z-[9999]"
              >
                <GlassesButton isMouseDown={isMouseDown} />
              </motion.div>
            )}
          </AnimatePresence>
          <motion.div
            style={{
              x: xSpring,
              y: ySpring,
              width: size,
              height: size,
              borderWidth: isHover ? 4 : 2,
              translateX: "-50%",
              translateY: "-50%",
              pointerEvents: "none",
            }}
            className="fixed rounded-full border border-white z-[9999] mix-blend-difference"
          />
        </>
      )}
    </>
  );
};

export default CursorWrapper;
