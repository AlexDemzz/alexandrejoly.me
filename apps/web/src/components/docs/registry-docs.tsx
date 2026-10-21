import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@portfolio/ui/components/alert";
import { Code } from "@portfolio/ui/components/code";
import { TriangleAlertIcon } from "lucide-react";
import type { ComponentType, ReactNode } from "react";

import { HintDemo } from "@/components/demos/hint-demo";
import { InfiniteScrollDemo } from "@/components/demos/infinite-scroll-demo";
import { InfiniteScrollReverse } from "@/components/demos/infinite-scroll-reverse";
import { ItemInsetSeparatorDemo } from "@/components/demos/item-inset-separator-demo";
import { ItemInsetSeparatorMedia } from "@/components/demos/item-inset-separator-media";
import { MarqueeDemo } from "@/components/demos/marquee-demo";
import { MarqueeFit } from "@/components/demos/marquee-fit";
import { MarqueePauseOnHover } from "@/components/demos/marquee-pause-on-hover";
import { MarqueeReverse } from "@/components/demos/marquee-reverse";
import { MarqueeVertical } from "@/components/demos/marquee-vertical";
import { NotificationBadgeCompact } from "@/components/demos/notification-badge-compact";
import { NotificationBadgeCounts } from "@/components/demos/notification-badge-counts";
import { NotificationBadgeDemo } from "@/components/demos/notification-badge-demo";
import { NotificationBadgeDot } from "@/components/demos/notification-badge-dot";
import { NotificationBadgeLabel } from "@/components/demos/notification-badge-label";
import { OnboardingDemo } from "@/components/demos/onboarding-demo";
import { OnboardingUseOnboarding } from "@/components/demos/onboarding-use-onboarding";
import type { RegistryItemName } from "@/lib/registry";

/**
 * A docs-only toggle over a preview that traces part of the component. Its
 * `name` lands on the preview as `data-inspect`, which `index.css` styles, so
 * the demo's code never carries the trace.
 */
export interface Inspector {
  label: string;
  name: string;
}

/** A file in `src/components/demos`, named without its extension. */
export interface Demo {
  Component: ComponentType;
  file: string;
  inspector?: Inspector;
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
  /** Paragraphs of the Accessibility section, with `backtick` code spans. */
  accessibility?: string[];
  api: ApiPart[];
  demo: Demo;
  examples: Example[];
}

