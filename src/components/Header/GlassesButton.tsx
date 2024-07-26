import React, { useEffect } from "react";
import { useApp, useMouseAcceleration } from "@/lib/hooks";
import Image from "next/image";
import Glasses from "@/images/3d_glasses.svg";
import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import { DEFAULT_TRANSITION } from "@/lib/constants";

const GlassesButton = ({
  isMouseDown,
  animate = true,
}: {
  isMouseDown: boolean;
  animate: boolean;
}) => {
  const [_, setState] = useApp();
  const mouseAcceleration = useMouseAcceleration();
  const accel = useMotionValue(0);
  const rotate = useTransform(accel, [-2000, 2000], [30, -30]);
  const springRotate = useSpring(rotate, DEFAULT_TRANSITION);

  useEffect(() => {
    const handleMouseMove = () => {
      let direction;
      if (mouseAcceleration.verticalSpeed > mouseAcceleration.horizontalSpeed) {
        direction = mouseAcceleration.verticalDirection;
      } else {
        direction = mouseAcceleration.horizontalDirection;
      }
      let accelerationValue = mouseAcceleration.speed * direction;
      accel.set(accelerationValue);
    };
    if (animate) handleMouseMove();
  }, [accel, mouseAcceleration, animate]);

  const handleGlassClick = () => {
    setState((o) => ({ ...o, glassesMode: !o.glassesMode }));
  };

  const pressedStyle = { rotate: 10, scale: 1.2 };

  return (
    <motion.div
      animate={isMouseDown ? pressedStyle : { rotate: 0, scale: 1 }}
      style={{ rotate: springRotate }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <Image src={Glasses} alt="toggle 3D mode" height={80} />
    </motion.div>
  );
};

export default GlassesButton;
