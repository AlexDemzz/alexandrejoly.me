"use client";

import { mergeProps } from "@base-ui/react/merge-props";
import {
  createContext,
  use,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { Dispatch, ReactNode, Ref, SetStateAction } from "react";
import { flushSync } from "react-dom";

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

type OnboardingDirection = "next" | "previous";

interface OnboardingContextValue {
  api: UseOnboardingReturn;
  direction?: OnboardingDirection;
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
  const [direction, setDirection] = useState<OnboardingDirection>();
  const canGoToNextStep = currentStep < totalSteps;
  const canGoToPrevStep = currentStep > 1;

  const goToStep = useCallback(
    (nextStep: number) => {
      if (nextStep === currentStep) {
        return;
      }
      setDirection(nextStep > currentStep ? "next" : "previous");
      setCurrentStep(nextStep);
    },
    [currentStep]
  );

  const setStep = useCallback<Dispatch<SetStateAction<number>>>(
    (step) => {
      const nextStep = typeof step === "function" ? step(currentStep) : step;
      if (nextStep < 1 || nextStep > totalSteps) {
        throw new Error(`Step ${nextStep} is out of range 1–${totalSteps}`);
      }
      goToStep(nextStep);
    },
    [currentStep, goToStep, totalSteps]
  );

  const api = useMemo<UseOnboardingReturn>(
    () => ({
      canGoToNextStep,
      canGoToPrevStep,
      currentStep,
      goToNextStep: () => {
        if (canGoToNextStep) {
          goToStep(currentStep + 1);
        }
      },
      goToPrevStep: () => {
        if (canGoToPrevStep) {
          goToStep(currentStep - 1);
        }
      },
      reset: () => goToStep(1),
      setStep,
      totalSteps,
    }),
    [
      canGoToNextStep,
      canGoToPrevStep,
      currentStep,
      goToStep,
      setStep,
      totalSteps,
    ]
  );

  const context = useMemo<OnboardingContextValue>(
    () => ({ api, direction, onComplete }),
    [api, direction, onComplete]
  );

  return (
    <OnboardingContext value={context}>
      <div
        className={cn("flex flex-col gap-6", className)}
        data-direction={direction}
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

type TransitionStatus = "starting" | "ending" | undefined;

const runningAnimations = (element: HTMLElement) =>
  element
    .getAnimations?.({ subtree: true })
    .filter(
      (animation) =>
        animation.playState === "running" &&
        animation.effect?.getComputedTiming().endTime !==
          Number.POSITIVE_INFINITY
    ) ?? [];

function assignRef<T>(ref: Ref<T> | undefined, node: T | null) {
  if (typeof ref === "function") {
    return ref(node);
  }
  if (ref) {
    ref.current = node;
  }
}

function useStepTransition(isCurrent: boolean) {
  const ref = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(isCurrent);
  const [status, setStatus] = useState<TransitionStatus>();
  const [wasCurrent, setWasCurrent] = useState(isCurrent);

  if (isCurrent !== wasCurrent) {
    setWasCurrent(isCurrent);
    setMounted(true);
    if (!isCurrent) {
      setStatus("ending");
    } else if (mounted) {
      setStatus(undefined);
    } else {
      setStatus("starting");
    }
  }

  useEffect(() => {
    if (status !== "starting") {
      return;
    }
    const frame = requestAnimationFrame(() => setStatus(undefined));
    return () => cancelAnimationFrame(frame);
  }, [status]);

  useLayoutEffect(() => {
    const element = ref.current;
    if (status !== "ending" || !element) {
      return;
    }
    let cancelled = false;
    const unmountWhenDone = async () => {
      const unmount = () => {
        setMounted(false);
        setStatus(undefined);
      };
      let animations = runningAnimations(element);
      if (animations.length === 0) {
        unmount();
        return;
      }
      while (animations.length > 0) {
        await Promise.allSettled(
          animations.map((animation) => animation.finished)
        );
        if (cancelled) {
          return;
        }
        animations = runningAnimations(element);
      }
      flushSync(unmount);
    };
    void unmountWhenDone();
    return () => {
      cancelled = true;
    };
  }, [status]);

  return { mounted, ref, status };
}

function OnboardingStep({
  className,
  ref: forwardedRef,
  value,
  ...props
}: OnboardingStepProps) {
  const { currentStep } = useOnboarding();
  const { direction } = useOnboardingContext();
  const { mounted, ref, status } = useStepTransition(value === currentStep);

  const setRefs = useCallback(
    (node: HTMLDivElement | null) => {
      ref.current = node;
      return assignRef(forwardedRef, node);
    },
    [forwardedRef, ref]
  );

  if (!mounted) {
    return null;
  }

  return (
    <div
      className={cn("flex flex-col gap-4", className)}
      data-direction={direction}
      data-ending-style={status === "ending" ? "" : undefined}
      data-slot="onboarding-step"
      data-starting-style={status === "starting" ? "" : undefined}
      data-step={value}
      inert={status === "ending"}
      ref={setRefs}
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
      aria-label="Onboarding progress"
      aria-valuemax={totalSteps}
      aria-valuemin={1}
      aria-valuenow={currentStep}
      aria-valuetext={`Step ${currentStep} of ${totalSteps}`}
      className={cn("flex gap-1", className)}
      data-slot="onboarding-indicator"
      role="progressbar"
      {...props}
    >
      {steps.map((step) => (
        <Progress
          aria-hidden
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

  return (
    <Button
      data-slot="onboarding-prev-button"
      {...mergeProps<typeof Button>(
        {
          disabled: !canGoToPrevStep,
          focusableWhenDisabled: true,
          onClick: goToPrevStep,
          variant: "ghost",
        },
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
