import {
  Marquee,
  MarqueeContent,
  MarqueeItem,
  MarqueePause,
  MarqueeViewport,
} from "@registry/marquee";

export const MarqueeCenter = () => (
  <Marquee className="w-full">
    <MarqueePause />
    <MarqueeViewport className="scroll-fade-x items-center-safe">
      <MarqueeContent>
        <MarqueeItem>Item 1</MarqueeItem>
        <MarqueeItem>Item 2</MarqueeItem>
      </MarqueeContent>
    </MarqueeViewport>
  </Marquee>
);
