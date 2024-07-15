"use client";
import { useSpring, a, config } from "@react-spring/three";
import { MeshDistortMaterial } from "@react-three/drei";
import { useEffect, useRef, useState } from "react";
import { useDebounceCallback } from "usehooks-ts";

const Mesh = ({ multiplier = 1 }) => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [prevMousePos, setPrevMousePos] = useState({ x: 0, y: 0 });
  const [mouseSpeed, setMouseSpeed] = useState(0);
  const myMesh = useRef();
  const debounce = useDebounceCallback(() => {
    setMouseSpeed(0);
  }, 100);

  const { x, y, scale } = useSpring({
    x: mousePos.x / 5,
    y: mousePos.y / 5,
    scale: mouseSpeed >= 1 ? 1 + mouseSpeed / 100 : 1,
    config: config.wobbly,
  });

  useEffect(() => {
    debounce();
  }, [debounce]);

  useEffect(() => {
    const handleMouseMove = (event) => {
      setMouseSpeed(Math.abs(Math.max(event.movementX, event.movementY)));
      const x = (event.clientX / window.innerWidth) * 2 - 1;
      const y = -(event.clientY / window.innerHeight) * 2 + 1;

      setPrevMousePos(mousePos);
      setMousePos({ x, y });
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [mousePos]);

  return (
    <>
      <a.mesh ref={myMesh} position-x={x} position-y={y} scale={scale}>
        <sphereGeometry args={[1, 64, 64]} />
        <MeshDistortMaterial
          speed={3 * multiplier}
          distort={0.6 * multiplier}
          radius={1}
          color={"white"}
        />
      </a.mesh>
    </>
  );
};

export default Mesh;
