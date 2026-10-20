import { Marquee, MarqueeContent, MarqueeItem } from "@registry/marquee";

const WORDS = ["faster", "lighter", "calmer", "sharper"];

export const MarqueeVertical = () => (
  <div className="flex items-center gap-2">
    Train
    <Marquee className="h-10.5">
      <MarqueeContent duration="8s" gap="1rem" orientation="vertical">
        {WORDS.map((word) => (
          <MarqueeItem className="font-bold" key={word}>
            {word}
          </MarqueeItem>
        ))}
      </MarqueeContent>
    </Marquee>
  </div>
);
