"use client";
import { animated, config, Globals, useSpring } from "@react-spring/three";
import { MeshDistortMaterial } from "@react-three/drei";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

const AnimatedMaterial = animated(MeshDistortMaterial);

const Mesh = ({ isMoving, isMouseDown, isHover }) => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [prevMousePos, setPrevMousePos] = useState({ x: 0, y: 0 });
  const myMesh = useRef();

  const getSize = (pos) => {
    if (isHover) return 2;
    if (isMoving) return 1 + Math.abs(mousePos[pos] - prevMousePos[pos]);
    return 1;
  };

  const { scaleX, scaleY } = useSpring({
    scaleY: getSize("y"),
    scaleX: getSize("x"),
    config: config.wobbly,
  });

  const { speed, distort, radius } = useSpring({
    speed: 10,
    radius: isMouseDown ? 0.5 : 1,
    distort: isMoving ? 1 : 0.5,
    config: config.wobbly,
  });

  useEffect(() => {
    const handleMouseMove = (event) => {
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
    <animated.mesh scale-x={scaleX} scale-y={scaleY} ref={myMesh}>
      <sphereGeometry args={[1, 128, 128]} />
      <AnimatedMaterial
        speed={speed}
        distort={distort}
        radius={radius}
        color={"white"}
        blending={THREE.AdditiveBlending}
      />
    </animated.mesh>
  );
};

export default Mesh;
