"use client";
import { useMouseAcceleration } from "@/lib/hooks";
import { a, config, useSpring } from "@react-spring/three";
import { MeshDistortMaterial } from "@react-three/drei";
import { useRef } from "react";

const Mesh = () => {
  const myMesh = useRef();
  return (
    <>
      <a.mesh ref={myMesh}>
        <sphereGeometry args={[1, 64, 64]} />
        <MeshDistortMaterial
          speed={3}
          distort={0.6}
          radius={1}
          color={"white"}
        />
      </a.mesh>
    </>
  );
};

export default Mesh;
