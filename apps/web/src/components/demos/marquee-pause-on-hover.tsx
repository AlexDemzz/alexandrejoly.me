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
  <Marquee className="w-full" pauseOnHover speed={24}>
    <MarqueeFade side="left" />
    <MarqueeContent className="gap-12">
      {QUOTES.map((quote) => (
        <MarqueeItem key={quote}>{quote}</MarqueeItem>
      ))}
    </MarqueeContent>
    <MarqueeFade side="right" />
  </Marquee>
);
