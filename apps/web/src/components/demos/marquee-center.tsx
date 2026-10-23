import {
  Marquee,
  MarqueeContent,
  MarqueeItem,
  MarqueeViewport,
} from "@registry/marquee";

export const MarqueeCenter = () => (
  <Marquee className="w-full">
    <MarqueeViewport className="scroll-fade-x items-center-safe">
      <MarqueeContent>
        <MarqueeItem>Item 1</MarqueeItem>
        <MarqueeItem>Item 2</MarqueeItem>
      </MarqueeContent>
    </MarqueeViewport>
  </Marquee>
);
