"use client";

import AwardItem from "@/components/AwardItem";
import MainBlob from "@/components/MainBlob";
import ProjectItem from "@/components/ProjectItem";
import TagIndicator from "@/components/TagIndicator";
import { useProjects } from "@/lib/hooks";

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
      <div className="container pb-32">
        <TagIndicator
          tag="canvas"
          position="top"
          className="w-[500px] h-[100px] flex items-center justify-center ml-auto mt-[200px]"
        >
          <MainBlob />
        </TagIndicator>
        <TagIndicator tag="h1" position="top" className="mb-10">
          <h1 className="grid grid-cols-6">
            <span className="block text-[140px] font-black col-span-6 tracking-tighter leading-none">
              Creative
            </span>
            <span className="block text-[140px] font-black col-start-2 col-span-5 tracking-tighter leading-none">
              Developer
            </span>
          </h1>
        </TagIndicator>
        <TagIndicator tag="p" position="top" className="grid grid-cols-6">
          <p className="text-2xl font-medium col-span-3">
            I’m a front-end developer and UI/UX designer, I transform ideas into
            dynamic digital experiences. My mission is to create stunning,
            intuitive, and engaging interfaces that meet today's needs and adapt
            to tomorrow's challenges.
          </p>
        </TagIndicator>
      </div>

      <div className="container py-32">
        <TagIndicator tag="h2" position="top">
          <h2 className="uppercase tracking-tighter font-black text-5xl">
            Projects
          </h2>
        </TagIndicator>
        <div className="mt-16">
          <TagIndicator tag="table" position="top">
            {projects.map((project, i) => (
              <ProjectItem
                key={project.id}
                id={project.id}
                n={(i + 1).toString().padStart(3, "0")}
                title={project.title}
                date={project.date}
                categories={project.tags}
                images={project.images}
              />
            ))}
          </TagIndicator>
        </div>
      </div>
      <div className="container py-32">
        <TagIndicator tag="h2" position="top">
          <h2 className="uppercase tracking-tighter font-black text-5xl">
            Awards
          </h2>
        </TagIndicator>
        <div className="mt-16 space-y-20">
          <AwardItem title="Best UI Design" />
          <AwardItem title="Best UX Design" />
          <AwardItem title="Best Innovation" />
        </div>
      </div>
    </main>
  );
}
