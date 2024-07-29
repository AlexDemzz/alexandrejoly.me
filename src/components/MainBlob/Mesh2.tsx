"use client";
import { useApp, useMouseAcceleration } from "@/lib/hooks";
import { a, animated, config, to, useSpring } from "@react-spring/three";
import { MeshDistortMaterial } from "@react-three/drei";
import { extend, useFrame, useThree } from "@react-three/fiber";
import { useTheme } from "next-themes";
import { memo, useEffect, useRef, useState } from "react";
import { Mesh as MeshType } from "three";
import { AnaglyphEffect } from "three-stdlib";

extend({ AnaglyphEffect });

const AnimatedMaterial = animated(MeshDistortMaterial);

const Mesh2 = () => {
  const { theme } = useTheme();
  const [mouseDown, setMouseDown] = useState(false);
  const [{ glassesMode }] = useApp();
  const glassesModeMultiplier = glassesMode ? 1.2 : 1;
  const mouseAcceleration = useMouseAcceleration();
  const myMesh = useRef<MeshType>(null);
  const { gl, scene, camera, size } = useThree();
  const effect = useRef<AnaglyphEffect | null>(null);

  const horizontalDirection = mouseAcceleration.horizontalDirection;
  const horizontalSpeed = mouseAcceleration.horizontalSpeed;
  const verticalDirection = mouseAcceleration.verticalDirection;
  const verticalSpeed = mouseAcceleration.verticalSpeed;
  const acceleration = mouseAcceleration.acceleration;

  const [springProps, api] = useSpring(() => ({
    scale: 0.5 * glassesModeMultiplier,
    config: config.wobbly,
  }));

  const animatedProps = useSpring({
    scaleX: (mouseDown ? 0.5 : 1) * glassesModeMultiplier,
    scaleY: (mouseDown ? 0.5 : 1) * glassesModeMultiplier,
    scaleZ: (mouseDown ? 0.5 : 1) * glassesModeMultiplier,
    x: (horizontalDirection * horizontalSpeed) / 1000,
    y: (verticalDirection * -1 * verticalSpeed) / 1000,
    distort: mouseDown
      ? 0.9
      : Math.min(Math.max((acceleration / 100) * 1 + 0.3, 0.3), 1),
    rotation: to([0, Math.PI, 0], (x, y, z) => [x, y, z]),
    config: config.molasses,
    loop: { reverse: true },
  });

  useEffect(() => {
    effect.current = new AnaglyphEffect(gl);
    effect.current.setSize(size.width, size.height);
    return () => {
      effect.current?.dispose();
      effect.current = null;
    };
  }, [gl, size]);

  useEffect(() => {
    const handleMouseDown = () => setMouseDown(true);
    const handleMouseUp = () => setMouseDown(false);

    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  useEffect(() => {
    api.start({
      scale: (mouseDown ? 0.5 : 1) * glassesModeMultiplier,
    });
    return () => {
      api.stop();
    };
  }, [mouseDown, glassesModeMultiplier, api]);

  useFrame(() => {
    if (effect.current) effect.current.render(scene, camera);
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
      >
        <sphereGeometry args={[1, 0.2, 16, 50]} />
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

export default memo(Mesh2);
