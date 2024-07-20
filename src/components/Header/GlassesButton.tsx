import React from "react";
import { useApp } from "@/lib/hooks";
import Image from "next/image";
import Glasses from "@/images/3d_glasses.svg";
import { useSpring, animated } from "@react-spring/web";

const GlassesButton = () => {
  const [hovered, setHovered] = React.useState(false);
  const [mouseDown, setMouseDown] = React.useState(false);

  const springProps = useSpring({
    transform: `
      scale(${hovered ? 1.2 : 1}) 
      rotate(${hovered ? 10 : 0}deg) 
      rotate(${mouseDown ? -10 : 0}deg)
    `,
    config: { tension: 300, friction: 10 },
  });

  const [state, setState] = useApp();

  const handleGlassClick = () => {
    setState((o) => ({ ...o, glassesMode: !o.glassesMode }));
  };

  return (
    <animated.button
      type="button"
      onClick={handleGlassClick}
      style={springProps}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onMouseDown={() => setMouseDown(true)}
      onMouseUp={() => setMouseDown(false)}
    >
      <Image src={Glasses} alt="toggle 3D mode" height={50} />
    </animated.button>
  );
};

export default GlassesButton;
