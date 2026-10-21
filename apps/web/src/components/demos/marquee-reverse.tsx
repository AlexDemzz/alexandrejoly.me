import { Marquee, MarqueeContent, MarqueeItem } from "@registry/marquee";

const itemsFrom = (first: number) =>
  Array.from({ length: 8 }, (_, index) => `Item ${first + index}`);

const FRONT = itemsFrom(1);
const BACK = itemsFrom(9);

export const MarqueeReverse = () => (
  <Marquee className="scroll-fade-x w-full">
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
  </Marquee>
);
