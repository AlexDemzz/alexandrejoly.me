"use client";
import { AWARDS_URL } from "@/lib/constants";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import TagIndicator from "./TagIndicator";
import Trail from "./Trail";

const AwardItem = ({ title }: { title: string }) => {
  return (
    <>
      <Link target="_blank" href={AWARDS_URL}>
        <TagIndicator tag="a" position="top">
          <div className="flex align-items-center">
            <div>
              <Trail className="text-3xl md:text-5xl font-bold">{title}</Trail>
              <span className="font-mono">
                <Trail as="span" className={"mr-2"}>
                  alexandrejoly.me
                </Trail>
                <Trail
                  noSplit
                  as="sup"
                  className="font-features sups font-mono mr-4 text-sm"
                >
                  (2018)
                </Trail>
              </span>
            </div>
            <ArrowUpRight />
          </div>
        </TagIndicator>
      </Link>
    </>
  );
};

export default AwardItem;
