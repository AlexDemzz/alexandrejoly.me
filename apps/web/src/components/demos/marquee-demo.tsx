import {
  Marquee,
  MarqueeContent,
  MarqueeFade,
  MarqueeItem,
} from "@registry/marquee";

const STACK = [
  "React",
  "TypeScript",
  "Tailwind CSS",
  "Base UI",
  "TanStack Start",
  "Cloudflare Workers",
  "Motion",
  "Vite",
];

export const MarqueeDemo = () => (
  <Marquee className="w-full">
    <MarqueeFade side="left" />
    <MarqueeContent>
      {STACK.map((name) => (
        <MarqueeItem key={name}>{name}</MarqueeItem>
      ))}
    </MarqueeContent>
    <MarqueeFade side="right" />
  </Marquee>
);
