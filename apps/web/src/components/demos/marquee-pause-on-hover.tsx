import {
  Marquee,
  MarqueeContent,
  MarqueeFade,
  MarqueeItem,
} from "@registry/marquee";

const QUOTES = [
  "“Finally a coach that remembers my last session.”",
  "“The plan adapts when I skip a week.”",
  "“Every set has a reason.”",
  "“Feels like texting a real coach.”",
];

export const MarqueePauseOnHover = () => (
  <Marquee className="w-full">
    <MarqueeFade side="left" />
    <MarqueeContent duration="60s" gap="3rem" pauseOnHover>
      {QUOTES.map((quote) => (
        <MarqueeItem key={quote}>{quote}</MarqueeItem>
      ))}
    </MarqueeContent>
    <MarqueeFade side="right" />
  </Marquee>
);
