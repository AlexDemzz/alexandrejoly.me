import SimplrIcons1 from "@/images/simplr-icons/1.webp";
import SimplrIcons2 from "@/images/simplr-icons/2.webp";
import SimplrIcons3 from "@/images/simplr-icons/3.webp";
import SimplrIcons4 from "@/images/simplr-icons/4.webp";

import Yoojo1 from "@/images/yoojo/1.webp";
import Yoojo2 from "@/images/yoojo/2.webp";
import Yoojo3 from "@/images/yoojo/3.webp";
import Yoojo4 from "@/images/yoojo/4.webp";

import Simplr1 from "@/images/simplr-design-system/1.webp";
import Simplr2 from "@/images/simplr-design-system/2.webp";
import Simplr3 from "@/images/simplr-design-system/3.webp";

import { useLoadAssets } from "@/lib/hooks";
import BarLoader from "./Preloader/BarLoader";

const assetPaths = [
  SimplrIcons1,
  SimplrIcons2,
  SimplrIcons3,
  SimplrIcons4,
  "/1.webm",
  "/2.webm",
  "/3.webm",
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
  const handleAnimationEnd = () => {
    onComplete();
  };
  return <BarLoader percent={progress} onAnimationEnd={handleAnimationEnd} />;
};

export default Loading;
