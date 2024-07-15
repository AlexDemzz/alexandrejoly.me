import { ArrowUpRight } from "lucide-react";
import React from "react";

const ProjectItem = ({ n, title, date, categories, className }) => {
  return (
    <div
      className={`border-t border-foreground grid grid-cols-3 py-6 ${className}`}
    >
      <span>
        <sup className="font-features sups font-mono text-base mr-4">{n}</sup>
        <span className="font-medium text-2xl uppercase">{title}</span>
      </span>
      <span className="font-mono text-xl font-medium uppercase">{date}</span>
      <div className="flex justify-end text-end">
        <span className="text-xl font-medium">
          {categories.map((cat: string, i: number) => (
            <span className="block" key={`cat-list-${i}-${n}`}>
              {cat}
            </span>
          ))}
        </span>
        <div className="ml-3">
          <ArrowUpRight />
        </div>
      </div>
    </div>
  );
};

export default ProjectItem;
