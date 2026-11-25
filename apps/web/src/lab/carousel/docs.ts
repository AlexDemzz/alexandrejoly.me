import { CarouselControlled } from "@/components/demos/carousel-controlled";
import { CarouselDemo } from "@/components/demos/carousel-demo";
import { CarouselTimer } from "@/components/demos/carousel-timer";
import type { ApiPart, Demo, Example } from "@/components/docs/registry-docs";
import { CarouselSoundChrome } from "@/lab/carousel/sound-chrome";

const UI_SDK = "https://ui-sdk.dev/docs/react/components";

/** The main demo, under the title: the projector at full size, with its sound on. */
export const CAROUSEL_DEMO: Demo = {
  Chrome: CarouselSoundChrome,
  Component: CarouselDemo,
  file: "carousel-demo",
};

/** The examples past the main demo, each behind Preview and Code tabs. */
export const CAROUSEL_EXAMPLES: Example[] = [
  {
    Chrome: CarouselSoundChrome,
    Component: CarouselTimer,
    description:
      "`defaultPlaying` starts the timer, and `interval` sets how long each slide shows. The switch slides on, and Next or Previous turns it off, as on the projector. Pointing at the picture pauses it. It stays off for people who prefer reduced motion, until they slide the switch.",
    file: "carousel-timer",
    title: "Timer",
  },
  {
    Chrome: CarouselSoundChrome,
    Component: CarouselControlled,
    description:
      "Set `page` to show a slide from your own code. Here each button asks for its slide, and the tray turns to it. The keys still work by hand, and `onPageChange` reports every change with its reason.",
    file: "carousel-controlled",
    title: "Controlled",
  },
];

/** The parts' API on `/lab/literal-ui/carousel`: only the props each part adds. */
export const CAROUSEL_API: ApiPart[] = [
  {
    description:
      "Holds the page, the timer and the focus. It loops: Next on the last slide turns the tray on round to the first.",
    extends: { name: "div" },
    name: "Carousel",
    props: [
      {
        default: "1",
        description: "The slide it starts on, from 1.",
        name: "defaultPage",
        type: "number",
      },
      {
        description: "The current slide, from 1, controlled.",
        name: "page",
        type: "number",
      },
      {
        description:
          "Runs when the slide wants to change. `details.reason` says why, and `details.cancel()` keeps the slide.",
        name: "onPageChange",
        type: "(page: number, details: ChangeDetails) => void",
      },
      {
        description: "Runs once the carousel has settled on the new slide.",
        name: "onPageChangeComplete",
        type: "(page: number) => void",
      },
      {
        default: "false",
        description:
          "Starts with the timer on. It stays off for people who prefer reduced motion.",
        name: "defaultPlaying",
        type: "boolean",
      },
      {
        description: "Whether the timer runs, controlled.",
        name: "playing",
        type: "boolean",
      },
      {
        description:
          "Runs when the timer starts or stops, by the switch, by a key or by keyboard focus moving into the picture.",
        name: "onPlayingChange",
        type: "(playing: boolean, details: ChangeDetails) => void",
      },
      {
        default: "5000",
        description: "How long each slide shows while the timer runs, in ms.",
        name: "interval",
        type: "number",
      },
      {
        default: "50",
        description:
          "Where the focus knob starts, from 0 to 100. The picture is sharp at 50 and blurs toward either end.",
        name: "defaultFocus",
        type: "number",
      },
      {
        description: "The focus, controlled.",
        name: "focus",
        type: "number",
      },
      {
        description: "Runs when the focus knob turns.",
        name: "onFocusChange",
        type: "(focus: number) => void",
      },
    ],
  },
  {
    description:
      "The projector in 3D, with the controls laid over its parts and the picture on the wall in front of it. It shows a still picture of the projector until the scene loads, and keeps it without WebGL 2: the slides still change.",
    extends: { name: "div" },
    name: "CarouselStage",
    props: [],
  },
  {
    description:
      "The picture on the wall: the slides, one to a view. Name it with `aria-label`. The arrow keys change slide once it has focus.",
    extends: { href: `${UI_SDK}/carousel`, name: "UI SDK Carousel" },
    name: "CarouselContent",
    props: [],
  },
  {
    description:
      "One slide. Each one also stands in the tray, from the slot over the gate on, up to 80 of them.",
    extends: { href: `${UI_SDK}/carousel`, name: "UI SDK CarouselItem" },
    name: "CarouselItem",
    props: [],
  },
  {
    description:
      "The key on the right. The slide lifts, the tray turns a slot on and the next slide drops into the gate.",
    extends: { href: `${UI_SDK}/carousel`, name: "UI SDK CarouselNext" },
    name: "CarouselNext",
    props: [
      {
        default: '"Next slide"',
        description: "Names the key.",
        name: "aria-label",
        type: "string",
      },
    ],
  },
  {
    description: "The key on the left. The tray turns a slot back.",
    extends: { href: `${UI_SDK}/carousel`, name: "UI SDK CarouselPrevious" },
    name: "CarouselPrevious",
    props: [
      {
        default: '"Previous slide"',
        description: "Names the key.",
        name: "aria-label",
        type: "string",
      },
    ],
  },
  {
    description:
      "The timer's slide switch: on, the slides change by themselves.",
    extends: {
      href: `${UI_SDK}/carousel`,
      name: "UI SDK CarouselPlayToggle",
    },
    name: "CarouselPlayToggle",
    props: [
      {
        default: '"Start the timer"',
        description: "Names the switch while the timer is off.",
        name: "startLabel",
        type: "string",
      },
      {
        default: '"Stop the timer"',
        description: "Names the switch while the timer runs.",
        name: "stopLabel",
        type: "string",
      },
    ],
  },
  {
    description:
      "The focus knob. Drag up or down, or use the arrow keys: the lens moves in or out and the picture blurs.",
    extends: { href: `${UI_SDK}/slider`, name: "UI SDK Slider" },
    name: "CarouselFocus",
    props: [
      {
        default: '"Focus"',
        description: "Names the knob.",
        name: "aria-label",
        type: "string",
      },
    ],
  },
  {
    description:
      "Plays the projector's recorded sounds, its fan included. It renders nothing, and loads nothing until the page is pressed. Import it from `carousel-sound`.",
    name: "CarouselAudio",
    props: [
      {
        default: "false",
        description: "Silences this projector alone.",
        name: "muted",
        type: "boolean",
      },
    ],
  },
  {
    description:
      "Mutes every `CarouselAudio` inside it, for a sound preference that covers the whole app or one part of it. It renders nothing of its own.",
    name: "CarouselAudioProvider",
    props: [
      {
        description:
          "Silences the projectors below. Turned off during a press, their sounds unlock at once.",
        name: "muted",
        type: "boolean",
      },
    ],
  },
  {
    description:
      "Follows what the projector does as it happens, as `CarouselAudio` does: the keys, the shutter, the slide lifting and dropping, the tray, the timer and the focus knob.",
    name: "useCarouselEvents",
    nameLabel: "Returns",
    props: [
      {
        description:
          "Calls `listener` with each event. Returns the unsubscribe.",
        name: "subscribe",
        type: "(listener: (event: CarouselEvent) => void) => () => void",
      },
    ],
  },
];
