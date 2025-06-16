import AwardItem from "@/components/AwardItem";
import H2 from "@/components/H2";
import HoverImage from "@/components/HoverImage/HoverImage";
import ParallaxItem from "@/components/ParallaxItem";
import TagIndicator from "@/components/TagIndicator";
import Trail from "@/components/Trail";
import { AWARDS_2024_URL, AWARDS_URL, MENTION_2024_URL } from "@/lib/constants";
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
              <H2>
                Awards&nbsp;
                <br />& Mentions
              </H2>
            </TagIndicator>
          </ParallaxItem>
        </div>
        <div className="lg:col-span-4 lg:col-start-5">
          <div className="flex flex-col gap-14 mb-14">
            <ParallaxItem range={[-150, 0]} speed={9}>
              <AwardItem
                title="Website of the day"
                subtitle="CSS Design Awards: alexandrejoly.me"
                date="Current"
                href={AWARDS_2024_URL}
              />
            </ParallaxItem>
            <ParallaxItem range={[-150, 0]} speed={8}>
              <AwardItem
                title="Best UI Design"
                subtitle="CSS Design Awards: alexandrejoly.me"
                date="Current"
                href={AWARDS_2024_URL}
              />
            </ParallaxItem>
            <ParallaxItem range={[-150, 0]} speed={7}>
              <AwardItem
                title="Best UX Design"
                subtitle="CSS Design Awards: alexandrejoly.me"
                date="Current"
                href={AWARDS_2024_URL}
              />
            </ParallaxItem>
            <ParallaxItem range={[-150, 0]} speed={6}>
              <AwardItem
                title="Best Innovation"
                subtitle="CSS Design Awards: alexandrejoly.me"
                date="Current"
                href={AWARDS_2024_URL}
              />
            </ParallaxItem>
            <ParallaxItem range={[-150, 0]} speed={5}>
              <AwardItem
                title="Honorable Mention"
                subtitle="Awwwards: alexandrejoly.me"
                date="Current"
                href={MENTION_2024_URL}
              />
            </ParallaxItem>
          </div>
          <HoverImage videos={project?.videos} images={project?.images}>
            <div className="flex flex-col gap-14">
              <ParallaxItem range={[-150, 0]} speed={4}>
                <AwardItem
                  title="Website of the day"
                  subtitle="CSS Design Awards: alexandrejoly.me"
                  date="2018"
                  href={AWARDS_URL}
                />
              </ParallaxItem>
              <ParallaxItem range={[-150, 0]} speed={3}>
                <AwardItem
                  title="Best UI Design"
                  subtitle="CSS Design Awards: alexandrejoly.me"
                  date="2018"
                  href={AWARDS_URL}
                />
              </ParallaxItem>
              <ParallaxItem range={[-150, 0]} speed={2}>
                <AwardItem
                  title="Best UX Design"
                  subtitle="CSS Design Awards: alexandrejoly.me"
                  date="2018"
                  href={AWARDS_URL}
                />
              </ParallaxItem>
              <ParallaxItem range={[-150, 0]} speed={1}>
                <AwardItem
                  title="Best Innovation"
                  subtitle="CSS Design Awards: alexandrejoly.me"
                  date="2018"
                  href={AWARDS_URL}
                />
              </ParallaxItem>
            </div>
          </HoverImage>
        </div>
      </div>
    </div>
  );
};

export default Awards;
