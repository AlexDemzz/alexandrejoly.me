"use client";

import AwardItem from "@/components/AwardItem";
import MainBlob from "@/components/MainBlob";
import ProjectItem from "@/components/ProjectItem";
import TagIndicator from "@/components/TagIndicator";
import { useProjects } from "@/lib/hooks";
import Hero from "./Hero";
import Trail from "@/components/Trail";
import Awards from "./Awards";

export default function Home() {
  const projects = useProjects();
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

  return (
    <main>
      <Hero />
      <div className="container py-32">
        <TagIndicator tag="h2" position="top">
          <h2 className="uppercase tracking-tighter font-black text-5xl">
            <Trail>Featured projects</Trail>
          </h2>
        </TagIndicator>
        <div className="mt-16 space-y-36">
          {projects.map((project, i) => (
            <ProjectItem
              key={project.id}
              id={project.id}
              n={(i + 1).toString().padStart(3, "0")}
              title={project.title}
              date={project.date}
              categories={project.tags}
              images={project.images}
              videos={project.videos}
              reverse={i % 2}
            />
          ))}
        </div>
      </div>
      <Awards />
    </main>
  );
}
