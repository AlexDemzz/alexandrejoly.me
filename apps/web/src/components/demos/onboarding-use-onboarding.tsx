import { Button } from "@portfolio/ui/components/button";
import {
  Onboarding,
  OnboardingContent,
  OnboardingDescription,
  OnboardingFooter,
  OnboardingIndicator,
  OnboardingNav,
  OnboardingNextButton,
  OnboardingPrevButton,
  OnboardingStep,
  OnboardingTitle,
  useOnboarding,
} from "@registry/onboarding";

const StepHeader = () => {
  const { canGoToNextStep, currentStep, reset, setStep, totalSteps } =
    useOnboarding();

  return (
    <div className="flex items-center justify-between px-4">
      <p>
        Step {currentStep} of {totalSteps}
      </p>
      {canGoToNextStep ? (
        <Button onClick={() => setStep(totalSteps)} variant="ghost">
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

export const OnboardingUseOnboarding = () => (
  <Onboarding className="flex w-full max-w-sm flex-col gap-4">
    <StepHeader />
    <OnboardingContent>
      <OnboardingStep value={1}>
        <div className="flex flex-col gap-1 px-4">
          <OnboardingTitle>Pick your days</OnboardingTitle>
          <OnboardingDescription>
            Choose when you train. The plan fits around them.
          </OnboardingDescription>
        </div>
      </OnboardingStep>
      <OnboardingStep value={2}>
        <div className="flex flex-col gap-1 px-4">
          <OnboardingTitle>Set a goal</OnboardingTitle>
          <OnboardingDescription>
            Strength, size or endurance. You can change it later.
          </OnboardingDescription>
        </div>
      </OnboardingStep>
      <OnboardingStep value={3}>
        <div className="flex flex-col gap-1 px-4">
          <OnboardingTitle>Ready</OnboardingTitle>
          <OnboardingDescription>
            Your first session is waiting.
          </OnboardingDescription>
        </div>
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
