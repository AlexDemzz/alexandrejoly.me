import { Marquee, MarqueeContent, MarqueeItem } from "@registry/marquee";

const ITEMS = Array.from({ length: 4 }, (_, index) => `Item ${index + 1}`);

export const MarqueeVertical = () => (
  <Marquee className="h-10.5">
    <MarqueeContent duration="8s" gap="1rem" orientation="vertical">
      {ITEMS.map((item) => (
        <MarqueeItem key={item}>{item}</MarqueeItem>
      ))}
    </MarqueeContent>
  </Marquee>
);
