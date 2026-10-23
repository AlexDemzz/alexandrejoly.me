import { Marquee, MarqueeContent, MarqueeItem } from "@registry/marquee";

export const MarqueeCenter = () => (
  <Marquee className="scroll-fade-x w-full items-center-safe">
    <MarqueeContent>
      <MarqueeItem>Item 1</MarqueeItem>
      <MarqueeItem>Item 2</MarqueeItem>
    </MarqueeContent>
  </Marquee>
);
