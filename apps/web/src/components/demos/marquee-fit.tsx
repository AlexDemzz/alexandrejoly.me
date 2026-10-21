import { Marquee, MarqueeContent, MarqueeItem } from "@registry/marquee";

export const MarqueeFit = () => (
  <Marquee className="scroll-fade-x w-full">
    <MarqueeContent>
      <MarqueeItem>Item 1</MarqueeItem>
      <MarqueeItem>Item 2</MarqueeItem>
    </MarqueeContent>
  </Marquee>
);
