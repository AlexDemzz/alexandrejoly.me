"use client";
import Marquee from "@/components/Marquee";
import ParallaxItem from "@/components/ParallaxItem";
import TagIndicator from "@/components/TagIndicator";
import Trail from "@/components/Trail";
import { useProjects } from "@/lib/hooks";
import BackgroundVideo from "next-video/background-video";
import Image from "next/image";
import { useState } from "react";

const Project = ({ params }: { params: { id: string } }) => {
  const originalWarn = console.warn;
  console.warn = (message) => {
    if (
      message.includes(
        "Cannot call the manual advancement of rafz whilst frameLoop is not set as demand"
      )
    ) {
      return;
    }
    originalWarn(message);
  };

  const projects = useProjects();
  const [data] = useState(projects.find((p) => p.id === params.id));
  console.log("data", data);
  return (
    <div className="container">
      <div className="py-24">
        <TagIndicator tag="h1" position="top">
          <h1>
            <div className="text-[13rem] font-black tracking-tighter leading-none uppercase">
              <Marquee>
                <span className="mr-8">{data.title}</span>
                <span className="font-outline-2">{data.title}</span>
              </Marquee>
            </div>
            {/* <Trail className="text-[13rem] font-black tracking-tighter leading-none uppercase">
              {data.title}
            </Trail>
            <Trail className="text-[13rem] font-black tracking-tighter leading-none uppercase">
              {data.title}
            </Trail> */}
          </h1>
        </TagIndicator>
        <div className="grid grid-cols-8 mt-16">
          <div className="col-span-2">
            <TagIndicator tag="div" position="top">
              <Trail className="text-2xl uppercase font-mono" delay={600}>
                {data.date}
              </Trail>
            </TagIndicator>
          </div>

          <div className="col-span-3">
            <TagIndicator tag="p" position="top">
              <Trail className="text-2xl" delay={300}>
                {data.description}
              </Trail>
            </TagIndicator>
          </div>

          <div className="col-span-3">
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
