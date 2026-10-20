import {
  Marquee,
  MarqueeContent,
  MarqueeFade,
  MarqueeItem,
} from "@registry/marquee";

export const MarqueeFit = () => (
  <Marquee className="w-full">
    <MarqueeFade side="left" />
    <MarqueeContent>
      <MarqueeItem>Item 1</MarqueeItem>
      <MarqueeItem>Item 2</MarqueeItem>
    </MarqueeContent>
    <MarqueeFade side="right" />
  </Marquee>
);
