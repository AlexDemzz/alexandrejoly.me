import { RadioControlled } from "@/components/demos/radio-controlled";
import { RadioDemo } from "@/components/demos/radio-demo";
import { RadioForm } from "@/components/demos/radio-form";
import { RadioStations } from "@/components/demos/radio-stations";
import type { ApiPart, Demo, Example } from "@/components/docs/registry-docs";
import { RadioSoundChrome } from "@/lab/radio/sound-chrome";

const UI_SDK = "https://ui-sdk.dev/docs/react/components";

/** The main demo, under the title: the radio at full size, with its sound on. */
export const RADIO_DEMO: Demo = {
  Chrome: RadioSoundChrome,
  Component: RadioDemo,
  file: "radio-demo",
};

/** The examples past the main demo, each behind Preview and Code tabs. */
export const RADIO_EXAMPLES: Example[] = [
  {
    Chrome: RadioSoundChrome,
    Component: RadioStations,
    description:
      "Give a `RadioGroupItem` a `src` and its key plays it. `position` places its station on the dial, from 0 to 100: turn the tuning knob away and the station fades into the static. The keys share the row, so the radio takes from one to six of them.",
    file: "radio-stations",
    title: "Stations",
  },
  {
    Chrome: RadioSoundChrome,
    Component: RadioControlled,
    description:
      "Set `value` to choose a key from your own code, and `null` to switch the radio off. Here each button asks for its station, and its key latches down. The keys still work by hand, and `onValueChange` reports every change with its reason.",
    file: "radio-controlled",
    title: "Controlled",
  },
  {
    Chrome: RadioSoundChrome,
    Component: RadioForm,
    description:
      "The keys are a real radio group. Give `RadioGroup` a `name` and the latched key's value submits with the form, and `required` blocks it while the radio is off.",
    file: "radio-form",
    title: "Form",
  },
];

/** The parts' API on `/lab/literal-ui/radio`: only the props each part adds. */
export const RADIO_API: ApiPart[] = [
  {
    description:
      "Holds the chosen key, the volume and the tuning. No key down means off: the value is `null`.",
    extends: { name: "div" },
    name: "Radio",
    props: [
      {
        description:
          "The key that starts latched down. Without it the radio starts off.",
        name: "defaultValue",
        type: "string | null",
      },
      {
        description: "The latched key, controlled. `null` switches it off.",
        name: "value",
        type: "string | null",
      },
      {
        description:
          "Runs when the key wants to change. `details.reason` says why, and `details.cancel()` keeps the key.",
        name: "onValueChange",
        type: "(value: string | null, details: ChangeDetails) => void",
      },
      {
        default: "35",
        description: "Where the volume knob starts, from 0 to 100.",
        name: "defaultVolume",
        type: "number",
      },
      {
        description: "The volume, controlled.",
        name: "volume",
        type: "number",
      },
      {
        description: "Runs when the volume knob turns.",
        name: "onVolumeChange",
        type: "(volume: number) => void",
      },
      {
        default: "50",
        description:
          "Where the tuning knob starts, from 0 to 100: the pointer's place on the dial.",
        name: "defaultTuning",
        type: "number",
      },
      {
        description: "The tuning, controlled.",
        name: "tuning",
        type: "number",
      },
      {
        description: "Runs when the tuning knob turns.",
        name: "onTuningChange",
        type: "(tuning: number) => void",
      },
    ],
  },
  {
    description:
      "The radio in 3D, with the controls laid over its parts. It shows a still picture of the radio until the scene loads, and keeps it without WebGL 2: the keys still choose. Its keys run left to right in every writing direction, so it sets `dir` to `ltr` and the arrow keys follow the row.",
    extends: { name: "div" },
    name: "RadioStage",
    props: [],
  },
  {
    description:
      "The row of keys, one a `RadioGroupItem`. Name it with `aria-label`. The arrow keys move from key to key once one has focus, and `name`, `required`, `disabled` and `readOnly` work as on any radio group. Its value is the radio's, so it leaves out `value`, `defaultValue`, `onValueChange` and `controller`.",
    extends: { href: `${UI_SDK}/radio`, name: "UI SDK RadioGroup" },
    name: "RadioGroup",
    props: [],
  },
  {
    description:
      "One key, and one scale line on the dial, which lights while the key is down. Its content is the label printed over the key. The row holds from one to six keys, and a seventh is an error.",
    extends: { href: `${UI_SDK}/radio`, name: "UI SDK Radio" },
    name: "RadioGroupItem",
    props: [
      {
        description:
          "What the key's station plays: the URL of an audio file, looped. Without it the key plays the static alone.",
        name: "src",
        type: "string",
      },
      {
        default: "50",
        description:
          "Where the station sits on the dial, from 0 to 100. It comes through whole within 3 of it, and is lost past 10.",
        name: "position",
        type: "number",
      },
    ],
  },
  {
    description:
      "The first key, marked with a ring. Pressing it lets the latched key go and sets the value to `null`.",
    extends: { href: `${UI_SDK}/button`, name: "UI SDK Button" },
    name: "RadioOff",
    props: [
      {
        default: '"Off"',
        description: "Names the key.",
        name: "aria-label",
        type: "string",
      },
    ],
  },
  {
    description:
      "The knob on the left. Drag up or down, or use the arrow keys. Its value and range are the radio's `volume`, so it leaves out `value`, `defaultValue`, `min`, `max` and `orientation`.",
    extends: { href: `${UI_SDK}/slider`, name: "UI SDK Slider" },
    name: "RadioVolume",
    props: [
      {
        default: '"Volume"',
        description: "Names the knob.",
        name: "aria-label",
        type: "string",
      },
    ],
  },
  {
    description:
      "The knob on the right. It makes three turns as the pointer crosses the dial. Its value and range are the radio's `tuning`, so it leaves out `value`, `defaultValue`, `min`, `max` and `orientation`.",
    extends: { href: `${UI_SDK}/slider`, name: "UI SDK Slider" },
    name: "RadioTuning",
    props: [
      {
        default: '"Tuning"',
        description: "Names the knob.",
        name: "aria-label",
        type: "string",
      },
    ],
  },
  {
    description:
      "Plays the radio's recorded sounds, the static between stations, and each key's `src`. It renders nothing, and loads nothing until the page is pressed. Import it from `radio-sound`.",
    name: "RadioAudio",
    props: [
      {
        default: "false",
        description: "Silences this radio alone.",
        name: "muted",
        type: "boolean",
      },
    ],
  },
  {
    description:
      "Mutes every `RadioAudio` inside it, for a sound preference that covers the whole app or one part of it. It renders nothing of its own.",
    name: "RadioAudioProvider",
    props: [
      {
        description:
          "Silences the radios below. Turned off during a press, their sounds unlock at once.",
        name: "muted",
        type: "boolean",
      },
    ],
  },
  {
    description:
      "Follows what the radio does as it happens, as `RadioAudio` does: the keys going down, latching and springing back, the band, the volume and the tuning.",
    name: "useRadioEvents",
    nameLabel: "Returns",
    props: [
      {
        description:
          "Calls `listener` with each event. Returns the unsubscribe.",
        name: "subscribe",
        type: "(listener: (event: RadioEvent) => void) => () => void",
      },
      {
        description:
          "What the radio is doing now: the band, the volume, the tuning and each key's station.",
        name: "state",
        type: "() => RadioState",
      },
    ],
  },
];
