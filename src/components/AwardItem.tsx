"use client";
import { ArrowUpRight } from "lucide-react";
import React, { useState } from "react";
import TagIndicator from "./TagIndicator";
import HoverImage from "./HoverImage/HoverImage";
import { useProjects } from "@/lib/hooks";
import Link from "next/link";
import { AWARDS_URL } from "@/lib/constants";
import Trail from "./Trail";

const AwardItem = ({ title }) => {
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
                  (v1.0 — 2018)
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
