import {
  Marquee,
  MarqueeContent,
  MarqueeItem,
  MarqueePause,
  MarqueeViewport,
} from "@registry/marquee";

const ITEMS = Array.from(
  { length: 4 },
  (_, index) => `A longer item to read, number ${index + 1}`
);

export const MarqueePauseOnHover = () => (
  <Marquee className="w-full">
    <MarqueePause />
    <MarqueeViewport className="scroll-fade-x">
      <MarqueeContent className="[--marquee-duration:60s]" pauseOnHover>
        {ITEMS.map((item) => (
          <MarqueeItem key={item}>{item}</MarqueeItem>
        ))}
      </MarqueeContent>
    </MarqueeViewport>
  </Marquee>
);
