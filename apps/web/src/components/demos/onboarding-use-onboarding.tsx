import { Button } from "@portfolio/ui/components/button";
import {
  Onboarding,
  OnboardingContent,
  OnboardingDescription,
  OnboardingFooter,
  OnboardingHeader,
  OnboardingIndicator,
  OnboardingNav,
  OnboardingNextButton,
  OnboardingPrevButton,
  OnboardingStep,
  OnboardingTitle,
  useOnboarding,
} from "@registry/onboarding";
import { useState } from "react";

const StepHeader = ({ onSkip }: { onSkip: () => void }) => {
  const { canGoToNextStep, currentStep, reset, totalSteps } = useOnboarding();

  return (
    <div className="flex items-center justify-between">
      <p>
        Step {currentStep} of {totalSteps}
      </p>
      {canGoToNextStep ? (
        <Button onClick={onSkip} variant="ghost">
          Skip
        </Button>
      ) : (
        <Button onClick={reset} variant="ghost">
          Restart
        </Button>
      )}
    </div>
  );
};

export const OnboardingUseOnboarding = () => {
  const [completed, setCompleted] = useState(false);

  if (completed) {
    return (
      <div className="flex min-h-46.5 flex-col items-center justify-center gap-4">
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
      totalSteps={3}
    >
      <StepHeader onSkip={() => setCompleted(true)} />
      <OnboardingContent>
        <OnboardingStep value={1}>
          <OnboardingHeader>
            <OnboardingTitle>Step 1</OnboardingTitle>
            <OnboardingDescription>
              A short description of step 1.
            </OnboardingDescription>
          </OnboardingHeader>
        </OnboardingStep>
        <OnboardingStep value={2}>
          <OnboardingHeader>
            <OnboardingTitle>Step 2</OnboardingTitle>
            <OnboardingDescription>
              A short description of step 2.
            </OnboardingDescription>
          </OnboardingHeader>
        </OnboardingStep>
        <OnboardingStep value={3}>
          <OnboardingHeader>
            <OnboardingTitle>Step 3</OnboardingTitle>
            <OnboardingDescription>
              A short description of step 3.
            </OnboardingDescription>
          </OnboardingHeader>
        </OnboardingStep>
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
