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
import { DumbbellIcon, LineChartIcon, SparklesIcon } from "lucide-react";
import { useState } from "react";

const STEPS = [
  {
    description:
      "Answer a few questions and get a plan built around your week.",
    icon: SparklesIcon,
    title: "Meet your coach",
  },
  {
    description: "Log each set as you go. The next one adapts to how it felt.",
    icon: DumbbellIcon,
    title: "Train with a plan",
  },
  {
    description:
      "See your lifts climb week after week, one chart per exercise.",
    icon: LineChartIcon,
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
        {STEPS.map(({ description, icon: Icon, title }, index) => (
          <OnboardingStep key={title} value={index + 1}>
            <OnboardingMedia className="h-40">
              <Icon aria-hidden className="size-10" />
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
