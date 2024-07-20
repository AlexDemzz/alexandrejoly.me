import { useScroll, animated } from "@react-spring/web";
import Image from "next/image";
import React from "react";

const AnimatedImage = ({ src, ...rest }) => {
  const { scrollYProgress } = useScroll();

  return (
    <animated.div style={{ opacity: scrollYProgress }}>
      <Image src={src} alt="" {...rest} />
    </animated.div>
  );
};

export default AnimatedImage;
