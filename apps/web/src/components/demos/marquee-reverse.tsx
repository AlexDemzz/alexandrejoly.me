import {
  Marquee,
  MarqueeContent,
  MarqueeFade,
  MarqueeItem,
} from "@registry/marquee";

const FRONT = ["React", "TypeScript", "Tailwind CSS", "Base UI", "Vite"];
const BACK = ["TanStack Start", "Cloudflare Workers", "Shiki", "Vitest"];

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
