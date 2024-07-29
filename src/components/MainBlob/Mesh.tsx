"use client";
import { useApp } from "@/lib/hooks";
import { a, config, useSpring } from "@react-spring/three";
import { MeshWobbleMaterial } from "@react-three/drei";
import { extend, useFrame, useThree } from "@react-three/fiber";
import { useTheme } from "next-themes";
import { useEffect, useRef, useState } from "react";
import { Mesh as MeshType } from "three";
import { AnaglyphEffect } from "three-stdlib";

// extend({ AnaglyphEffect });

const Mesh = () => {
  const { theme } = useTheme();
  const [mouseDown, setMouseDown] = useState(false);
  const [{ glassesMode }] = useApp();
  const glassesModeMultiplier = glassesMode ? 1.2 : 1;
  const myMesh = useRef<MeshType>(null);
  const { gl, size } = useThree();
  // const effect = useRef<AnaglyphEffect | null>(null);

  const [springProps, api] = useSpring(() => ({
    scale: 0.5 * glassesModeMultiplier,
    config: config.wobbly,
  }));

  // useEffect(() => {
  //   effect.current = new AnaglyphEffect(gl);
  //   effect.current.setSize(size.width, size.height);
  //   return () => {
  //     effect.current?.dispose();
  //     effect.current = null;
  //   };
  // }, [gl, size]);

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
      scale: (mouseDown ? 1.5 : 2) * glassesModeMultiplier,
    });
    return () => {
      api.stop();
    };
  }, [mouseDown, glassesModeMultiplier, api]);

  useFrame(({ clock }) => {
    if (myMesh.current) {
      myMesh.current.rotation.x = clock.getElapsedTime();
      myMesh.current.rotation.y = clock.getElapsedTime();
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

export default Mesh;
