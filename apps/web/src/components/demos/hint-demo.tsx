import { Hint, HintContent, HintTrigger } from "@registry/hint";
import { CircleHelpIcon } from "lucide-react";

export const HintDemo = () => (
  <Hint>
    <HintTrigger>
      Label
      <CircleHelpIcon />
    </HintTrigger>
    <HintContent>A short explanation of the label.</HintContent>
  </Hint>
);
