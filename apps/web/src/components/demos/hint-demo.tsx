import { Hint, HintContent, HintTrigger } from "@registry/hint";
import { CircleHelpIcon } from "lucide-react";

export const HintDemo = () => (
  <p className="flex items-center gap-1.5">
    Monthly active users
    <Hint>
      <HintTrigger aria-label="What counts as active?">
        <CircleHelpIcon className="size-4" />
      </HintTrigger>
      <HintContent>
        People who opened the app at least once in the last 30 days.
      </HintContent>
    </Hint>
  </p>
);
