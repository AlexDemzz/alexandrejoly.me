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

  const [springProps, api] = useSpring(() => ({
    scale: 0.5 * glassesModeMultiplier,
    opacity: 0,
    config: config.wobbly,
  }));

  const animatedProps = useSpring({
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

  useEffect(() => {
    api.start({
      scale: (mouseDown ? 0.5 : 1) * glassesModeMultiplier,
      opacity: 1,
    });
  }, [mouseDown, glassesModeMultiplier, api]);

  useFrame(() => {
    effect.current.render(scene, camera);
  }, 1);

  return (
    <>
      <a.mesh
        ref={myMesh}
        rotation={animatedProps.rotation}
        position-x={animatedProps.x}
        position-y={animatedProps.y}
        scale-x={springProps.scale}
        scale-y={springProps.scale}
        scale-z={springProps.scale}
        style={{ opacity: springProps.opacity }}
      >
        <sphereGeometry args={[1, 0.2, 16, 100]} />
        <AnimatedMaterial
          attach="material"
          color={theme === "dark" ? "white" : "black"}
          speed={8}
          distort={animatedProps.distort}
        />
      </a.mesh>
    </>
  );
};

export default Mesh;
