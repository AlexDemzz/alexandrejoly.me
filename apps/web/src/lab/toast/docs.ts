import { ToasterAsync } from "@/components/demos/toaster-async";
import { ToasterDemo } from "@/components/demos/toaster-demo";
import type { ApiPart, Demo, Example } from "@/components/docs/registry-docs";
import { ToasterSoundChrome } from "@/lab/toast/sound-chrome";

const UI_SDK = "https://ui-sdk.dev/docs/react/components";

/** The main demo, under the title: the toaster at full size, with its sound on. */
export const TOASTER_DEMO: Demo = {
  Chrome: ToasterSoundChrome,
  Component: ToasterDemo,
  file: "toaster-demo",
};

/** The examples past the main demo, each behind Preview and Code tabs. */
export const TOASTER_EXAMPLES: Example[] = [
  {
    Chrome: ToasterSoundChrome,
    Component: ToasterAsync,
    description:
      "`onToast` can await real work. The lever stays down until it settles: a resolved title pops as a success, and a rejection pops its message as an error, every second save here. Stop aborts `signal`.",
    file: "toaster-async",
    title: "Async work",
  },
];

/** The parts' API on `/lab/toast`: only the props each part adds. */
export const TOASTER_API: ApiPart[] = [
  {
    description:
      "Holds the cycle, the slice and the browning level. The slice is a toast in your `toaster`.",
    extends: { name: "div" },
    name: "Toaster",
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
        type: "(cycle: ToasterCycle) => ToasterOutcome | void | Promise<ToasterOutcome | void>",
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
        type: "(level: ToasterLevel) => void",
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
    name: "ToasterCycle",
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
    name: "ToasterStage",
    props: [],
  },
  {
    description:
      "The front slot, where the slice stands. Pull the slice up to take it out, and a fresh one drops in.",
    extends: { href: `${UI_SDK}/toast`, name: "UI SDK ToastRegion" },
    name: "ToasterSlot",
    props: [],
  },
  {
    description: "The browning dial. Drag up or down, or use the arrow keys.",
    extends: { href: `${UI_SDK}/slider`, name: "UI SDK Slider" },
    name: "ToasterDial",
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
    name: "ToasterLever",
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
    name: "ToasterStop",
    props: [],
  },
  {
    description:
      "Plays the toaster's recorded sounds while the page-wide sound setting is on. It renders nothing, and loads nothing until the page is pressed. Import it from `toaster-sound`.",
    name: "ToasterAudio",
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
      "Turns the page-wide sound setting on and off, for every `ToasterAudio`. It works anywhere, inside a toaster or not.",
    extends: { href: `${UI_SDK}/toggle`, name: "UI SDK Toggle" },
    name: "ToasterSound",
    props: [],
  },
  {
    description:
      "The page-wide sound setting that `ToasterAudio` follows and `ToasterSound` turns. It starts on; set it from your own control or a stored preference.",
    name: "toasterSoundSetting",
    nameLabel: "Member",
    props: [
      {
        description: "Whether toasters play their sounds.",
        name: "isEnabled",
        type: "() => boolean",
      },
      {
        description:
          "Turns the sounds on or off. Turned on during a press, they unlock at once.",
        name: "setEnabled",
        type: "(enabled: boolean) => void",
      },
      {
        description:
          "Calls `listener` on each change. Returns the unsubscribe.",
        name: "subscribe",
        type: "(listener: () => void) => () => void",
      },
    ],
  },
  {
    description:
      "Follows what the toaster does as it happens, as `ToasterAudio` does: the lever, the dial, Stop, each pop and each slice.",
    name: "useToasterEvents",
    nameLabel: "Returns",
    props: [
      {
        description:
          "Calls `listener` with each event. Returns the unsubscribe.",
        name: "subscribe",
        type: "(listener: (event: ToasterEvent) => void) => () => void",
      },
    ],
  },
];
