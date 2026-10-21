import { Marquee, MarqueeContent, MarqueeItem } from "@registry/marquee";

const ITEMS = Array.from({ length: 8 }, (_, index) => `Item ${index + 1}`);

export const MarqueeDemo = () => (
  <Marquee className="scroll-fade-x w-full">
    <MarqueeContent>
      {ITEMS.map((item) => (
        <MarqueeItem key={item}>{item}</MarqueeItem>
      ))}
    </MarqueeContent>
  </Marquee>
);
