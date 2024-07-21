"use client";
import { useMouseAcceleration } from "@/lib/hooks";
import { animated, config, useSpring } from "@react-spring/three";
import { MeshDistortMaterial } from "@react-three/drei";
import { useRef } from "react";

const AnimatedMaterial = animated(MeshDistortMaterial);

const Mesh = ({ isMoving, isMouseDown, isHover }) => {
  const mouseAcceleration = useMouseAcceleration();
  const myMesh = useRef();

  const getSize = () => {
    if (isHover) return 2;
    if (isMoving)
      return Math.min(
        Math.max((mouseAcceleration.acceleration / 1000000) * 1.1 + 1, 1),
        1.1
      );
    return 1;
  };

  const { scaleX, scaleY } = useSpring({
    scaleY: getSize(),
    scaleX: getSize(),
    config: config.wobbly,
  });

  const { speed, distort, radius } = useSpring({
    speed: 10,
    radius: isMouseDown ? 0.5 : 1,
    distort: isMoving ? 1 : 0.5,
    config: config.wobbly,
  });

  return (
    <animated.mesh scale-x={scaleX} scale-y={scaleY} ref={myMesh}>
      <sphereGeometry args={[1, 128, 128]} />
      <AnimatedMaterial
        speed={speed}
        distort={distort}
        radius={radius}
        color={"white"}
      />
    </animated.mesh>
  );
};

export default Mesh;
