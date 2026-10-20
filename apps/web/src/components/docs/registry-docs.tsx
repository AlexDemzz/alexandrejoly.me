import type { ComponentType } from "react";

import { HintDemo } from "@/components/demos/hint-demo";
import { InfiniteScrollDemo } from "@/components/demos/infinite-scroll-demo";
import { MarqueeDemo } from "@/components/demos/marquee-demo";
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
  title: string;
}

export interface ApiProp {
  default?: string;
  description: string;
  name: string;
  type: string;
}

export interface ApiPart {
  description: string;
  name: string;
  /** Heads the name column; defaults to "Prop". */
  nameLabel?: string;
  props: ApiProp[];
}

export interface ComponentDocs {
  api: ApiPart[];
  demo: Demo;
  examples: Example[];
  usage: string;
}

const CLASS_NAME_PROP: ApiProp = {
  description: "Merged onto the part’s element.",
  name: "className",
  type: "string",
};

export const REGISTRY_DOCS: Record<RegistryItemName, ComponentDocs> = {
  hint: {
    api: [
      {
        description:
          "The Base UI Popover root. Controls the open state; it renders no element.",
        name: "Hint",
        props: [
          {
            description: "The open state when uncontrolled.",
            default: "false",
            name: "defaultOpen",
            type: "boolean",
          },
          {
            description: "The controlled open state.",
            name: "open",
            type: "boolean",
          },
          {
            description: "Called when the hint opens or closes.",
            name: "onOpenChange",
            type: "(open: boolean, details) => void",
          },
        ],
      },
      {
        description:
          "The button that toggles the hint. Put the label in it, text then icon, so it needs no `aria-label`; icons are sized to 16px. Its hit area extends 8px past its edges.",
        name: "HintTrigger",
        props: [
          {
            description: "Replaces the rendered button.",
            name: "render",
            type: "ReactElement | (props, state) => ReactElement",
          },
          CLASS_NAME_PROP,
        ],
      },
      {
        description: "A stock `PopoverContent`, portalled to the body.",
        name: "HintContent",
        props: [
          {
            default: '"bottom"',
            description: "The side of the trigger it opens on.",
            name: "side",
            type: '"top" | "right" | "bottom" | "left" | "inline-start" | "inline-end"',
          },
          {
            default: '"center"',
            description: "Its alignment along that side.",
            name: "align",
            type: '"start" | "center" | "end"',
          },
          {
            default: "4",
            description: "Distance from the trigger, in pixels.",
            name: "sideOffset",
            type: "number",
          },
          CLASS_NAME_PROP,
        ],
      },
    ],
    demo: { Component: HintDemo, file: "hint-demo" },
    examples: [],
    usage: `import { Hint, HintContent, HintTrigger } from "@/components/ui/hint";

<Hint>
  <HintTrigger>
    Monthly active users
    <CircleHelpIcon />
  </HintTrigger>
  <HintContent>People who opened the app in the last 30 days.</HintContent>
</Hint>`,
  },
  "infinite-scroll": {
    api: [
      {
        description:
          "Shares the pagination state with the sentinel. Renders a `div`; make it the scroll container or let the page scroll.",
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
          CLASS_NAME_PROP,
        ],
      },
      {
        description:
          "Place it after the last item. Renders a `div` holding the spinner while fetching.",
        name: "InfiniteScrollSentinel",
        props: [
          {
            description:
              "Replaces the rendered element, for example an `li` inside a list. Its children hold the spinner.",
            name: "render",
            type: "ReactElement | (props, state) => ReactElement",
          },
          CLASS_NAME_PROP,
        ],
      },
    ],
    demo: { Component: InfiniteScrollDemo, file: "infinite-scroll-demo" },
    examples: [],
    usage: `import {
  InfiniteScroll,
  InfiniteScrollSentinel,
} from "@/components/ui/infinite-scroll";

<InfiniteScroll
  hasNextPage={hasNextPage}
  isFetchingNextPage={isFetchingNextPage}
  onFetchNextPage={() => fetchNextPage()}
>
  {items.map((item) => (
    <Row key={item.id} {...item} />
  ))}
  <InfiniteScrollSentinel />
</InfiniteScroll>`,
  },
  marquee: {
    api: [
      {
        description:
          "Clips the tracks and anchors the fades. A pointer over it pauses any track set to `pauseOnHover`.",
        name: "Marquee",
        props: [CLASS_NAME_PROP],
      },
      {
        description:
          "The track. It renders its items twice and a CSS keyframe slides it by one copy per cycle, with no JavaScript. Under reduced motion it stays on the first copy.",
        name: "MarqueeContent",
        props: [
          {
            default: '"40s"',
            description: "One full cycle.",
            name: "duration",
            type: "string",
          },
          {
            default: '"2rem"',
            description:
              "The space between items, which also spaces the loop’s seam.",
            name: "gap",
            type: "string",
          },
          {
            default: '"horizontal"',
            description:
              "`vertical` stacks the items and slides them upward, a reel inside a frame one item plus one gap tall.",
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
          CLASS_NAME_PROP,
        ],
      },
      {
        description: "One item of the track. It never shrinks.",
        name: "MarqueeItem",
        props: [CLASS_NAME_PROP],
      },
      {
        description: "A gradient from the page background over one edge.",
        name: "MarqueeFade",
        props: [
          {
            description: "The edge it covers.",
            name: "side",
            type: '"left" | "right"',
          },
          CLASS_NAME_PROP,
        ],
      },
    ],
    demo: { Component: MarqueeDemo, file: "marquee-demo" },
    examples: [
      {
        Component: MarqueePauseOnHover,
        description:
          "Give it a longer `duration` and hold it under the pointer so longer items can be read.",
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
          "A vertical track in a frame one item plus one gap tall rolls words in place.",
        file: "marquee-vertical",
        title: "Vertical",
      },
    ],
    usage: `import {
  Marquee,
  MarqueeContent,
  MarqueeFade,
  MarqueeItem,
} from "@/components/ui/marquee";

<Marquee>
  <MarqueeFade side="left" />
  <MarqueeContent>
    <MarqueeItem>React</MarqueeItem>
    <MarqueeItem>TypeScript</MarqueeItem>
  </MarqueeContent>
  <MarqueeFade side="right" />
</Marquee>`,
  },
  "notification-badge": {
    api: [
      {
        description:
          "Holds the count and the hole geometry, as CSS variables its parts read.",
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
          CLASS_NAME_PROP,
        ],
      },
      {
        description:
          "Wraps the icon, button or avatar. Clips a hole under the badge so the gap shows whatever is behind it.",
        name: "NotificationBadgeContent",
        props: [CLASS_NAME_PROP],
      },
      {
        description:
          "The shadcn `Badge`, destructive variant: a circle for one digit, a pill for two or `99+`, sized and placed from the root’s variables. Renders nothing at 0.",
        name: "NotificationBadgeIndicator",
        props: [
          {
            description:
              "Layout only. Pass `static` to sit the badge beside a label instead of over the content.",
            name: "className",
            type: "string",
          },
        ],
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
    usage: `import {
  NotificationBadge,
  NotificationBadgeContent,
  NotificationBadgeIndicator,
} from "@/components/ui/notification-badge";

<NotificationBadge count={3}>
  <NotificationBadgeContent>
    <Button aria-label="Notifications" size="icon" variant="outline">
      <BellIcon />
    </Button>
  </NotificationBadgeContent>
  <NotificationBadgeIndicator />
</NotificationBadge>`,
  },
  onboarding: {
    api: [
      {
        description: "Holds the current step and renders a `div`.",
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
          CLASS_NAME_PROP,
        ],
      },
      {
        description:
          "Counts its steps and shows the current one. A step change crosses as a View Transition, fading and blurring; without the API the step just swaps. Children must be `OnboardingStep`s.",
        name: "OnboardingContent",
        props: [CLASS_NAME_PROP],
      },
      {
        description: "One step.",
        name: "OnboardingStep",
        props: [
          {
            description: "Its position, counted from 1.",
            name: "value",
            type: "number",
          },
          CLASS_NAME_PROP,
        ],
      },
      {
        description:
          "A 400px stage for an image or illustration. `OnboardingTitle` (`h2`) and `OnboardingDescription` (`p`) take the text.",
        name: "OnboardingMedia",
        props: [CLASS_NAME_PROP],
      },
      {
        description:
          "Stacks the indicator over the nav. `OnboardingIndicator` draws one progress bar per step; `OnboardingNav` spreads the buttons apart.",
        name: "OnboardingFooter",
        props: [CLASS_NAME_PROP],
      },
      {
        description:
          "Ghost button to the previous step, replaced by an empty spacer on the first.",
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
        description: "Moves forward, or calls `onComplete` on the last step.",
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
    usage: `import {
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
} from "@/components/ui/onboarding";

<Onboarding onComplete={() => setOpen(false)}>
  <OnboardingContent>
    <OnboardingStep value={1}>
      <OnboardingTitle>Meet your coach</OnboardingTitle>
      <OnboardingDescription>Answer a few questions.</OnboardingDescription>
    </OnboardingStep>
    <OnboardingStep value={2}>
      <OnboardingTitle>Train with a plan</OnboardingTitle>
      <OnboardingDescription>Log each set as you go.</OnboardingDescription>
    </OnboardingStep>
  </OnboardingContent>
  <OnboardingFooter>
    <OnboardingIndicator />
    <OnboardingNav>
      <OnboardingPrevButton />
      <OnboardingNextButton />
    </OnboardingNav>
  </OnboardingFooter>
</Onboarding>`,
  },
};
