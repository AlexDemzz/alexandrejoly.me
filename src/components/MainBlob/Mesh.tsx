"use client";
import { useApp, useMouseAcceleration } from "@/lib/hooks";
import { a, config, useSpring } from "@react-spring/three";
import { MeshWobbleMaterial } from "@react-three/drei";
import { extend, useFrame, useThree } from "@react-three/fiber";
import { useTheme } from "next-themes";
import { useEffect, useRef, useState } from "react";
import { AnaglyphEffect } from "three-stdlib";

extend({ AnaglyphEffect });

const Mesh = () => {
  const { theme } = useTheme();
  const [mouseDown, setMouseDown] = useState(false);
  const [{ glassesMode }] = useApp();
  const glassesModeMultiplier = glassesMode ? 1.2 : 1;
  const mouseAcceleration = useMouseAcceleration();
  const myMesh = useRef();
  const { gl, scene, camera, size } = useThree();
  const effect = useRef();

  const [springProps, api] = useSpring(() => ({
    scale: 0.5 * glassesModeMultiplier,
    opacity: 0,
    config: config.wobbly,
  }));

  useEffect(() => {
    effect.current = new AnaglyphEffect(gl);
    effect.current.setSize(size.width, size.height);
  }, [gl, size]);

  useEffect(() => {
    window.addEventListener("mousedown", () => setMouseDown(true));
    window.addEventListener("mouseup", () => setMouseDown(false));

    return () => {
      window.removeEventListener("mousedown", () => setMouseDown(true));
      window.removeEventListener("mouseup", () => setMouseDown(false));
    };
  }, []);

  useEffect(() => {
    api.start({
      scale: (mouseDown ? 1.5 : 2) * glassesModeMultiplier,
      opacity: 1,
    });
  }, [mouseDown, glassesModeMultiplier, api]);

  useFrame(({ clock }) => {
    myMesh.current.rotation.x = clock.getElapsedTime();
    myMesh.current.rotation.y = clock.getElapsedTime();
  });

  return (
    <>
      <a.mesh
        ref={myMesh}
        position-x={springProps.x}
        position-y={springProps.y}
        scale={springProps.scale}
        style={{ opacity: springProps.opacity }}
      >
        <torusGeometry args={[1, 0.2, 16, 100]} />
        <MeshWobbleMaterial
          attach="material"
          color={theme === "dark" ? "white" : "black"}
          speed={1}
          factor={0.6}
        />
      </a.mesh>
    </>
  );
};

export default Mesh;
