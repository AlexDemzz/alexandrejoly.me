"use client";
import { Canvas } from "@react-three/fiber";
import Mesh from "./Mesh";
import Mesh2 from "./Mesh2";

const MainBlob = () => {
  return (
    <div className="relative min-w-[1400px] min-h-[1400px] flex items-center justify-center">
      <div className="mix-blend-difference absolute w-full h-full">
        <Canvas frameloop={"always"}>
          <ambientLight intensity={100} />
          <directionalLight position={[5, 5, 5]} />
          <Mesh />
        </Canvas>
      </div>
      <div className="mix-blend-difference absolute w-[full] h-full top-[10%] right-[18%] p-60">
        <Canvas frameloop={"always"}>
          <ambientLight intensity={100} />
          <directionalLight position={[5, 5, 5]} />
          <Mesh />
        </Canvas>
      </div>
    </div>
  );
};

export default MainBlob;
