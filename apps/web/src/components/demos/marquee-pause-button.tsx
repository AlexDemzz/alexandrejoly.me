import { Button } from "@portfolio/ui/components/button";
import { Marquee, MarqueeContent, MarqueeItem } from "@registry/marquee";
import { PauseIcon, PlayIcon } from "lucide-react";
import { useState } from "react";

const ITEMS = Array.from(
  { length: 4 },
  (_, index) => `A longer item to read, number ${index + 1}`
);

export const MarqueePauseButton = () => {
  const [paused, setPaused] = useState(false);

  return (
    <div className="flex w-full items-center gap-2">
      <Button
        aria-label={paused ? "Play" : "Pause"}
        className="motion-reduce:hidden"
        onClick={() => setPaused((value) => !value)}
        size="icon"
        variant="ghost"
      >
        {paused ? <PlayIcon aria-hidden /> : <PauseIcon aria-hidden />}
      </Button>
      <Marquee className="scroll-fade-x min-w-0 flex-1" paused={paused}>
        <MarqueeContent>
          {ITEMS.map((item) => (
            <MarqueeItem key={item}>{item}</MarqueeItem>
          ))}
        </MarqueeContent>
      </Marquee>
    </div>
  );
};
