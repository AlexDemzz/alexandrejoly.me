"use client";

import AwardItem from "@/components/AwardItem";
import MainBlob from "@/components/MainBlob";
import ProjectItem from "@/components/ProjectItem";
import TagIndicator from "@/components/TagIndicator";
import { useProjects } from "@/lib/hooks";
import Hero from "./Hero";
import Trail from "@/components/Trail";
import Awards from "./Awards";
import H2 from "@/components/H2";
import ParallaxItem from "@/components/ParallaxItem";

export default function Home() {
  const projects = useProjects();

  return (
    <main>
      <Hero />
      <div className="container pt-24 md:py-32">
        <div className="grid grid-cols-8">
          <ParallaxItem
            range={[-20, 50]}
            speed={4}
            className="md:col-start-2 md:col-span-6"
          >
            <TagIndicator tag="h2" position="top">
              <H2>Projects</H2>
            </TagIndicator>
          </ParallaxItem>
        </div>
        <div className="mt-4 md:mt-16 space-y-10 md:space-y-36">
          {projects.map((project, i) => (
            <ProjectItem
              key={project.id}
              id={project.id}
              title={project.title}
              date={project.date}
              categories={project.tags}
              images={project.images}
              videos={project.videos}
              reverse={!!(i % 2)}
            />
          ))}
        </div>
      </div>
      <Awards />
    </main>
  );
}
