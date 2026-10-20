import { Button } from "@portfolio/ui/components/button";
import {
  Onboarding,
  OnboardingContent,
  OnboardingDescription,
  OnboardingFooter,
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
      <div className="flex flex-col items-center gap-4">
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
    >
      <OnboardingContent>
        {STEPS.map(({ description, title }, index) => (
          <OnboardingStep key={title} value={index + 1}>
            <OnboardingMedia className="h-40">
              <div aria-hidden className="bg-muted-foreground size-full" />
            </OnboardingMedia>
            <div className="flex flex-col gap-1 px-4 pb-6">
              <OnboardingTitle>{title}</OnboardingTitle>
              <OnboardingDescription>{description}</OnboardingDescription>
            </div>
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
