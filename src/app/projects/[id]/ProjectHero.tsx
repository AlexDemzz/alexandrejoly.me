"use client";
import Marquee from "@/components/Marquee";
import TagIndicator from "@/components/TagIndicator";
import Trail from "@/components/Trail";
import { motion, useScroll, useTransform } from "framer-motion";
const ProjectHero = ({ data }) => {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, 1000]);

  return (
    <motion.div style={{ y }}>
      <TagIndicator tag="h1" position="top">
        <h1>
          <div className="text-8xl lg:text-[13rem] font-black tracking-tighter leading-none uppercase">
            <Marquee>
              <h1 className="mr-8 inline">{data.title}</h1>
              <span className="font-outline-2" aria-hidden="true">
                {data.title}
              </span>
            </Marquee>
          </div>
        </h1>
      </TagIndicator>
      <div className="grid grid-cols-8 mt-16 gap-x-10 md:gap-x-0 gap-y-10">
        <div className="col-span-8 md:col-span-2">
          <TagIndicator tag="div" position="top">
            <Trail className="text-2xl uppercase font-mono" delay={600}>
              {data.date}
            </Trail>
          </TagIndicator>
        </div>

        <div className="col-span-8 md:col-span-3">
          <TagIndicator tag="p" position="top">
            <Trail className="text-2xl" delay={300}>
              {data.description}
            </Trail>
          </TagIndicator>
        </div>

        <div className="col-span-8 md:col-span-2 md:col-start-7">
          <TagIndicator tag="div" position="top">
            <div className="flex flex-wrap gap-3">
              {data?.tags.map((tag, i, arr) => (
                <Trail
                  noSplit
                  delay={600 + i * 100}
                  className="border-2 p-3 rounded-full text-base font-bold"
                  key={`project-${data.id}-tag-${i}`}
                >
                  {tag}
                </Trail>
              ))}
            </div>
          </TagIndicator>
        </div>
      </div>
    </motion.div>
  );
};

export default ProjectHero;
