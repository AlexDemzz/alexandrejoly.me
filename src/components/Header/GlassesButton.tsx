import React from "react";
import { useApp } from "@/lib/hooks";
import Image from "next/image";
import Glasses from "@/images/3d_glasses.svg";
import { useSpring, animated, config } from "@react-spring/web";

const GlassesButton = ({ isMouseDown }) => {
  const springProps = useSpring({
    transform: isMouseDown
      ? `
      rotate(10deg) scale(1.2)
    `
      : " rotate(0deg) scale(1)",
    config: config.wobbly,
  });

  const [_, setState] = useApp();

  const handleGlassClick = () => {
    setState((o) => ({ ...o, glassesMode: !o.glassesMode }));
  };

  return (
    <animated.button
      type="button"
      onClick={handleGlassClick}
      style={springProps}
    >
      <Image src={Glasses} alt="toggle 3D mode" height={80} />
    </animated.button>
  );
};

export default GlassesButton;
