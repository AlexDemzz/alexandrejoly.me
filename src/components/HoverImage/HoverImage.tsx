"use client";
import Portal from "@/components/Portal";
import { useMouseAcceleration } from "@/lib/hooks";
import { animated, useSpring, useTransition } from "@react-spring/web";
import Image from "next/image";

const HoverImage = ({
  visible,
  images,
}: {
  visible: boolean;
  images: string[];
}) => {
  const mouseAcceleration = useMouseAcceleration();

  const imagePosition = useSpring({
    to: {
      x: mouseAcceleration.x,
      y: mouseAcceleration.y,
    },
  });

  const transitions = useTransition(visible, {
    enter: {
      clipPath: "polygon(0% 0%, 0% 100%, 100% 100%, 100% 0%)",
    },
    from: {
      clipPath: "polygon(0% 0%, 0% 100%, 0% 100%, 0% 0%)",
    },
    leave: {
      clipPath: "polygon(0% 0%, 0% 100%, 0% 100%, 0% 0%)",
    },
  });

  const imagePositionDelayed = useSpring({
    to: {
      scale: 1.3,
      x:
        (mouseAcceleration.horizontalDirection *
          -1 *
          mouseAcceleration.horizontalSpeed) /
        10,
      y:
        (mouseAcceleration.verticalDirection *
          -1 *
          mouseAcceleration.verticalSpeed) /
        10,
    },
  });

  return (
    <div>
      {transitions((style, item) =>
        item ? (
          <Portal>
            <animated.div
              style={{
                ...imagePosition,
                ...style,
                transform: "translate(10%, -110%)",
              }}
              className={
                "fixed z-10 pointer-events-none overflow-hidden w-[400px] h-[250px] bg-foreground border-foreground flex items-center justify-center"
              }
            >
              <animated.div style={imagePositionDelayed}>
                <Image src={images[0]} alt="" className="object-fill" />
              </animated.div>
            </animated.div>
          </Portal>
        ) : null
      )}
    </div>
  );
};

export default HoverImage;
