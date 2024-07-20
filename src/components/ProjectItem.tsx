import { useMouseAcceleration } from "@/lib/hooks";
import { animated, useSpring, useTransition } from "@react-spring/web";
import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import Portal from "./Portal";

const ProjectItem = ({
  n,
  title,
  date,
  categories,
  className = "",
  id,
  images,
}) => {
  const [isHover, setIsHover] = useState(false);
  const mouseAcceleration = useMouseAcceleration();

  const imagePosition = useSpring({
    to: {
      x: mouseAcceleration.x,
      y: mouseAcceleration.y,
    },
  });

  const transitions = useTransition(isHover, {
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
    <>
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
                "fixed z-10 pointer-events-none overflow-hidden w-[400px] h-[250px] bg-foreground border-2 border-foreground flex items-center justify-center"
              }
            >
              <animated.div style={imagePositionDelayed}>
                <Image src={images[0]} alt="" className="object-fill" />
              </animated.div>
            </animated.div>
          </Portal>
        ) : null
      )}
      <Link
        href={`/projects/${id}`}
        onMouseEnter={() => setIsHover(true)}
        onMouseLeave={() => setIsHover(false)}
        className={`border-t border-foreground grid grid-cols-3 py-6 ${className} hover:bg-foreground hover:text-background`}
      >
        <span>
          <sup className="font-features sups font-mono text-base mr-4">{n}</sup>
          <span className="font-medium text-2xl uppercase">{title}</span>
        </span>
        <span className="font-mono text-xl font-medium uppercase">{date}</span>
        <div className="flex justify-end text-end">
          <span className="text-xl font-medium">
            {categories.map((cat: string, i: number) => (
              <span className="block" key={`cat-list-${i}-${n}`}>
                {cat}
              </span>
            ))}
          </span>
          <div className="ml-3">
            <ArrowUpRight />
          </div>
        </div>
      </Link>
    </>
  );
};

export default ProjectItem;
