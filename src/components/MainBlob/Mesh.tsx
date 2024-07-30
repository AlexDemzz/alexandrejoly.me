"use client";
import { useApp } from "@/lib/hooks";
import { a, config, useSpring } from "@react-spring/three";
import { MeshWobbleMaterial } from "@react-three/drei";
import { extend, useFrame, useThree } from "@react-three/fiber";
import { useTheme } from "next-themes";
import { memo, useEffect, useRef, useState } from "react";
import { Mesh as MeshType, TorusGeometry } from "three";
import { AnaglyphEffect } from "three-stdlib";

extend({ AnaglyphEffect });

const Mesh = () => {
  const { theme } = useTheme();
  const [mouseDown, setMouseDown] = useState(false);
  const [{ glassesMode, hoverEnabled }] = useApp();
  const glassesModeMultiplier = glassesMode ? 1.2 : 1;
  const myMesh = useRef<MeshType>(null);
  const { gl, size } = useThree();
  const effect = useRef<AnaglyphEffect | null>(null);

  const [springProps, api] = useSpring(() => ({
    scale: 0.5 * glassesModeMultiplier,
    config: config.wobbly,
  }));

  useEffect(() => {
    effect.current = new AnaglyphEffect(gl);
    effect.current.setSize(size.width, size.height);
    return () => {
      effect.current?.dispose();
      effect.current = null;
    };
  }, [gl, size]);

  const [{ radius }, api2] = useSpring(() => ({
    radius: 0.5,
    config: config.wobbly,
  }));

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
      scale: (mouseDown && !glassesMode ? 1.5 : 2) * glassesModeMultiplier,
    });
    api2.start({
      radius: hoverEnabled ? 1.4 : 1,
    });
    return () => {
      api.stop();
      api2.stop();
    };
  }, [mouseDown, glassesModeMultiplier, api, api2, hoverEnabled]);

  useFrame(({ clock }) => {
    if (myMesh.current) {
      myMesh.current.rotation.x = clock.getElapsedTime();
      myMesh.current.rotation.y = clock.getElapsedTime();
      const newGeometry = new TorusGeometry(radius.get(), 0.15, 16, 50);
      myMesh.current.geometry.dispose();
      myMesh.current.geometry = newGeometry;
    }
  });

  return (
    <>
      <a.mesh ref={myMesh} scale={springProps.scale}>
        <torusGeometry args={[1, 0.2, 16, 50]} />
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

export default memo(Mesh);
