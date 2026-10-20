import {
  Marquee,
  MarqueeContent,
  MarqueeFade,
  MarqueeItem,
} from "@registry/marquee";

const ITEMS = Array.from(
  { length: 4 },
  (_, index) => `A longer item to read, number ${index + 1}`
);

export const MarqueePauseOnHover = () => (
  <Marquee className="w-full">
    <MarqueeFade side="left" />
    <MarqueeContent className="[--marquee-duration:60s]" pauseOnHover>
      {ITEMS.map((item) => (
        <MarqueeItem className="px-6" key={item}>
          {item}
        </MarqueeItem>
      ))}
    </MarqueeContent>
    <MarqueeFade side="right" />
  </Marquee>
);
