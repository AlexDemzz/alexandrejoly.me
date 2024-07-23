import AwardItem from "@/components/AwardItem";
import HoverImage from "@/components/HoverImage/HoverImage";
import TagIndicator from "@/components/TagIndicator";
import Trail from "@/components/Trail";
import { useProjects } from "@/lib/hooks";
import React, { useState } from "react";

const Awards = () => {
  const [isHover, setIsHover] = useState(false);
  const projects = useProjects();
  const project = projects.find((p) => p.id === "portfolio-2018");

  return (
    <div className="container py-32">
      <div className="grid grid-cols-8 gap-16 md:gap-0">
        <div className="col-span-4">
          <TagIndicator tag="h2" position="top">
            <h2 className="uppercase tracking-tighter font-black text-5xl mt-5">
              <Trail>Awards</Trail>
            </h2>
          </TagIndicator>
        </div>
        <div className="col-span-4">
          <div
            className="flex flex-col gap-14"
            onMouseEnter={() => setIsHover(true)}
            onMouseLeave={() => setIsHover(false)}
          >
            <HoverImage
              visible={isHover}
              videos={project?.videos}
              images={project?.images}
            ></HoverImage>
            <AwardItem title="Best UI Design" />
            <AwardItem title="Best UX Design" />
            <AwardItem title="Best Innovation" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Awards;
