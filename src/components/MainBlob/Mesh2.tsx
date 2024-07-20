"use client";
import { useApp, useMouseAcceleration } from "@/lib/hooks";
import { a, animated, config, useSpring } from "@react-spring/three";
import { MeshDistortMaterial } from "@react-three/drei";
import { extend, useFrame, useThree } from "@react-three/fiber";
import { useTheme } from "next-themes";
import { useEffect, useRef, useState } from "react";
import { AnaglyphEffect } from "three-stdlib";

extend({ AnaglyphEffect });

const AnimatedMaterial = animated(MeshDistortMaterial);

const Mesh = () => {
  const { theme } = useTheme();
  const [mouseDown, setMouseDown] = useState(false);
  const [{ glassesMode }] = useApp();
  const glassesModeMultiplier = glassesMode ? 1.2 : 1;
  const mouseAcceleration = useMouseAcceleration();
  const myMesh = useRef();
  const { gl, scene, camera, size } = useThree();
  const effect = useRef();

  const props = useSpring({
    scaleX: (mouseDown ? 0.5 : 1) * glassesModeMultiplier,
    scaleY: (mouseDown ? 0.5 : 1) * glassesModeMultiplier,
    scaleZ: (mouseDown ? 0.5 : 1) * glassesModeMultiplier,
    x:
      (mouseAcceleration.horizontalDirection *
        mouseAcceleration.horizontalSpeed) /
      1000,
    y:
      (mouseAcceleration.verticalDirection *
        -1 *
        mouseAcceleration.verticalSpeed) /
      1000,
    distort: mouseDown
      ? 0.9
      : Math.min(
          Math.max((mouseAcceleration.acceleration / 100) * 1 + 0.3, 0.3),
          1
        ),
    rotation: [0, 1 * Math.PI, 0],
    config: config.molasses,
    loop: { reverse: true },
  });

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

  useFrame(() => {
    effect.current.render(scene, camera);
  }, 1);

  return (
    <>
      <a.mesh
        ref={myMesh}
        rotation={props.rotation}
        position-x={props.x}
        position-y={props.y}
        scale-x={props.scaleX}
        scale-y={props.scaleY}
        scale-z={props.scaleZ}
      >
        <sphereGeometry args={[1, 0.2, 16, 100]} />
        <AnimatedMaterial
          attach="material"
          color={theme === "dark" ? "white" : "black"}
          speed={8}
          distort={props.distort}
        />
      </a.mesh>
    </>
  );
};

export default Mesh;
