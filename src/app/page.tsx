"use client";

import AwardItem from "@/components/AwardItem";
import MainBlob from "@/components/MainBlob";
import ProjectItem from "@/components/ProjectItem";
import TagIndicator from "@/components/TagIndicator";
import Link from "next/link";

export default function Home() {
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
            <ProjectItem
              n={"001"}
              title="Yoojo"
              date={"2018-now"}
              categories={["React.js", "UI/UX Design, Visual Identity"]}
            />
            <ProjectItem
              n={"002"}
              title="Simplr Design system"
              date={"2018-now"}
              categories={["UI/UX Design"]}
            />
            <ProjectItem
              n={"003"}
              title="Simplr Icons"
              date={"2018-now"}
              categories={["Iconography"]}
            />
            <ProjectItem
              n={"004"}
              title="Portfolio 2018"
              date={"2018"}
              categories={["React.js, Visual Identity, UI/UX Design"]}
              className={"border-b"}
            />
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
