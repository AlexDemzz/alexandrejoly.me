import {
  Marquee,
  MarqueeContent,
  MarqueeFade,
  MarqueeItem,
} from "@registry/marquee";

const itemsFrom = (first: number) =>
  Array.from({ length: 5 }, (_, index) => `Item ${first + index}`);

const FRONT = itemsFrom(1);
const BACK = itemsFrom(6);

export const MarqueeReverse = () => (
  <Marquee className="flex w-full flex-col gap-4">
    <MarqueeFade side="left" />
    <MarqueeContent>
      {FRONT.map((name) => (
        <MarqueeItem key={name}>{name}</MarqueeItem>
      ))}
    </MarqueeContent>
    <MarqueeContent reverse>
      {BACK.map((name) => (
        <MarqueeItem key={name}>{name}</MarqueeItem>
      ))}
    </MarqueeContent>
    <MarqueeFade side="right" />
  </Marquee>
);
