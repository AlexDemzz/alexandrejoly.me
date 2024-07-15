import { ArrowUpRight } from "lucide-react";
import React from "react";
import TagIndicator from "./TagIndicator";

const AwardItem = ({ title }) => {
  return (
    <TagIndicator tag="a" position="top">
      <div className="flex align-items-center">
        <div>
          <div className="text-7xl font-bold">
            {title}
            <sup className="font-features sups font-mono mr-4 text-base">
              2018
            </sup>
          </div>
          <span className="font-mono">
            alexandrejoly.me
            <sup className="font-features sups font-mono mr-4 text-base">
              (1.0)
            </sup>
          </span>
        </div>
        <ArrowUpRight />
      </div>
    </TagIndicator>
  );
};

export default AwardItem;
