import { buttonVariants } from "@portfolio/ui/components/button";
import { Marquee, MarqueeContent, MarqueeItem } from "@registry/marquee";

const ITEMS = Array.from({ length: 15 }, (_, index) => ({
  href: `#item-${index + 1}`,
  label: `Item ${index + 1}`,
}));

export const MarqueeDemo = () => (
  <Marquee className="scroll-fade-x w-full py-1">
    <MarqueeContent pauseOnHover>
      {ITEMS.map((item) => (
        <MarqueeItem key={item.href}>
          <a className={buttonVariants({ variant: "link" })} href={item.href}>
            {item.label}
          </a>
        </MarqueeItem>
      ))}
    </MarqueeContent>
  </Marquee>
);
