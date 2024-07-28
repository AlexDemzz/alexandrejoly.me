"use client";
import ParallaxItem from "@/components/ParallaxItem";
import TagIndicator from "@/components/TagIndicator";
import { useBreakpoints, useProjects } from "@/lib/hooks";
import Image from "next/image";
import ProjectHero from "./ProjectHero";
import ScrollToDiscover from "./ScrollToDiscover";
import Video from "@/components/Video";

const Project = ({ params }: { params: { id: string } }) => {
  const projects = useProjects();
  const breakpoints = useBreakpoints();
  const data = projects.find((p) => p.id === params.id) || projects[0];
  const nextProjectIndex = projects.findIndex((p) => p.id === data.id);
  const nextProject = projects[nextProjectIndex + 1] || {
    id: "/",
    title: "Home",
  };
  return (
    <div className="pt-4">
      <div className="py-24">
        <ProjectHero data={data} />
        <div className="container">
          <div className="mt-24">
            <div className="grid grid-cols-1 gap-10 md:gap-20">
              {data?.images?.map((src, i, arr) => (
                <TagIndicator
                  tag="image"
                  position="top"
                  key={`project-${data.id}-image-${i}`}
                >
                  <ParallaxItem
                    overflow={false}
                    className="w-full"
                    range={breakpoints.get({ xs: [-20, 20], md: [50, -50] })}
                  >
                    <Image
                      alt=""
                      src={src}
                      className="w-full object-cover h-[400px] sm:h-full"
                    />
                  </ParallaxItem>
                </TagIndicator>
              ))}
              {data?.videos?.map((src, i, arr) => (
                <TagIndicator
                  tag="video"
                  position="top"
                  key={`project-${data.id}-image-${i}`}
                >
                  <ParallaxItem
                    overflow={false}
                    className="w-full pointer-events-none"
                    range={[0, 0]}
                  >
                    <Video
                      src={src}
                      className="w-full object-cover h-[400px] sm:h-full "
                    />
                  </ParallaxItem>
                </TagIndicator>
              ))}
            </div>
          </div>
        </div>
        <ScrollToDiscover data={nextProject} />
      </div>
    </div>
  );
};

export default Project;
