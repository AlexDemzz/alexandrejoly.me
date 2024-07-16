"use client";
import { Canvas } from "@react-three/fiber";
import Mesh from "./Mesh";
import Mesh2 from "./Mesh2";
import { config, useSpring, animated } from "@react-spring/web";
import { useMouseAcceleration } from "@/lib/hooks";

const MainBlob = () => {
  const mouseAcceleration = useMouseAcceleration();
  const mainCanvas = useSpring({
    x:
      (mouseAcceleration.horizontalDirection *
        mouseAcceleration.horizontalSpeed) /
      100,
    y:
      (mouseAcceleration.verticalDirection * mouseAcceleration.verticalSpeed) /
      100,
    config: config.wobbly,
  });

  const secondCanvas = useSpring({
    x:
      (mouseAcceleration.horizontalDirection *
        mouseAcceleration.horizontalSpeed) /
      50,
    y:
      (mouseAcceleration.verticalDirection * mouseAcceleration.verticalSpeed) /
      50,
    config: config.wobbly,
  });

  return (
    <div className="relative min-w-[1400px] min-h-[1400px] flex items-center justify-center">
      <animated.div
        style={mainCanvas}
        className="mix-blend-difference absolute w-full h-full"
      >
        <Canvas frameloop={"always"}>
          <ambientLight intensity={100} />
          <directionalLight position={[5, 5, 5]} />
          <Mesh />
        </Canvas>
      </animated.div>
      <animated.div
        style={secondCanvas}
        className="mix-blend-difference absolute w-[full] h-full top-[10%] right-[18%] p-60"
      >
        <Canvas frameloop={"always"}>
          <ambientLight intensity={100} />
          <directionalLight position={[5, 5, 5]} />
          <Mesh2 />
        </Canvas>
      </animated.div>
    </div>
  );
};

export default MainBlob;
