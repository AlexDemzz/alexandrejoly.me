import Image from "next/image";
import Link from "next/link";
import ParallaxItem from "./ParallaxItem";
import Trail from "./Trail";
import { useState } from "react";
import { animated, config, useSpring } from "@react-spring/web";

const ProjectItem = ({
  n,
  title,
  date,
  categories,
  className = "",
  id,
  images,
  reverse,
}) => {
  const titles = title.split(" ");
  const [isHover, setIsHover] = useState(false);

  const imageProps = useSpring({
    scale: isHover ? 1.1 : 1,
    config: config.wobbly,
  });

  return (
    <Link
      href={`/projects/${id}`}
      scroll={false}
      className="block"
      onMouseEnter={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
    >
      <div className="grid grid-cols-8 relative z-10">
        <div
          className={`col-span-3 ${
            reverse ? "col-start-5 order-last" : "col-start-2"
          } h-[500px]`}
        >
          <animated.div style={imageProps} className="h-full w-full">
            <ParallaxItem className="h-full w-full overflow-hidden">
              <Image
                src={images[0]}
                className="object-cover h-[700px] w-full"
                alt={`Project Image for ${title}`}
              />
            </ParallaxItem>
          </animated.div>
        </div>
        <div
          className={`flex flex-col justify-center col-span-3 ${
            reverse ? "text-right order-first  col-start-2" : ""
          }`}
        >
          {titles.map((t, i) => (
            <ParallaxItem
              key={`project-title-${i}`}
              speed={i * 3}
              className={`text-9xl font-black -z-10  odd:z-[10]  block ${
                reverse ? "-mr-7 odd:-mr-10" : "-ml-7 odd:-ml-10"
              }`}
            >
              <Trail className="uppercase tracking-tighter">{t}</Trail>
            </ParallaxItem>
          ))}
        </div>
      </div>
    </Link>
  );
};

export default ProjectItem;
