import { Hint, HintContent, HintTrigger } from "@registry/hint";
import { CircleHelpIcon } from "lucide-react";

export const HintSide = () => (
  <p className="text-muted-foreground flex items-center gap-1.5">
    Rest between sets
    <Hint>
      <HintTrigger aria-label="Why rest?">
        <CircleHelpIcon className="size-4" />
      </HintTrigger>
      <HintContent align="start" side="top">
        Two to three minutes keeps strength sets heavy.
      </HintContent>
    </Hint>
  </p>
);
