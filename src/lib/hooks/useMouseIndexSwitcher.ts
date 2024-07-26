"use client";
import { useEffect, useState, useRef, useCallback } from "react";

export default function useMouseIndexSwitcher(
  ref: React.RefObject<HTMLDivElement>,
  arr: any[],
  distance: number = 100
) {
  const [currIndex, setCurrIndex] = useState(0);
  const currDistance = useRef(0);
  const lastMousePosition = useRef({ x: 0, y: 0 });

  const handleMouseMove = useCallback(
    (event: MouseEvent) => {
      const dx = event.clientX - lastMousePosition.current.x;
      const dy = event.clientY - lastMousePosition.current.y;
      const newDistance = Math.sqrt(dx * dx + dy * dy);
      currDistance.current += newDistance;
      if (currDistance.current >= distance) {
        setCurrIndex((prevIndex) => (prevIndex + 1) % arr.length);
        currDistance.current -= distance;
      }
      lastMousePosition.current = { x: event.clientX, y: event.clientY };
    },
    [lastMousePosition, arr, distance]
  );

  useEffect(() => {
    const handleMouseEnter = () => {
      console.log("enter");
      document.addEventListener("mousemove", handleMouseMove);
    };

    const handleMouseLeave = () => {
      console.log("leave");
      document.removeEventListener("mousemove", handleMouseMove);
      currDistance.current = 0;
    };

    const currentRef = ref.current;
    if (currentRef) {
      currentRef.addEventListener("mouseenter", handleMouseEnter);
      currentRef.addEventListener("mouseleave", handleMouseLeave);
    }

    return () => {
      if (currentRef) {
        currentRef.removeEventListener("mouseenter", handleMouseEnter);
        currentRef.removeEventListener("mouseleave", handleMouseLeave);
        handleMouseLeave();
      }
    };
  }, [ref, arr.length, handleMouseMove]);

  return currIndex;
}
