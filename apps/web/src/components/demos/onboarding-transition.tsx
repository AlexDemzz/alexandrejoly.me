import { Button } from "@portfolio/ui/components/button";
import {
  Onboarding,
  OnboardingContent,
  OnboardingDescription,
  OnboardingFooter,
  OnboardingHeader,
  OnboardingIndicator,
  OnboardingMedia,
  OnboardingNav,
  OnboardingNextButton,
  OnboardingPrevButton,
  OnboardingStep,
  OnboardingTitle,
} from "@registry/onboarding";
import { useState } from "react";

const STEPS = [
  { media: "bg-black/15 dark:bg-white/15", step: 1 },
  { media: "bg-black/35 dark:bg-white/35", step: 2 },
  { media: "bg-black/55 dark:bg-white/55", step: 3 },
].map(({ media, step }) => ({
  description: `A short description of step ${step}.`,
  media,
  title: `Step ${step}`,
}));

export const OnboardingTransition = () => {
  const [completed, setCompleted] = useState(false);

  if (completed) {
    return (
      <div className="flex min-h-76.5 flex-col items-center justify-center gap-4">
        <p>Onboarding complete</p>
        <Button onClick={() => setCompleted(false)} variant="outline">
          Restart
        </Button>
      </div>
    );
  }

  return (
    <Onboarding
      className="w-full max-w-sm"
      onComplete={() => setCompleted(true)}
      totalSteps={STEPS.length}
    >
      <OnboardingContent className="grid overflow-hidden">
        {STEPS.map(({ description, media, title }, index) => (
          <OnboardingStep
            className="group col-start-1 row-start-1"
            key={title}
            value={index + 1}
          >
            <OnboardingMedia className="transition-opacity duration-250 group-data-ending-style:opacity-0 group-data-starting-style:opacity-0">
              <div aria-hidden className={`h-40 w-full rounded-xl ${media}`} />
            </OnboardingMedia>
            <OnboardingHeader className="transition duration-300 group-data-ending-style:opacity-0 group-data-starting-style:opacity-0 motion-safe:group-data-[direction=next]:group-data-ending-style:-translate-x-full motion-safe:group-data-[direction=next]:group-data-starting-style:translate-x-full motion-safe:group-data-[direction=previous]:group-data-ending-style:translate-x-full motion-safe:group-data-[direction=previous]:group-data-starting-style:-translate-x-full">
              <OnboardingTitle>{title}</OnboardingTitle>
              <OnboardingDescription>{description}</OnboardingDescription>
            </OnboardingHeader>
          </OnboardingStep>
        ))}
      </OnboardingContent>
      <OnboardingFooter>
        <OnboardingIndicator />
        <OnboardingNav>
          <OnboardingPrevButton />
          <OnboardingNextButton />
        </OnboardingNav>
      </OnboardingFooter>
    </Onboarding>
  );
};
