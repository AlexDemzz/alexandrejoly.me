import Marquee from "@/components/Marquee";
import ParallaxItem from "@/components/ParallaxItem";
import TagIndicator from "@/components/TagIndicator";
import Trail from "@/components/Trail";
import { useProjects } from "@/lib/hooks";
import BackgroundVideo from "next-video/background-video";
import Image from "next/image";
import { useState } from "react";
import ProjectHero from "./ProjectHero";

const Project = ({ params }: { params: { id: string } }) => {
  const projects = useProjects();
  const data = projects.find((p) => p.id === params.id);
  console.log("data", data);
  return (
    <div className="container">
      <div className="py-24">
        <ProjectHero data={data} />
        <div className="mt-24">
          <div className="grid grid-cols-1 gap-16">
            {data?.images?.map((src, i, arr) => (
              <TagIndicator
                tag="image"
                position="top"
                key={`project-${data.id}-image-${i}`}
              >
                <ParallaxItem className="w-full overflow-hidden">
                  <Image alt="" src={src} className="w-full" />
                </ParallaxItem>
              </TagIndicator>
            ))}
            {data?.videos?.map((src, i, arr) => (
              <TagIndicator
                tag="video"
                position="top"
                key={`project-${data.id}-image-${i}`}
              >
                <ParallaxItem className="w-full overflow-hidden">
                  <BackgroundVideo src={src} />
                </ParallaxItem>
              </TagIndicator>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Project;
