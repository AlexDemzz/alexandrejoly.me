import {
  Marquee,
  MarqueeContent,
  MarqueeFade,
  MarqueeItem,
} from "@registry/marquee";

const ITEMS = Array.from({ length: 6 }, (_, index) => `Item ${index + 1}`);

export const MarqueeVertical = () => (
  <Marquee className="h-40 w-full">
    <MarqueeFade side="top" />
    <MarqueeContent className="[--marquee-duration:12s]" orientation="vertical">
      {ITEMS.map((item) => (
        <MarqueeItem key={item}>{item}</MarqueeItem>
      ))}
    </MarqueeContent>
    <MarqueeFade side="bottom" />
  </Marquee>
);