export const REGISTRY_DOCS: Record<RegistryItemName, ComponentDocs> = {
  hint: {
    accessibility: [
      "The trigger is a `button` that holds its own label, so its name is the text people see and it needs no `aria-label`; the icon beside it is decorative. Its hit area reaches 8px past its edges, so it clears the 24px minimum of WCAG 2.5.8.",
      "It opens on press, by click, Enter or Space, rather than on hover, so touch and keyboard users reach it too. Focus moves into the bubble, and Escape closes it and returns focus to the trigger, as in any Base UI popover.",
    ],
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
        description: "The bubble, portaled to the body.",
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
    accessibility: [
      "The content is `aria-busy` while a page is being fetched, so a screen reader waits for the page instead of reading each new item.",
      "Focus stays where it is when a page arrives. In reverse mode, the DOM stays in reading order, oldest first: only the viewport is reversed, so the reading and Tab order match what is on screen.",
      'Give a viewport with no focusable item inside `tabIndex={0}`, a role such as `region` and an `aria-label`, so it can be scrolled from the keyboard. Avoid `role="log"` on a reversed list: it would announce every older page as it loads.',
    ],
    api: [
      {
        description:
          "Shares the pagination state with its parts; it renders no element.",
        name: "InfiniteScroll",
        props: [
          {
            description: "Whether another page can be fetched.",
            name: "hasNextPage",
            type: "boolean",
          },
          {
            description:
              "Whether a page is being fetched. The content is `aria-busy` and the sentinel shows a spinner and stops observing meanwhile.",
            name: "isFetchingNextPage",
            type: "boolean",
          },
          {
            description:
              "Called when the sentinel scrolls into view while a next page exists and none is being fetched.",
            name: "onFetchNextPage",
            type: "() => void",
          },
          {
            default: "false",
            description:
              "Loads older pages at the top, as in a chat: the viewport opens at the bottom and keeps its place while pages are added above.",
            name: "reverse",
            type: "boolean",
          },
        ],
      },
      {
        description:
          "The scroll container. Give it a height. To let the page scroll instead, leave out `InfiniteScrollViewport`, except in reverse mode, which needs it.",
        extends: { name: "div" },
        name: "InfiniteScrollViewport",
        props: [],
      },
      {
        description:
          "Holds the items and the sentinel, in reading order. It is `aria-busy` while a page is being fetched.",
        extends: { name: "div" },
        name: "InfiniteScrollContent",
        props: [],
      },
      {
        description:
          "Place it after the last item, or before the first one in reverse mode. It holds the spinner while fetching.",
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
    examples: [
      {
        Component: InfiniteScrollReverse,
        description:
          "Older pages load at the top. The list opens at the bottom from the first paint, and what you are reading stays put while a page arrives.",
        file: "infinite-scroll-reverse",
        title: "Reverse",
      },
    ],
  },
  "item-inset-separator": {
    accessibility: [
      "Each line has the `separator` role, so a screen reader announces one inside every row. The rows already part the content: pass `aria-hidden` to keep the line visual only.",
    ],
    api: [
      {
        description:
          "Placed inside an `Item`, a line along its bottom from where `ItemContent` starts, so it follows each row’s media, or the row’s edge without one. Render it in every row but the last, and stack the rows without a gap, in a plain flex column rather than an `ItemGroup`, so each line sits midway between two rows. A plain class replaces its position or margins; its start and width need an important class, such as `start-4!` or `w-1/2!`.",
        extends: {
          href: "https://ui.shadcn.com/docs/components/base/item",
          name: "shadcn ItemSeparator",
        },
        name: "ItemInsetSeparator",
        props: [],
      },
    ],
    demo: {
      Component: ItemInsetSeparatorDemo,
      file: "item-inset-separator-demo",
    },
    examples: [
      {
        Component: ItemInsetSeparatorMedia,
        description:
          "Each line starts at its own row’s text: past an image, past an icon, or at the edge with no media.",
        file: "item-inset-separator-media",
        notice: (
          // Only browsers without anchor positioning see it.
          <Alert
            className="hidden not-supports-[anchor-name:--a]:grid"
            role="note"
            variant="warning"
          >
            <TriangleAlertIcon aria-hidden />
            <AlertTitle>In this browser, the lines run full width</AlertTitle>
            <AlertDescription>
              Starting each line at its text needs CSS anchor positioning, which
              this browser doesn’t support yet.
            </AlertDescription>
          </Alert>
        ),
        title: "Inset past the media",
      },
    ],
  },
  marquee: {
    accessibility: [
      "The second copy of each track is `inert`: screen readers and the Tab key meet every item once, in the first copy.",
      "Focus inside the marquee pauses every track, so a keyboard user can stop it to read or follow a link; `pauseOnHover` does the same for a pointer. When content people need to read moves for more than five seconds, WCAG 2.2.2 also asks for a visible pause control: add a button that sets `[animation-play-state:paused]` on the tracks.",
      "Under `prefers-reduced-motion: reduce` the tracks stay still on the first copy.",
    ],
    api: [
      {
        description:
          "Clips the tracks. While its items fit, it stands still with no clone, in browsers with CSS scroll-driven animations. Add shadcn’s `scroll-fade-x`, or `scroll-fade-y` on a vertical track, to fade its edges while the items slide: it sets `--scroll-fade-reveal: 0px`, so both fades show although it never scrolls. Focus inside it pauses every track; a pointer over it pauses any track set to `pauseOnHover`.",
        extends: { name: "div" },
        name: "Marquee",
        props: [],
      },
      {
        description:
          "The track. It renders its child elements twice and a CSS keyframe slides it by one copy per cycle, with no JavaScript. Bare text is dropped, so wrap it in `MarqueeItem`. The second copy is `inert`: skipped by screen readers and the Tab key. Under reduced motion it stays on the first copy.",
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
            description:
              "Pauses the track while a pointer is over the marquee.",
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
          "One item of the track. Its padding spaces the items and the loop’s seam alike: `px-4` on a horizontal track, `py-2` on a vertical one. Override it with a class such as `px-2`.",
        extends: { name: "div" },
        name: "MarqueeItem",
        props: [],
      },
    ],
    demo: { Component: MarqueeDemo, file: "marquee-demo" },
    examples: [
      {
        Component: MarqueePauseOnHover,
        description:
          "A slower track, from `[--marquee-duration:60s]`, pauses under the pointer so longer items can be read.",
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
          "A vertical track, faded at the top and bottom, runs on a shorter cycle from `[--marquee-duration:12s]`.",
        file: "marquee-vertical",
        title: "Vertical",
      },
      {
        Component: MarqueeFit,
        description:
          "Items narrower than the marquee stand still: no clone, no fade. CSS scroll-driven animations detect the overflow.",
        file: "marquee-fit",
        notice: (
          // Only browsers without scroll-driven animations see it, Firefox today.
          <Alert
            className="hidden not-supports-[animation-timeline:scroll()]:grid"
            role="note"
            variant="warning"
          >
            <TriangleAlertIcon aria-hidden />
            <AlertTitle>
              In this browser, the items slide even though they fit
            </AlertTitle>
            <AlertDescription>
              Telling that they fit needs CSS scroll-driven animations, which
              this browser doesn’t support yet.
            </AlertDescription>
          </Alert>
        ),
        title: "Content that fits",
      },
    ],
  },
  "notification-badge": {
    accessibility: [
      "The indicator is `aria-hidden`, since its count, read alone, doesn’t say what it counts. Put the count in the name of the button instead.",
      "On an icon button, write it in the `aria-label`: “Notifications, 3 unread”, or “Messages, new activity” for a dot, which shows no count at all. Beside a label, keep the visible text first and add the rest in an `sr-only` span, so the name still starts with what the button shows.",
      "Build the whole phrase with your translation library rather than joining pieces, and say “more than 99” where you show `99+`.",
      "A count that changes is not announced. To announce it, update one polite live region for the whole app with a phrase that says what changed, such as “2 new messages”.",
    ],
    api: [
      {
        description:
          "Shares the value with its parts. Sets the geometry of the hole, the transparent cut-out around the badge, as CSS variables.",
        extends: { name: "span" },
        name: "NotificationBadge",
        nameLabel: "Prop or variable",
        props: [
          {
            description:
              'What the badge shows, as is: format it yourself, as `99+` or a compact number. Nothing shows for a number of 0 or below, or an empty string; a string such as `"0"` still shows. The badge widens by one step per character.',
            name: "value",
            type: "number | string",
          },
          {
            default: '"default"',
            description: "A counter, or a dot shown while `value` would show.",
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
          "A badge in the `destructive` color: a circle for one character, a pill for more, sized and placed from the root’s variables. Renders nothing while `value` is 0 or below, or empty, and is `aria-hidden`: see Accessibility. Add `static` to its class to sit it beside a label instead of over the content.",
        extends: { name: "span" },
        name: "NotificationBadgeIndicator",
        props: [],
      },
    ],
    demo: {
      Component: NotificationBadgeDemo,
      file: "notification-badge-demo",
      inspector: { label: "Show hole", name: "hole" },
    },
    examples: [
      {
        Component: NotificationBadgeDot,
        description: "A dot signals that something is new, without a number.",
        file: "notification-badge-dot",
        title: "Dot",
      },
      {
        Component: NotificationBadgeCounts,
        description:
          "One character makes a circle, more make a pill, and the hole under it, the transparent cut-out around the badge, keeps the same shape. The demo caps the count at `99+` itself, since `value` shows whatever it gets.",
        file: "notification-badge-counts",
        notice: (
          // Only browsers without CSS shape() see it.
          <Alert
            className="hidden not-supports-[clip-path:shape(from_0_0,line_to_1px_1px)]:grid"
            role="note"
            variant="warning"
          >
            <TriangleAlertIcon aria-hidden />
            <AlertTitle>In this browser, the badge has no gap</AlertTitle>
            <AlertDescription>
              Cutting the gap around the badge needs the CSS{" "}
              <Code wrap="token">shape()</Code> function, which this browser
              doesn’t support yet.
            </AlertDescription>
          </Alert>
        ),
        title: "Counts",
      },
      {
        Component: NotificationBadgeCompact,
        description:
          '`value` takes a string, so `Intl.NumberFormat` with `notation: "compact"` can shorten a large count to `1.2K`. The demo pins `"en"` so the server and the browser format alike; pass the page’s locale instead. The label keeps the full number.',
        file: "notification-badge-compact",
        title: "Compact counts",
      },
      {
        Component: NotificationBadgeLabel,
        description:
          "Beside a label, `NotificationBadgeContent` is left out and `static` takes the indicator out of the overlay.",
        file: "notification-badge-label",
        title: "Beside a label",
      },
    ],
  },
  onboarding: {
    accessibility: [
      "`OnboardingIndicator` is one `progressbar` read as “Step 2 of 3”; its segments are hidden from assistive tech, so nobody hears one bar per step.",
      "Focus stays on the button that changed the step, and the new step is not announced. When a step carries content people must hear, move focus to its `OnboardingTitle`, given `tabIndex={-1}`, once the step renders.",
    ],
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
              "Called when `OnboardingNextButton` is pressed on the last step.",
            name: "onComplete",
            type: "() => void",
          },
          {
            description:
              "How many steps there are. Known on the first render, so the server draws the right indicator and button.",
            name: "totalSteps",
            type: "number",
          },
        ],
      },
      {
        description: "Wraps the steps.",
        extends: { name: "div" },
        name: "OnboardingContent",
        props: [],
      },
      {
        description: "One step, rendered only while it is the current one.",
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
          "Centers an image or illustration and takes the height of what you put in it.",
        extends: { name: "div" },
        name: "OnboardingMedia",
        props: [],
      },
      {
        description: "Groups the title and the description under the media.",
        extends: { name: "div" },
        name: "OnboardingHeader",
        props: [],
      },
      {
        description: "The step’s title.",
        extends: { name: "h2" },
        name: "OnboardingTitle",
        props: [],
      },
      {
        description: "The step’s description.",
        extends: { name: "p" },
        name: "OnboardingDescription",
        props: [],
      },
      {
        description: "Stacks the indicator over the nav.",
        extends: { name: "div" },
        name: "OnboardingFooter",
        props: [],
      },
      {
        description:
          "One `progressbar` announced as “Step 2 of 3”, drawn as one shadcn `Progress` per step, hidden from assistive tech. Its name defaults to “Onboarding progress”; pass `aria-label` to change it.",
        extends: { name: "div" },
        name: "OnboardingIndicator",
        props: [],
      },
      {
        description: "Spreads the previous and next buttons apart.",
        extends: { name: "div" },
        name: "OnboardingNav",
        props: [],
      },
      {
        description:
          "Ghost button to the previous step, disabled on the first. It stays focusable while disabled, so focus is not lost when it brings the flow back to step 1. An `onClick` runs before the step changes.",
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
          "Reads and drives the flow from any descendant of `Onboarding`. `setStep` throws outside 1 to `totalSteps`.",
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
          "`useOnboarding` drives custom controls: a step counter, then a skip button that completes the flow and turns into a restart on the last step.",
        file: "onboarding-use-onboarding",
        title: "useOnboarding",
      },
    ],
  },
};
