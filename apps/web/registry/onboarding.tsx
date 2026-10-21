"use client";

import { mergeProps } from "@base-ui/react/merge-props";
import { createContext, use, useCallback, useMemo, useState } from "react";
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
  defaultValue?: number;
  onComplete?: () => void;
  totalSteps: number;
}

function Onboarding({
  children,
  className,
  defaultValue = 1,
  onComplete,
  totalSteps,
  ...props
}: OnboardingProps) {
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
    () => ({ api, onComplete }),
    [api, onComplete]
  );

  return (
    <OnboardingContext value={context}>
      <div
        className={cn("flex flex-col gap-6", className)}
        data-slot="onboarding"
        {...props}
      >
        {children}
      </div>
    </OnboardingContext>
  );
}

interface OnboardingStepProps extends React.ComponentProps<"div"> {
  value: number;
}

function OnboardingContent(props: React.ComponentProps<"div">) {
  return <div data-slot="onboarding-content" {...props} />;
}

function OnboardingStep({ className, value, ...props }: OnboardingStepProps) {
  const { currentStep } = useOnboarding();

  if (value !== currentStep) {
    return null;
  }

  return (
    <div
      className={cn("flex flex-col gap-4", className)}
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
        "flex items-center justify-center overflow-hidden",
        className
      )}
      data-slot="onboarding-media"
      {...props}
    />
  );
}

function OnboardingHeader({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("flex flex-col gap-1", className)}
      data-slot="onboarding-header"
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
      className={cn("flex flex-col gap-3", className)}
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
      className={cn("flex gap-1", className)}
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
      className={cn("flex items-center justify-between", className)}
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
  OnboardingHeader,
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
