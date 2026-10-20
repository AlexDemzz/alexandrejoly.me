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

const STEPS = [
  {
    description:
      "Answer a few questions and get a plan built around your week.",
    title: "Meet your coach",
  },
  {
    description: "Log each set as you go. The next one adapts to how it felt.",
    title: "Train with a plan",
  },
  {
    description:
      "See your lifts climb week after week, one chart per exercise.",
    title: "Watch it add up",
  },
];

export const OnboardingDemo = () => {
  const [completed, setCompleted] = useState(false);

  if (completed) {
    return (
      <div className="flex flex-col items-center gap-4">
        <p>You’re all set.</p>
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
