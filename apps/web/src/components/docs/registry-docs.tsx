import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@portfolio/ui/components/alert";
import type { ComponentType, ReactNode } from "react";

import { HintDemo } from "@/components/demos/hint-demo";
import { InfiniteScrollDemo } from "@/components/demos/infinite-scroll-demo";
import { MarqueeDemo } from "@/components/demos/marquee-demo";
import { MarqueeFit } from "@/components/demos/marquee-fit";
import { MarqueePauseOnHover } from "@/components/demos/marquee-pause-on-hover";
import { MarqueeReverse } from "@/components/demos/marquee-reverse";
import { MarqueeVertical } from "@/components/demos/marquee-vertical";
import { NotificationBadgeCounts } from "@/components/demos/notification-badge-counts";
import { NotificationBadgeDemo } from "@/components/demos/notification-badge-demo";
import { NotificationBadgeDot } from "@/components/demos/notification-badge-dot";
import { NotificationBadgeLabel } from "@/components/demos/notification-badge-label";
import { OnboardingDemo } from "@/components/demos/onboarding-demo";
import { OnboardingUseOnboarding } from "@/components/demos/onboarding-use-onboarding";
import type { RegistryItemName } from "@/lib/registry";

/** A file in `src/components/demos`, named without its extension. */
export interface Demo {
  Component: ComponentType;
  file: string;
}

export interface Example extends Demo {
  description: string;
  /** Shown between the description and the preview. */
  notice?: ReactNode;
  title: string;
}

export interface ApiProp {
  default?: string;
  description: string;
  name: string;
  type: string;
}

/** What a part spreads its props onto: an element, or a component's docs. */
export interface ApiExtends {
  href?: string;
  name: string;
}

export interface ApiPart {
  description: string;
  /** Omitted for a hook, which renders nothing. */
  extends?: ApiExtends;
  name: string;
  /** Heads the name column; defaults to "Prop". */
  nameLabel?: string;
  props: ApiProp[];
}

export interface ComponentDocs {
  api: ApiPart[];
  demo: Demo;
  examples: Example[];
}

