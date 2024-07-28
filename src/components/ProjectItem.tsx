"use client";
import { MOTION_TRANSITION } from "@/lib/constants";
import useBreakpoint from "@/lib/hooks/useBreakpoints";
import { motion } from "framer-motion";
import Image, { StaticImageData } from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import ParallaxItem from "./ParallaxItem";
import Trail from "./Trail";

interface ProjectItemProps {
  title: string;
  date: string;
  categories: string[];
  className?: string;
  id: string;
  images?: StaticImageData[];
  videos?: string[];
  reverse?: boolean;
}

const ProjectItem: React.FC<ProjectItemProps> = ({
  title,
  id,
  images,
  videos,
  reverse,
}) => {
  const breakpoints = useBreakpoint();
  const containerRef = useRef<HTMLAnchorElement>(null);
  // const currIndex = useMouseIndexSwitcher(containerRef, images || videos);
  const currIndex = 0;
  const titles = title.split(" ");
  const [isHover, setIsHover] = useState(false);

  return (
    <Link
      ref={containerRef}
      href={`/projects/${id}`}
      scroll={false}
      className="block"
      onMouseEnter={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
    >
      <div className="grid grid-cols-1 md:grid-cols-8 relative z-10">
        <div
          className={`md:col-span-3 ${
            reverse ? "md:col-start-5 md:order-last" : "md:col-start-2"
          }`}
        >
          <motion.div
            animate={{ scale: isHover ? 1.1 : 1 }}
            transition={{ ...MOTION_TRANSITION }}
            className="h-full w-full flex items-center"
          >
            <ParallaxItem
              className="w-full"
              overflow={false}
              range={[-100, 100]}
            >
              {videos && (
                <video
                  loop
                  autoPlay
                  src={videos[currIndex]}
                  className="object-cover h-[475px] md:h-[700px] w-full pointer-events-none"
                />
              )}
              {images && !videos && (
                <Image
                  src={images[currIndex]}
                  className="object-cover h-[475px] md:h-[700px] w-full"
                  alt={`Project Image for ${title}`}
                />
              )}
            </ParallaxItem>
          </motion.div>
        </div>
        <div
          className={`flex flex-col justify-center md:col-span-3 text-center md:text-left ${
            reverse ? "md:text-right md:order-first md:col-start-2" : ""
          }`}
        >
          {titles.map((t, i) => (
            <ParallaxItem
              key={`project-title-${i}`}
              speed={i * 3}
              range={breakpoints.get({ xs: [-50, 50], md: [-100, 100] })}
              className={`text-6xl md:text-9xl font-black md:-z-10  odd:md:z-[10]  block ${
                reverse ? "md:-mr-7 odd:md:-mr-10" : "md:-ml-7 odd:md:-ml-10"
              }`}
            >
              <Trail className="uppercase tracking-tighter mix-blend-difference">
                {t}
              </Trail>
            </ParallaxItem>
          ))}
        </div>
      </div>
    </Link>
  );
};

export default ProjectItem;
