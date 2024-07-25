import AwardItem from "@/components/AwardItem";
import H2 from "@/components/H2";
import HoverImage from "@/components/HoverImage/HoverImage";
import TagIndicator from "@/components/TagIndicator";
import Trail from "@/components/Trail";
import { useProjects } from "@/lib/hooks";
import React, { useState } from "react";

const Awards = () => {
  const projects = useProjects();
  const project = projects.find((p) => p.id === "portfolio-2018");

  return (
    <div className="container py-32">
      <div className="grid grid-cols-1 md:grid-cols-8 gap-16 md:gap-0">
        <div className="md:col-span-3 md:col-start-2">
          <TagIndicator tag="h2" position="top">
            <H2>Awards</H2>
          </TagIndicator>
        </div>
        <div className="md:col-span-3 md:col-start-6">
          <HoverImage videos={project?.videos} images={project?.images}>
            <div className="flex flex-col gap-14">
              <AwardItem title="Best UI Design" />
              <AwardItem title="Best UX Design" />
              <AwardItem title="Best Innovation" />
            </div>
          </HoverImage>
        </div>
      </div>
    </div>
  );
};

export default Awards;
