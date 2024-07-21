"use client";
import {
  animated,
  config,
  easings,
  Globals,
  useSpring,
  useTransition,
} from "@react-spring/web";
import { useEffect, useRef, useState } from "react";
import GlassesButton from "../Header/GlassesButton";
import { useApp } from "@/lib/hooks";

Globals.assign({
  frameLoop: "always",
});

const getWrapperSize = ({ isHover, isMouseDown }) => {
  const baseSize = isHover ? 80 : 40;
  return isMouseDown ? baseSize * 0.75 : baseSize;
};

const CursorWrapper = ({ children }) => {
  const [{ canEnabledGlassesMode }] = useApp();
  const [mousePos, setMousePos] = useState(null);
  const [isHover, setIsHover] = useState(false);
  const [isMoving, setIsMoving] = useState(false);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const moveTimeout = useRef(null);

  const props = useSpring({
    to: { x: mousePos?.x, y: mousePos?.y },
    config: {
      mass: 0,
      friction: 0,
      tension: 0,
    },
  });

  const wrapperProps = useSpring({
    to: {
      x: mousePos?.x,
      y: mousePos?.y,
    },
  });

  const wrapperSizeProps = useSpring({
    to: {
      borderWidth: isHover ? 4 : 2,
      width: getWrapperSize({ isHover, isMouseDown }),
      height: getWrapperSize({ isHover, isMouseDown }),
    },
    config: { duration: 100, easing: easings.easeOutQuad },
  });

  const glassesButtonTransition = useTransition(canEnabledGlassesMode, {
    from: { scale: 0.8, opacity: 0, rotate: -10 },
    enter: { scale: 1, opacity: 1, rotate: 0 },
    leave: { scale: 0.8, opacity: 0, rotate: -10 },
    config: config.wobbly,
  });

  useEffect(() => {
    const handleMouseMove = (event) => {
      setMousePos({ x: event.clientX, y: event.clientY });
      setIsMoving(true);

      clearTimeout(moveTimeout.current);
      moveTimeout.current = setTimeout(() => {
        setIsMoving(false);
      }, 100);
    };

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

    const handleMouseDown = (event) => {
      setIsMouseDown(true);
    };

    const handleMouseUp = (event) => {
      setIsMouseDown(false);
    };

    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseover", handleMouseOver);
    document.addEventListener("mouseout", handleMouseOut);
    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseover", handleMouseOver);
      document.removeEventListener("mouseout", handleMouseOut);
      document.addEventListener("mousedown", handleMouseDown);
      document.addEventListener("mouseup", handleMouseUp);
      clearTimeout(moveTimeout.current);
    };
  }, []);

  return (
    <>
      {mousePos && (
        <>
          <animated.div
            style={{ ...props, transform: "translate(-50%, -50%)" }}
            className={
              "fixed w-16 h-16 mix-blend-difference pointer-events-none-child z-[9999]"
            }
          >
            {children({ isHover, isMoving, isMouseDown })}
          </animated.div>
          {glassesButtonTransition(
            (style, item) =>
              item && (
                <animated.div
                  style={{
                    ...wrapperProps,
                    ...style,
                    transform: "translate(0%, -110%)",
                  }}
                  className={
                    "fixed mix-blend-difference pointer-events-none-child z-[9999]"
                  }
                >
                  <GlassesButton isMouseDown={isMouseDown} />
                </animated.div>
              )
          )}
          <animated.div
            style={{
              ...wrapperProps,
              ...wrapperSizeProps,
              transform: "translate(-50%, -50%)",
            }}
            className={`fixed rounded-full border border-white w-16 h-16 z-[9999] pointer-events-none mix-blend-difference`}
          />
        </>
      )}
    </>
  );
};

export default CursorWrapper;
