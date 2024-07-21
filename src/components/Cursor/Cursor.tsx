"use client";
import { Canvas } from "@react-three/fiber";
import CursorWrapper from "./CursorWrapper";
import Mesh from "./Mesh";
import { Globals } from "@react-spring/web";

Globals.assign({
  frameLoop: "always",
});

const Cursor = () => {
  return (
    <CursorWrapper>
      {({ isMoving, isHover, isMouseDown }) => (
        <Canvas
          frameloop={"always"}
          camera={{ position: [0, 0, 5], near: 0.1, far: 1000 }}
          style={{ width: "100%", height: "100%" }}
        >
          <ambientLight intensity={100} />
          <directionalLight position={[5, 5, 5]} />
          <Mesh
            isMoving={isMoving || isHover}
            isMouseDown={isMouseDown}
            isHover={isHover}
          />
        </Canvas>
      )}
    </CursorWrapper>
  );
};

export default Cursor;
