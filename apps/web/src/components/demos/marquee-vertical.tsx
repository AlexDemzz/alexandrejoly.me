import {
  Marquee,
  MarqueeContent,
  MarqueeItem,
  MarqueePause,
  MarqueeViewport,
} from "@registry/marquee";

const ITEMS = Array.from({ length: 6 }, (_, index) => `Item ${index + 1}`);

export const MarqueeVertical = () => (
  <Marquee className="h-40 w-full">
    <MarqueePause />
    <MarqueeViewport className="scroll-fade-y">
      <MarqueeContent
        className="[--marquee-duration:12s]"
        orientation="vertical"
      >
        {ITEMS.map((item) => (
          <MarqueeItem key={item}>{item}</MarqueeItem>
        ))}
      </MarqueeContent>
    </MarqueeViewport>
  </Marquee>
);
