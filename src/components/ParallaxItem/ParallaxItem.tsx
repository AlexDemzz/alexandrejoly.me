"use client";
import {
  animated,
  useIsomorphicLayoutEffect,
  useScroll,
  useSpring,
} from "@react-spring/web";

const ScrollImage = ({ children, className = "", speed = 5 }) => {
  const tension = 200 - speed * 20;
  const friction = 20 + speed * 10;

  const { scrollYProgress } = useScroll();

  const [springs, api] = useSpring(() => ({
    y: 0,
  }));

  useIsomorphicLayoutEffect(() => {
    api.start({
      from: {
        y: 0,
      },
      to: {
        y: scrollYProgress.to([0, 1], [-100, 100]),
      },
      config: { tension, friction },
    });
  }, [scrollYProgress]);

  return (
    <div className={`${className}`}>
      <div className="flex justify-center flex-col h-full">
        <animated.div style={springs}>{children}</animated.div>
      </div>
    </div>
  );
};

export default ScrollImage;
