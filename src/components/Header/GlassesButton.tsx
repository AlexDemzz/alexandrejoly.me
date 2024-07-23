import React from "react";
import { useApp } from "@/lib/hooks";
import Image from "next/image";
import Glasses from "@/images/3d_glasses.svg";
import { motion } from "framer-motion";
import { MOTION_TRANSITION } from "@/lib/constants";

const GlassesButton = ({ isMouseDown }) => {
  const [_, setState] = useApp();

  const handleGlassClick = () => {
    setState((o) => ({ ...o, glassesMode: !o.glassesMode }));
  };

  const variants = {
    pressed: { rotate: 10, scale: 1.2 },
    normal: { rotate: 0, scale: 1 },
    transition: MOTION_TRANSITION,
  };

  return (
    <motion.button
      type="button"
      onClick={handleGlassClick}
      animate={isMouseDown ? "pressed" : "normal"}
      variants={variants}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <Image src={Glasses} alt="toggle 3D mode" height={80} />
    </motion.button>
  );
};

export default GlassesButton;
