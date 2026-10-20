import { Marquee, MarqueeContent, MarqueeItem } from "@registry/marquee";

export const MarqueeFit = () => (
  <Marquee className="w-full">
    <MarqueeContent className="gap-8">
      <MarqueeItem>React</MarqueeItem>
      <MarqueeItem>Vite</MarqueeItem>
    </MarqueeContent>
  </Marquee>
);
