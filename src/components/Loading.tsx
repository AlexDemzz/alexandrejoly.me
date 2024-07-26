import SimplrIcons1 from "@/images/simplr-icons/1.webp";
import SimplrIcons2 from "@/images/simplr-icons/2.webp";
import SimplrIcons3 from "@/images/simplr-icons/3.webp";
import SimplrIcons4 from "@/images/simplr-icons/4.webp";

import Portfolio1 from "/videos/1.webm";
import Portfolio2 from "/videos/2.webm";
import Portfolio3 from "/videos/3.webm";

import Yoojo1 from "@/images/yoojo/1.webp";
import Yoojo2 from "@/images/yoojo/2.webp";
import Yoojo3 from "@/images/yoojo/3.webp";
import Yoojo4 from "@/images/yoojo/4.webp";

import Simplr1 from "@/images/simplr-design-system/1.webp";
import Simplr2 from "@/images/simplr-design-system/2.webp";

import React, { useState, useEffect, useRef, useCallback } from "react";
import BarLoader from "./Preloader/BarLoader";
import { useThrottle } from "@uidotdev/usehooks";
import { useLoadAssets } from "@/lib/hooks";

const assetPaths = [
  SimplrIcons1,
  SimplrIcons2,
  SimplrIcons3,
  SimplrIcons4,
  Portfolio1,
  Portfolio2,
  Portfolio3,
  Yoojo1,
  Yoojo2,
  Yoojo3,
  Yoojo4,
  Simplr1,
  Simplr2,
];

const Loading = ({ onComplete }: { onComplete: () => void }) => {
  const progress = useLoadAssets(assetPaths);
  const throttledValue = useThrottle(progress, 1000);
  const handleAnimationEnd = () => {
    onComplete();
  };
  return (
    <>
      <BarLoader percent={throttledValue} onAnimationEnd={handleAnimationEnd} />
    </>
  );
};

export default Loading;
