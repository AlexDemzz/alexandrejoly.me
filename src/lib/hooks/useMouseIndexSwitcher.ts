"use client";
import { useEffect, useState, useRef } from "react";

export default function useMouseIndexSwitcher(ref, arr) {
  const DISTANCE = 300;
  const [currIndex, setCurrIndex] = useState(0);
  const distance = useRef(0);
  const lastMousePosition = useRef({ x: 0, y: 0 });

  const handleMouseMove = (event) => {
    console.log("move");
    const dx = event.clientX - lastMousePosition.current.x;
    const dy = event.clientY - lastMousePosition.current.y;
    const newDistance = Math.sqrt(dx * dx + dy * dy);
    distance.current += newDistance;
    if (distance.current >= DISTANCE) {
      setCurrIndex((prevIndex) => (prevIndex + 1) % arr.length);
      distance.current -= DISTANCE;
    }
    lastMousePosition.current = { x: event.clientX, y: event.clientY };
  };

  useEffect(() => {
    const handleMouseEnter = () => {
      console.log("enter");
      document.addEventListener("mousemove", handleMouseMove);
    };

    const handleMouseLeave = () => {
      console.log("leave");
      document.removeEventListener("mousemove", handleMouseMove);
      distance.current = 0;
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
  }, [ref, arr.length]);

  return currIndex;
}
