"use client";
import { animated, easings, Globals, useSpring } from "@react-spring/web";
import { useEffect, useState, useRef } from "react";

Globals.assign({
  frameLoop: "always",
});

const getWrapperSize = ({ isHover, isMouseDown }) => {
  const baseSize = isHover ? 80 : 40;
  return isMouseDown ? baseSize * 0.75 : baseSize;
};

const CursorWrapper = ({ children }) => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHover, setIsHover] = useState(false);
  const [isMoving, setIsMoving] = useState(false);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const moveTimeout = useRef(null);

  const props = useSpring({
    to: { x: mousePos.x, y: mousePos.y },
    config: {
      mass: 0,
      friction: 0,
      tension: 0,
    },
  });

  const wrapperProps = useSpring({
    to: {
      x: mousePos.x,
      y: mousePos.y,
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
      <animated.div
        style={{ ...props, transform: "translate(-50%, -50%)" }}
        className={
          "fixed w-16 h-16 mix-blend-difference pointer-events-none-child z-[9999]"
        }
      >
        {children({ isHover, isMoving, isMouseDown })}
      </animated.div>
      <animated.div
        style={{
          ...wrapperProps,
          ...wrapperSizeProps,
          transform: "translate(-50%, -50%)",
        }}
        className={`fixed rounded-full border border-white w-16 h-16 z-[9999] pointer-events-none mix-blend-difference`}
      />
    </>
  );
};

export default CursorWrapper;