export const REGISTRY_DOCS: Record<RegistryItemName, ComponentDocs> = {
  hint: {
    api: [
      {
        description: "Holds the open state; it renders no element.",
        extends: {
          href: "https://base-ui.com/react/components/popover#root",
          name: "Base UI Popover.Root",
        },
        name: "Hint",
        props: [],
      },
      {
        description:
          "The button that toggles the hint. Put the label in it, text then icon, so it needs no `aria-label`; icons are sized to 16px. Its hit area extends 8px past its edges.",
        extends: {
          href: "https://base-ui.com/react/components/popover#trigger",
          name: "Base UI Popover.Trigger",
        },
        name: "HintTrigger",
        props: [],
      },
      {
        description: "The bubble, portalled to the body.",
        extends: {
          href: "https://ui.shadcn.com/docs/components/base/popover",
          name: "shadcn PopoverContent",
        },
        name: "HintContent",
        props: [],
      },
    ],
    demo: { Component: HintDemo, file: "hint-demo" },
    examples: [],
  },
  "infinite-scroll": {
    api: [
      {
        description:
          "Shares the pagination state with the sentinel. Make it the scroll container, or let the page scroll.",
        extends: { name: "div" },
        name: "InfiniteScroll",
        props: [
          {
            description: "Whether another page can be fetched.",
            name: "hasNextPage",
            type: "boolean",
          },
          {
            description:
              "Whether a page is being fetched. The sentinel shows a spinner and stops observing meanwhile.",
            name: "isFetchingNextPage",
            type: "boolean",
          },
          {
            description:
              "Called when the sentinel scrolls into view while a next page exists and none is loading.",
            name: "onFetchNextPage",
            type: "() => void",
          },
        ],
      },
      {
        description:
          "Place it after the last item. It holds the spinner while fetching.",
        extends: { name: "div" },
        name: "InfiniteScrollSentinel",
        props: [
          {
            description:
              "Replaces the rendered element, for example an `li` inside a list. Its children hold the spinner.",
            name: "render",
            type: "ReactElement | (props, state) => ReactElement",
          },
        ],
      },
    ],
    demo: { Component: InfiniteScrollDemo, file: "infinite-scroll-demo" },
    examples: [],
  },
  marquee: {
    api: [
      {
        description:
          "Clips the tracks and anchors the fades. While its items fit, it stands still with no clone and no fades. A pointer over it pauses any track set to `pauseOnHover`.",
        extends: { name: "div" },
        name: "Marquee",
        props: [],
      },
      {
        description:
          "The track. It renders its items twice and a CSS keyframe slides it by one copy per cycle, with no JavaScript. Under reduced motion it stays on the first copy.",
        extends: { name: "div" },
        name: "MarqueeContent",
        nameLabel: "Prop or variable",
        props: [
          {
            default: '"horizontal"',
            description: "`vertical` stacks the items and slides them upward.",
            name: "orientation",
            type: '"horizontal" | "vertical"',
          },
          {
            default: "false",
            description: "Slides the other way. Horizontal only.",
            name: "reverse",
            type: "boolean",
          },
          {
            default: "false",
            description: "Holds the track while a pointer is over the marquee.",
            name: "pauseOnHover",
            type: "boolean",
          },
          {
            default: "40s",
            description:
              "One full cycle, set from a class: `[--marquee-duration:20s]`.",
            name: "--marquee-duration",
            type: "CSS time",
          },
        ],
      },
      {
        description:
          "One item of the track. Its padding spaces the items and the loop’s seam alike: `px-4` across, `py-2` down. Override it with a class such as `px-2`.",
        extends: { name: "div" },
        name: "MarqueeItem",
        props: [],
      },
      {
        description: "A gradient from the page background over one edge.",
        extends: { name: "div" },
        name: "MarqueeFade",
        props: [
          {
            description: "The edge it covers.",
            name: "side",
            type: '"left" | "right" | "top" | "bottom"',
          },
        ],
      },
    ],
    demo: { Component: MarqueeDemo, file: "marquee-demo" },
    examples: [
      {
        Component: MarqueePauseOnHover,
        description:
          "Slow it with `[--marquee-duration:60s]` and hold it under the pointer so longer items can be read.",
        file: "marquee-pause-on-hover",
        title: "Pause on hover",
      },
      {
        Component: MarqueeReverse,
        description:
          "Two tracks in one marquee, the second with `reverse`, pass each other.",
        file: "marquee-reverse",
        title: "Reverse",
      },
      {
        Component: MarqueeVertical,
        description:
          "A vertical track between top and bottom fades, with tighter `py-1` items.",
        file: "marquee-vertical",
        title: "Vertical",
      },
      {
        Component: MarqueeFit,
        description:
          "Items narrower than the frame stand still: no clone, no fades. A CSS scroll timeline detects the overflow.",
        file: "marquee-fit",
        notice: (
          // Only browsers without scroll timelines see it, Firefox today.
          <Alert
            className="hidden not-supports-[animation-timeline:scroll()]:grid"
            role="note"
          >
            <AlertTitle>Your browser scrolls it anyway</AlertTitle>
            <AlertDescription>
              It has no CSS scroll timelines, so it can’t tell that the items
              fit.
            </AlertDescription>
          </Alert>
        ),
        title: "Content that fits",
      },
    ],
  },
  "notification-badge": {
    api: [
      {
        description:
          "Holds the count and the hole geometry, as CSS variables its parts read.",
        extends: { name: "span" },
        name: "NotificationBadge",
        nameLabel: "Prop or variable",
        props: [
          {
            description:
              "The number to show. Nothing shows at 0; above 99 it reads `99+`.",
            name: "count",
            type: "number",
          },
          {
            default: '"default"',
            description: "A counter, or an 8px dot shown while `count > 0`.",
            name: "variant",
            type: '"default" | "dot"',
          },
          {
            default: "0px",
            description:
              "The corner radius of the content, so the badge sits on its curve: `50%` for an avatar.",
            name: "--hole-radius",
            type: "CSS length",
          },
          {
            default: "1.5px",
            description: "The transparent gap around the badge.",
            name: "--hole-gap",
            type: "CSS length",
          },
          {
            description:
              "Moves the badge and its hole together, from the top and right edges.",
            name: "--hole-top, --hole-right",
            type: "CSS length",
          },
        ],
      },
      {
        description:
          "Wraps the icon, button or avatar. Clips a hole under the badge so the gap shows whatever is behind it.",
        extends: { name: "span" },
        name: "NotificationBadgeContent",
        props: [],
      },
      {
        description:
          "A destructive `Badge`: a circle for one digit, a pill for two or `99+`, sized and placed from the root’s variables. Renders nothing at 0. Add `static` to its class to sit it beside a label instead of over the content.",
        extends: {
          href: "https://ui.shadcn.com/docs/components/base/badge",
          name: "shadcn Badge",
        },
        name: "NotificationBadgeIndicator",
        props: [],
      },
    ],
    demo: { Component: NotificationBadgeDemo, file: "notification-badge-demo" },
    examples: [
      {
        Component: NotificationBadgeDot,
        description: "Signal that something is new without a number.",
        file: "notification-badge-dot",
        title: "Dot",
      },
      {
        Component: NotificationBadgeCounts,
        description:
          "One digit is a circle, two are a pill. Above 99 it reads `99+`, and the hole under it keeps the same shape.",
        file: "notification-badge-counts",
        title: "Counts",
      },
      {
        Component: NotificationBadgeLabel,
        description:
          "Beside a label, leave out the content and take the indicator out of the overlay with `static`.",
        file: "notification-badge-label",
        title: "Beside a label",
      },
    ],
  },
  onboarding: {
    api: [
      {
        description: "Holds the current step.",
        extends: { name: "div" },
        name: "Onboarding",
        props: [
          {
            default: "1",
            description: "The step to start on, counted from 1.",
            name: "defaultValue",
            type: "number",
          },
          {
            description:
              "Called when the next button is pressed on the last step.",
            name: "onComplete",
            type: "() => void",
          },
        ],
      },
      {
        description:
          "Counts its steps and shows the current one. Children must be `OnboardingStep`s.",
        extends: { name: "div" },
        name: "OnboardingContent",
        props: [],
      },
      {
        description: "One step.",
        extends: { name: "div" },
        name: "OnboardingStep",
        props: [
          {
            description: "Its position, counted from 1.",
            name: "value",
            type: "number",
          },
        ],
      },
      {
        description:
          "A 400px stage for an image or illustration. `OnboardingTitle` (`h2`) and `OnboardingDescription` (`p`) take the text.",
        extends: { name: "div" },
        name: "OnboardingMedia",
        props: [],
      },
      {
        description:
          "Stacks the indicator over the nav. `OnboardingIndicator` draws one progress bar per step; `OnboardingNav` spreads the buttons apart.",
        extends: { name: "div" },
        name: "OnboardingFooter",
        props: [],
      },
      {
        description:
          "Ghost button to the previous step, replaced by an empty spacer on the first. An `onClick` runs before the step changes.",
        extends: {
          href: "https://ui.shadcn.com/docs/components/base/button",
          name: "shadcn Button",
        },
        name: "OnboardingPrevButton",
        props: [
          {
            default: '"Previous"',
            description: "The label.",
            name: "children",
            type: "ReactNode",
          },
        ],
      },
      {
        description:
          "Moves forward, or calls `onComplete` on the last step. An `onClick` runs before the step changes.",
        extends: {
          href: "https://ui.shadcn.com/docs/components/base/button",
          name: "shadcn Button",
        },
        name: "OnboardingNextButton",
        props: [
          {
            default: '"Continue"',
            description: "The label.",
            name: "children",
            type: "ReactNode",
          },
          {
            default: '"Got it"',
            description: "The label on the last step.",
            name: "lastLabel",
            type: "ReactNode",
          },
        ],
      },
      {
        description:
          "Reads and drives the flow from any child of `Onboarding`. `setStep` throws outside 1 to `totalSteps`.",
        name: "useOnboarding()",
        nameLabel: "Return value",
        props: [
          {
            description: "The current step and the step count.",
            name: "currentStep, totalSteps",
            type: "number",
          },
          {
            description:
              "Whether a step exists after or before the current one.",
            name: "canGoToNextStep, canGoToPrevStep",
            type: "boolean",
          },
          {
            description: "Move one step, or back to the first.",
            name: "goToNextStep, goToPrevStep, reset",
            type: "() => void",
          },
          {
            description: "Jump to a step.",
            name: "setStep",
            type: "Dispatch<SetStateAction<number>>",
          },
        ],
      },
    ],
    demo: { Component: OnboardingDemo, file: "onboarding-demo" },
    examples: [
      {
        Component: OnboardingUseOnboarding,
        description:
          "Build your own controls with `useOnboarding`: a step counter, then a skip button that turns into a restart.",
        file: "onboarding-use-onboarding",
        title: "useOnboarding",
      },
    ],
  },
};
