import { ToastAsync } from "@/components/demos/toast-async";
import { ToastControlled } from "@/components/demos/toast-controlled";
import { ToastDemo } from "@/components/demos/toast-demo";
import type { ApiPart, Demo, Example } from "@/components/docs/registry-docs";
import { ToastSoundChrome } from "@/lab/toast/sound-chrome";

const UI_SDK = "https://ui-sdk.dev/docs/react/components";

/** The main demo, under the title: the toaster at full size, with its sound on. */
export const TOAST_DEMO: Demo = {
  Chrome: ToastSoundChrome,
  Component: ToastDemo,
  file: "toast-demo",
};

/** The examples past the main demo, each behind Preview and Code tabs. */
export const TOAST_EXAMPLES: Example[] = [
  {
    Chrome: ToastSoundChrome,
    Component: ToastAsync,
    description:
      "`onToast` can await real work. The lever stays down until it settles: a resolved title pops as a success, and a rejection pops its message as an error, every second save here. Stop aborts `signal`.",
    file: "toast-async",
    title: "Async work",
  },
  {
    Chrome: ToastSoundChrome,
    Component: ToastControlled,
    description:
      "Set `toasting` to start a cycle from your own code. Here the form pushes the lever down, and the slice pops with your message three seconds later. The lever, the dial and Stop still work by hand, and `onToastingChange` reports each start and each end.",
    file: "toast-controlled",
    title: "Controlled",
  },
];

/** The parts' API on `/lab/literal-ui/toast`: only the props each part adds. */
export const TOAST_API: ApiPart[] = [
  {
    description:
      "Holds the cycle, the slice and the browning level. The slice is a toast in your `toaster`.",
    extends: { name: "div" },
    name: "Toast",
    props: [
      {
        description:
          "From `createToaster()`. Give it to this toaster alone: every toast it holds shows in the slot.",
        name: "toaster",
        type: "Toaster",
      },
      {
        description:
          'Runs once the catch holds the lever. Return a title for a success, or toast options such as `{ type: "error", title }`. A throw shows its message as an error. Return nothing to keep what you set with `toaster.update(id, …)`.',
        name: "onToast",
        type: "(cycle: ToastCycle) => ToastOutcome | void | Promise<ToastOutcome | void>",
      },
      {
        description:
          "Asked as the lever reaches the catch. Return `false` and the lever springs back up.",
        name: "canToast",
        type: "() => boolean",
      },
      {
        default: "3",
        description:
          "The dial's browning level: how long a cycle lasts and how much it browns the slice.",
        name: "defaultLevel",
        type: "1 | 2 | 3 | 4 | 5",
      },
      {
        description: "The browning level, controlled.",
        name: "level",
        type: "1 | 2 | 3 | 4 | 5",
      },
      {
        description: "Runs when the dial turns to a new level.",
        name: "onLevelChange",
        type: "(level: ToastLevel) => void",
      },
      {
        default: "false",
        description:
          "Starts a cycle on mount, as if the lever had been pushed down.",
        name: "defaultToasting",
        type: "boolean",
      },
      {
        description:
          "Whether a cycle runs, controlled. Set it to `true` to push the lever down and start a cycle, and to `false` to stop it, as Stop does.",
        name: "toasting",
        type: "boolean",
      },
      {
        description:
          "Runs when a cycle starts, by hand or from `toasting`, and when it ends, by a pop or by Stop.",
        name: "onToastingChange",
        type: "(toasting: boolean) => void",
      },
      {
        default: '"Plain bread, ready to toast"',
        description: "The title of a fresh slice, for screen readers.",
        name: "idleTitle",
        type: "string",
      },
      {
        default: '"Toasting…"',
        description: "The slice's title while a cycle runs.",
        name: "toastingTitle",
        type: "string",
      },
    ],
  },
  {
    description: "What `onToast` receives.",
    name: "ToastCycle",
    nameLabel: "Field",
    props: [
      {
        description: "The slice's toast id in your toaster.",
        name: "id",
        type: "string",
      },
      {
        description: "The dial's level for this cycle.",
        name: "level",
        type: "1 | 2 | 3 | 4 | 5",
      },
      {
        description:
          "How toasted the slice will be once the cycle ends, from 0 to 1. Browning adds up from one cycle to the next.",
        name: "browning",
        type: "number",
      },
      {
        description: "Whether that browning reads as burnt.",
        name: "burnt",
        type: "boolean",
      },
      {
        description:
          "Aborted when Stop ends the cycle. The slice then goes back to what it said.",
        name: "signal",
        type: "AbortSignal",
      },
    ],
  },
  {
    description:
      "The toaster in 3D, with the controls laid over its parts. It shows a still picture until the scene loads, and keeps it without WebGL 2, with the slice's title written on it.",
    extends: { name: "div" },
    name: "ToastStage",
    props: [],
  },
  {
    description:
      "The front slot, where the slice stands. Pull the slice up to take it out, and a fresh one drops in.",
    extends: { href: `${UI_SDK}/toast`, name: "UI SDK ToastRegion" },
    name: "ToastRegion",
    props: [],
  },
  {
    description: "The browning dial. Drag up or down, or use the arrow keys.",
    extends: { href: `${UI_SDK}/slider`, name: "UI SDK Slider" },
    name: "ToastDial",
    props: [
      {
        default: '"Browning"',
        description: "Names the dial.",
        name: "aria-label",
        type: "string",
      },
    ],
  },
  {
    description:
      "The lever. Drag it down to the catch, or press Enter, Space or the Down arrow.",
    extends: { href: `${UI_SDK}/slider`, name: "UI SDK Slider" },
    name: "ToastLever",
    props: [
      {
        default: '"Lever"',
        description: "Names the lever.",
        name: "aria-label",
        type: "string",
      },
    ],
  },
  {
    description:
      "Ends the cycle early. The slice keeps its browning and its previous title.",
    extends: { href: `${UI_SDK}/button`, name: "UI SDK Button" },
    name: "ToastStop",
    props: [],
  },
  {
    description:
      "Plays the toaster's recorded sounds. It renders nothing, and loads nothing until the page is pressed. Import it from `toast-sound`.",
    name: "ToastAudio",
    props: [
      {
        default: "false",
        description: "Silences this toaster alone.",
        name: "muted",
        type: "boolean",
      },
    ],
  },
  {
    description:
      "Mutes every `ToastAudio` inside it, for a sound preference that covers the whole app or one part of it. It renders nothing of its own.",
    name: "ToastAudioProvider",
    props: [
      {
        description:
          "Silences the toasters below. Turned off during a press, their sounds unlock at once.",
        name: "muted",
        type: "boolean",
      },
    ],
  },
  {
    description:
      "Follows what the toaster does as it happens, as `ToastAudio` does: the lever, the dial, Stop, each pop and each slice.",
    name: "useToastEvents",
    nameLabel: "Returns",
    props: [
      {
        description:
          "Calls `listener` with each event. Returns the unsubscribe.",
        name: "subscribe",
        type: "(listener: (event: ToastEvent) => void) => () => void",
      },
    ],
  },
];
