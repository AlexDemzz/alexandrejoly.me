"use client";
import { Canvas } from "@react-three/fiber";
import Mesh from "./Mesh";
import Mesh2 from "./Mesh2";

const MainBlob = () => {
  return (
    <div className="relative min-w-[100vw] md:min-w-[100vw] min-h-[50vh] md:min-h-[100vh] flex items-center justify-center">
      <div className=" absolute w-full h-full">
        <Canvas>
          <ambientLight intensity={0.5} />
          <directionalLight position={[0, 0, 5]} />
          <Mesh2 />
          <Mesh />
        </Canvas>
      </div>
    </div>
  );
};

export default MainBlob;
