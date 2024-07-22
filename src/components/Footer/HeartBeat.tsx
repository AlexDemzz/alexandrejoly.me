"use client";
import {
  useSpring,
  animated,
  useIsomorphicLayoutEffect,
} from "@react-spring/web";

const HeartBeat = () => {
  const [styles, api] = useSpring(() => ({
    from: { scale: 1 },
  }));

  useIsomorphicLayoutEffect(() => {
    const startBeat = async () => {
      while (true) {
        await api.start({ scale: 1.6 });
        await new Promise((resolve) => setTimeout(resolve, 100)); // Pause courte
        await api.start({ scale: 1 });
        await new Promise((resolve) => setTimeout(resolve, 200)); // Pause courte
        await api.start({ scale: 1.6 });
        await new Promise((resolve) => setTimeout(resolve, 100)); // Pause courte
        await api.start({ scale: 1 });
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Pause longue
      }
    };
    startBeat();
  }, [api]);

  return (
    <animated.span style={styles} className="inline-block">
      ♥
    </animated.span>
  );
};

export default HeartBeat;
