import {
  Marquee,
  MarqueeContent,
  MarqueeItem,
  MarqueePause,
  MarqueeViewport,
} from "@registry/marquee";

export const MarqueeFit = () => (
  <Marquee className="w-full">
    <MarqueePause />
    <MarqueeViewport className="scroll-fade-x">
      <MarqueeContent>
        <MarqueeItem>Item 1</MarqueeItem>
        <MarqueeItem>Item 2</MarqueeItem>
      </MarqueeContent>
    </MarqueeViewport>
  </Marquee>
);
