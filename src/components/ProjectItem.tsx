import { useMouseAcceleration } from "@/lib/hooks";
import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import ParallaxItem from "./ParallaxItem";
import Trail from "./Trail";

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
  const mouseAcceleration = useMouseAcceleration();

  return (
    <div className="grid grid-cols-8 relative z-10">
      <div
        className={`col-span-3 ${
          reverse ? "col-start-5 order-last" : "col-start-2"
        } h-[500px]`}
      >
        <ParallaxItem className="h-full w-full overflow-hidden">
          <Image
            src={images[0]}
            className="object-cover h-[700px] w-full"
            alt={`Project Image for ${title}`}
          />
        </ParallaxItem>
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
      {/* <Link
        href={`/projects/${id}`}
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
      </Link> */}
    </div>
  );
};

export default ProjectItem;
