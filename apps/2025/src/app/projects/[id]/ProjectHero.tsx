import Marquee from "@/components/Marquee";
import TagIndicator from "@/components/TagIndicator";
import Trail from "@/components/Trail";
import { Project } from "@/lib/types";
import { motion, useScroll, useTransform } from "framer-motion";

const ProjectHero = ({ data }: { data: Project }) => {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 900], [0, 200]);
  const opacity = useTransform(scrollY, [0, 1500], [1, 0]);

  return (
    <motion.div style={{ y, opacity, willChange: "transform, opacity" }}>
      <h1>
        <div className="text-8xl lg:text-[13rem] font-black tracking-tighter leading-none uppercase overflow-hidden w-full">
          <Trail>
            <Marquee>
              <h1 className="mr-8 inline">{data.title}</h1>
              <span
                className="font-outline-2 text-background"
                aria-hidden="true"
              >
                {data.title}
              </span>
            </Marquee>
          </Trail>
        </div>
      </h1>
      <div className="container">
        <div className="grid grid-cols-8 mt-16 gap-x-10 md:gap-x-0 gap-y-10">
          <div className="col-span-8 md:col-span-2">
            <TagIndicator tag="div" position="top">
              <Trail className="text-lg md:text-xl font-bold" delay={600}>
                {data.date}
              </Trail>
            </TagIndicator>
          </div>

          <div className="col-span-8 md:col-span-3">
            <TagIndicator tag="p" position="top">
              <Trail className="text-lg md:text-2xl" delay={300}>
                {data.description}
              </Trail>
            </TagIndicator>
          </div>

          <div className="col-span-8 md:col-span-2 md:col-start-7">
            <TagIndicator tag="div" position="top">
              <div className="flex flex-wrap gap-2">
                {data?.tags?.map((tag, i, arr) => (
                  <Trail
                    noSplit
                    delay={600 + i * 100}
                    className="bg-foreground text-background px-3 py-2 rounded-full text-sm md:text-base font-bold"
                    key={`project-${data.id}-tag-${i}`}
                  >
                    {tag}
                  </Trail>
                ))}
              </div>
            </TagIndicator>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProjectHero;
