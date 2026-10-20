import { Hint, HintContent, HintTrigger } from "@registry/hint";
import { CircleHelpIcon } from "lucide-react";

export const HintDemo = () => (
  <Hint>
    <HintTrigger>
      Monthly active users
      <CircleHelpIcon />
    </HintTrigger>
    <HintContent>
      People who opened the app at least once in the last 30 days.
    </HintContent>
  </Hint>
);
