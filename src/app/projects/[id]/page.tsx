"use client";
import ParallaxItem from "@/components/ParallaxItem";
import TagIndicator from "@/components/TagIndicator";
import { useProjects } from "@/lib/hooks";
import BackgroundVideo from "next-video/background-video";
import Image from "next/image";
import ProjectHero from "./ProjectHero";
import useBreakpoint from "@/lib/hooks/useBreakpoints";

const Project = ({ params }: { params: { id: string } }) => {
  const projects = useProjects();
  const breakpoints = useBreakpoint();
  const data = projects.find((p) => p.id === params.id) || projects[0];
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
                    className="w-full"
                    range={[0, 0]}
                  >
                    <BackgroundVideo
                      src={src}
                      className="w-full object-cover h-[400px] sm:h-full"
                    />
                  </ParallaxItem>
                </TagIndicator>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Project;
