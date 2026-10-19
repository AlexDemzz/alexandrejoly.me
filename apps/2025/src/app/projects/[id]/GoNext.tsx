import AnimatedLink from "@/components/AnimatedLink";
import Trail from "@/components/Trail";
import { Project } from "@/lib/types";

const GoNext = ({ data }: { data: Project }) => {
  return (
    <div className="flex flex-col items-center">
      <Trail className="font-bold text-lg md:text-3xl uppercase">
        {data.id !== "/" ? "Next project" : "Back to"}
      </Trail>
      <div className="text-6xl md:text-[8vw] font-black text-foreground leading-none uppercase overflow-hidden text-center">
        <AnimatedLink href={data.id} scroll={false}>
          <Trail aria-hidden="true">{data.title}</Trail>
        </AnimatedLink>
      </div>
    </div>
  );
};

export default GoNext;
