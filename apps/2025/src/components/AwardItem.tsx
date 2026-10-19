"use client";
import { AWARDS_URL } from "@/lib/constants";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import TagIndicator from "./TagIndicator";
import Trail from "./Trail";

const AwardItem = ({
  title,
  subtitle,
  date,
  href,
}: {
  title: string;
  subtitle: string;
  date: string;
  href: string;
}) => {
  return (
    <>
      <Link target="_blank" href={href}>
        <TagIndicator tag="a" position="top">
          <div className="flex align-items-center">
            <div>
              <Trail className="text-3xl md:text-5xl font-bold">{title}</Trail>
              <span className="font-mono">
                <Trail noSplit as="span" className={"mr-2 font-bold"}>
                  {subtitle}
                </Trail>
                {date && (
                  <Trail
                    noSplit
                    as="sup"
                    className="font-features sups font-mono mr-4 text-sm"
                  >
                    {date}
                  </Trail>
                )}
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
