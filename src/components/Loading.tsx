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
import Simplr3 from "@/images/simplr-design-system/3.webp";

import { useLoadAssets } from "@/lib/hooks";
import { useThrottle } from "@uidotdev/usehooks";
import { motion } from "framer-motion";
import BarLoader from "./Preloader/BarLoader";

const CircleAnimation = () => {
  const circleVariants = {
    initial: { pathLength: 0 },
    animate: {
      pathLength: 0.75,
      transition: { duration: 2, ease: "easeInOut" },
    },
  };

  return (
    <svg width="100" height="100" viewBox="0 0 200 200">
      <motion.circle
        cx="100"
        cy="100"
        r="90"
        fill="transparent"
        stroke="hsl(var(--foreground))"
        strokeWidth="24"
        strokeLinecap="round"
        initial="initial"
        animate="animate"
        variants={circleVariants}
        transform="rotate(-180 100 100)"
      />
    </svg>
  );
};

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
  Simplr3,
];

const Loading = ({ onComplete }: { onComplete: () => void }) => {
  const progress = useLoadAssets(assetPaths);
  const throttledValue = useThrottle(progress, 1000);
  const handleAnimationEnd = () => {
    onComplete();
  };
  return (
    <div className="relative flex items-center">
      {/* <div className="absolute ">
        <CircleAnimation />
      </div> */}
      <BarLoader percent={throttledValue} onAnimationEnd={handleAnimationEnd} />
    </div>
  );
};

export default Loading;
