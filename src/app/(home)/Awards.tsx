import AwardItem from "@/components/AwardItem";
import H2 from "@/components/H2";
import HoverImage from "@/components/HoverImage/HoverImage";
import ParallaxItem from "@/components/ParallaxItem";
import TagIndicator from "@/components/TagIndicator";
import Trail from "@/components/Trail";
import { useProjects } from "@/lib/hooks";
import React, { useState } from "react";

const Awards = () => {
  const projects = useProjects();
  const project = projects.find((p) => p.id === "portfolio-2018");

  return (
    <div className="container  pb-24 pt-40 md:pb-32 md:pt-32">
      <div className="grid grid-cols-1 lg:grid-cols-8 gap-16 lg:gap-0">
        <div className="lg:col-span-3 lg:col-start-2">
          <ParallaxItem range={[-150, 0]} speed={6}>
            <TagIndicator tag="h2" position="top">
              <H2>Awards</H2>
            </TagIndicator>
          </ParallaxItem>
        </div>
        <div className="lg:col-span-4 lg:col-start-5">
          <HoverImage videos={project?.videos} images={project?.images}>
            <div className="flex flex-col gap-14">
              <ParallaxItem range={[-150, 0]} speed={1}>
                <AwardItem title="Website of the day" />
              </ParallaxItem>
              <ParallaxItem range={[-150, 0]} speed={4}>
                <AwardItem title="Best UI Design" />
              </ParallaxItem>
              <ParallaxItem range={[-150, 0]} speed={2}>
                <AwardItem title="Best UX Design" />
              </ParallaxItem>
              <ParallaxItem range={[-150, 0]} speed={1}>
                <AwardItem title="Best Innovation" />
              </ParallaxItem>
            </div>
          </HoverImage>
        </div>
      </div>
    </div>
  );
};

export default Awards;
