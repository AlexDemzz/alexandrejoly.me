import {
  Marquee,
  MarqueeContent,
  MarqueeItem,
  MarqueeViewport,
} from "@registry/marquee";

export const MarqueeFit = () => (
  <Marquee className="w-full">
    <MarqueeViewport className="scroll-fade-x">
      <MarqueeContent>
        <MarqueeItem>Item 1</MarqueeItem>
        <MarqueeItem>Item 2</MarqueeItem>
      </MarqueeContent>
    </MarqueeViewport>
  </Marquee>
);
