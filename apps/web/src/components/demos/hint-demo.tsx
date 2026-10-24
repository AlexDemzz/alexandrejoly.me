import { QuestionIcon } from "@phosphor-icons/react";
import { Hint, HintContent, HintTrigger } from "@registry/hint";

export const HintDemo = () => (
  <Hint>
    <HintTrigger>
      Label
      <QuestionIcon />
    </HintTrigger>
    <HintContent>A short explanation of the label.</HintContent>
  </Hint>
);
