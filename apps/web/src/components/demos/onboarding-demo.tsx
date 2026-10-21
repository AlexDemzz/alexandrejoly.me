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

const STEPS = [1, 2, 3].map((step) => ({
  description: `A short description of step ${step}.`,
  title: `Step ${step}`,
}));

export const OnboardingDemo = () => {
  const [completed, setCompleted] = useState(false);

  if (completed) {
    return (
      <div className="flex min-h-76.5 flex-col items-center justify-center gap-4">
        <p>Completed.</p>
        <Button onClick={() => setCompleted(false)} variant="outline">
          Start again
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
      <OnboardingContent>
        {STEPS.map(({ description, title }, index) => (
          <OnboardingStep key={title} value={index + 1}>
            <OnboardingMedia>
              <div
                aria-hidden
                className="h-40 w-full rounded-xl bg-black/35 dark:bg-white/35"
              />
            </OnboardingMedia>
            <OnboardingHeader>
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
