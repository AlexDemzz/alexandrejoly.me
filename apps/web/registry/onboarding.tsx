"use client";

import { mergeProps } from "@base-ui/react/merge-props";
import {
  Children,
  createContext,
  isValidElement,
  use,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { Dispatch, ReactNode, SetStateAction } from "react";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface UseOnboardingReturn {
  canGoToNextStep: boolean;
  canGoToPrevStep: boolean;
  currentStep: number;
  goToNextStep: () => void;
  goToPrevStep: () => void;
  reset: () => void;
  setStep: Dispatch<SetStateAction<number>>;
  totalSteps: number;
}

interface OnboardingContextValue {
  api: UseOnboardingReturn;
  onComplete?: () => void;
  setTotalSteps: Dispatch<SetStateAction<number>>;
}

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

function useOnboardingContext() {
  const context = use(OnboardingContext);
  if (!context) {
    throw new Error(
      "useOnboarding must be used within an Onboarding component"
    );
  }
  return context;
}

function useOnboarding(): UseOnboardingReturn {
  return useOnboardingContext().api;
}

interface OnboardingProps extends React.ComponentProps<"div"> {
  /** The step (1-based) to start on. */
  defaultValue?: number;
  /** Called when the next button is pressed on the last step. */
  onComplete?: () => void;
}

function Onboarding({
  children,
  className,
  defaultValue = 1,
  onComplete,
  ...props
}: OnboardingProps) {
  const [totalSteps, setTotalSteps] = useState(1);
  const [currentStep, setCurrentStep] = useState(defaultValue);
  const canGoToNextStep = currentStep < totalSteps;
  const canGoToPrevStep = currentStep > 1;

  const setStep = useCallback<Dispatch<SetStateAction<number>>>(
    (step) => {
      const nextStep = typeof step === "function" ? step(currentStep) : step;
      if (nextStep < 1 || nextStep > totalSteps) {
        throw new Error(`Step ${nextStep} is out of range 1–${totalSteps}`);
      }
      setCurrentStep(nextStep);
    },
    [currentStep, totalSteps]
  );

  const api = useMemo<UseOnboardingReturn>(
    () => ({
      canGoToNextStep,
      canGoToPrevStep,
      currentStep,
      goToNextStep: () => {
        if (canGoToNextStep) {
          setCurrentStep((step) => step + 1);
        }
      },
      goToPrevStep: () => {
        if (canGoToPrevStep) {
          setCurrentStep((step) => step - 1);
        }
      },
      reset: () => setCurrentStep(1),
      setStep,
      totalSteps,
    }),
    [canGoToNextStep, canGoToPrevStep, currentStep, setStep, totalSteps]
  );

  const context = useMemo<OnboardingContextValue>(
    () => ({ api, onComplete, setTotalSteps }),
    [api, onComplete]
  );

  return (
    <OnboardingContext value={context}>
      <div className={className} data-slot="onboarding" {...props}>
        {children}
      </div>
    </OnboardingContext>
  );
}

interface OnboardingStepProps extends React.ComponentProps<"div"> {
  /** The step's 1-based position. */
  value: number;
}

function OnboardingContent({
  children,
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { currentStep } = useOnboarding();
  const { setTotalSteps } = useOnboardingContext();
  // oxlint-disable-next-line react/no-react-children -- steps are matched by their `value` prop
  const steps = Children.toArray(children);

  useEffect(() => {
    setTotalSteps(steps.length);
  }, [steps.length, setTotalSteps]);

  const activeStep = steps.find(
    (child) =>
      isValidElement<OnboardingStepProps>(child) &&
      child.props.value === currentStep
  );

  return (
    <div
      className={cn("flex flex-1 flex-col pt-4", className)}
      data-slot="onboarding-content"
      {...props}
    >
      {activeStep}
    </div>
  );
}

function OnboardingStep({ className, value, ...props }: OnboardingStepProps) {
  return (
    <div
      className={cn("flex flex-1 flex-col gap-4", className)}
      data-slot="onboarding-step"
      data-step={value}
      {...props}
    />
  );
}

function OnboardingMedia({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "flex h-100 items-center justify-center overflow-hidden",
        className
      )}
      data-slot="onboarding-media"
      {...props}
    />
  );
}

function OnboardingTitle({
  children,
  className,
  ...props
}: React.ComponentProps<"h2">) {
  return (
    <h2
      className={cn("text-xl font-bold", className)}
      data-slot="onboarding-title"
      {...props}
    >
      {children}
    </h2>
  );
}

function OnboardingDescription({
  className,
  ...props
}: React.ComponentProps<"p">) {
  return (
    <p
      className={cn("text-muted-foreground", className)}
      data-slot="onboarding-description"
      {...props}
    />
  );
}

function OnboardingFooter({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("relative flex flex-col gap-3 pb-4", className)}
      data-slot="onboarding-footer"
      {...props}
    />
  );
}

function OnboardingIndicator({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { currentStep, totalSteps } = useOnboarding();
  const steps = Array.from({ length: totalSteps }, (_, index) => index + 1);

  return (
    <div
      className={cn("flex gap-1 px-4", className)}
      data-slot="onboarding-indicator"
      {...props}
    >
      {steps.map((step) => (
        <Progress
          className="flex-1"
          key={step}
          value={step <= currentStep ? 100 : 0}
        />
      ))}
    </div>
  );
}

function OnboardingNav({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("flex items-center justify-between px-4", className)}
      data-slot="onboarding-nav"
      {...props}
    />
  );
}

interface OnboardingPrevButtonProps extends React.ComponentProps<
  typeof Button
> {
  children?: ReactNode;
}

function OnboardingPrevButton({
  children = "Previous",
  ...props
}: OnboardingPrevButtonProps) {
  const { goToPrevStep, canGoToPrevStep } = useOnboarding();

  if (!canGoToPrevStep) {
    // Keeps the next button on the end side of a `justify-between` nav.
    return <div />;
  }

  return (
    <Button
      data-slot="onboarding-prev-button"
      {...mergeProps<typeof Button>(
        { onClick: goToPrevStep, variant: "ghost" },
        props
      )}
    >
      {children}
    </Button>
  );
}

interface OnboardingNextButtonProps extends React.ComponentProps<
  typeof Button
> {
  children?: ReactNode;
  /** Label shown on the last step, where the button calls `onComplete`. */
  lastLabel?: ReactNode;
}

function OnboardingNextButton({
  children = "Continue",
  lastLabel = "Got it",
  ...props
}: OnboardingNextButtonProps) {
  const { goToNextStep, canGoToNextStep } = useOnboarding();
  const { onComplete } = useOnboardingContext();
  const isLastStep = !canGoToNextStep;

  const handleClick = () => {
    if (isLastStep) {
      onComplete?.();
    } else {
      goToNextStep();
    }
  };

  return (
    <Button
      data-slot="onboarding-next-button"
      {...mergeProps<typeof Button>(
        { onClick: handleClick, variant: "default" },
        props
      )}
    >
      {isLastStep ? lastLabel : children}
    </Button>
  );
}

export {
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
  useOnboarding,
};
export type { UseOnboardingReturn };
