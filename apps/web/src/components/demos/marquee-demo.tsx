import {
  Marquee,
  MarqueeContent,
  MarqueeFade,
  MarqueeItem,
} from "@registry/marquee";

const ITEMS = Array.from({ length: 8 }, (_, index) => `Item ${index + 1}`);

export const MarqueeDemo = () => (
  <Marquee className="w-full">
    <MarqueeFade side="left" />
    <MarqueeContent>
      {ITEMS.map((item) => (
        <MarqueeItem key={item}>{item}</MarqueeItem>
      ))}
    </MarqueeContent>
    <MarqueeFade side="right" />
  </Marquee>
);
