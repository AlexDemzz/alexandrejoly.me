import { Marquee, MarqueeContent, MarqueeItem } from "@registry/marquee";

const ITEMS = Array.from(
  { length: 4 },
  (_, index) => `A longer item to read, number ${index + 1}`
);

export const MarqueePauseOnHover = () => (
  <Marquee className="scroll-fade-x w-full">
    <MarqueeContent className="[--marquee-duration:60s]" pauseOnHover>
      {ITEMS.map((item) => (
        <MarqueeItem key={item}>{item}</MarqueeItem>
      ))}
    </MarqueeContent>
  </Marquee>
);
