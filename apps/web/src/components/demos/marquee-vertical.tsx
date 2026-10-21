import { Marquee, MarqueeContent, MarqueeItem } from "@registry/marquee";

const ITEMS = Array.from({ length: 6 }, (_, index) => `Item ${index + 1}`);

export const MarqueeVertical = () => (
  <Marquee className="scroll-fade-y h-40 w-full">
    <MarqueeContent className="[--marquee-duration:12s]" orientation="vertical">
      {ITEMS.map((item) => (
        <MarqueeItem key={item}>{item}</MarqueeItem>
      ))}
    </MarqueeContent>
  </Marquee>
);
