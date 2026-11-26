import type { RadioEvent } from "./radio-events";
import { KEY } from "./radio-frame";

export const OFF_KEY = 0;

export type RadioKnob = "tuning" | "volume";

export interface Pose {
  keys: number[];
  lamps: number[];
  tuning: number;
  volume: number;
}

interface Spring {
  target: number;
  value: number;
  velocity: number;
}

interface SpringConfig {
  damping: number;
  stiffness: number;
}

interface Knob {
  hand: number;
  handTime: number;
  held: boolean;
  spring: Spring;
}

const LATCHED = KEY.latched / KEY.touch;
const BOTTOM = 0.985;
const KEY_PUSH: SpringConfig = { damping: 84, stiffness: 2600 };
const KEY_RETURN: SpringConfig = { damping: 34, stiffness: 1500 };
const KEY_BOUNCE = 0.22;
const KEY_REST_SPEED = 0.6;
const KEY_HEARD = 2;
const KNOB_TURN: SpringConfig = { damping: 22, stiffness: 320 };
const LAMP_ON_S = 0.09;
const LAMP_OFF_S = 0.16;
const STALE_HAND_MS = 100;
const KNOB_HEARD = 0.05;
const MAX_STEP_S = 1 / 240;
const REST = 1e-4;

const settled = (spring: Spring) =>
  Math.abs(spring.value - spring.target) < REST &&
  Math.abs(spring.velocity) < REST;

const snap = (spring: Spring) => {
  spring.value = spring.target;
  spring.velocity = 0;
};

const pull = (spring: Spring, config: SpringConfig, dt: number) => {
  const force =
    -config.stiffness * (spring.value - spring.target) -
    config.damping * spring.velocity;
  spring.velocity += force * dt;
  spring.value += spring.velocity * dt;
};

const spring = (value: number): Spring => ({
  target: value,
  value,
  velocity: 0,
});

const knob = (value: number): Knob => ({
  hand: value,
  handTime: 0,
  held: false,
  spring: spring(value),
});

export const keyOf = (band: number | null) =>
  band === null ? OFF_KEY : band + 1;

export interface Rig {
  dispose: () => void;
  holdKnob: (name: RadioKnob, value: number) => void;
  invalidate: () => void;
  place: (band: number | null) => void;
  releaseKnob: (name: RadioKnob) => void;
  setBand: (band: number | null) => void;
  setBands: (count: number) => void;
  setKey: (key: number, pressed: boolean) => void;
  setKnob: (name: RadioKnob, value: number) => void;
  setReducedMotion: (reduced: boolean) => void;
  readonly pose: Pose;
}

export const createRig = (
  draw: (pose: Pose) => void,
  options: {
    emit: (event: RadioEvent) => void;
    tuning: number;
    volume: number;
  }
): Rig => {
  const { emit } = options;
  let keys = [spring(0)];
  let pressed = [false];
  let dipping = [false];
  let lamps: number[] = [];
  const knobs = {
    tuning: knob(options.tuning),
    volume: knob(options.volume),
  };

  let band: number | null = null;
  let wanted: number | null = null;
  let reduced = false;
  let frame = 0;
  let last = 0;

  const pose: Pose = {
    keys: [0],
    lamps: [],
    tuning: options.tuning,
    volume: options.volume,
  };

  const inRange = (next: number | null) =>
    next !== null && next < lamps.length ? next : null;

  const aim = () => {
    for (let index = 0; index < keys.length; index += 1) {
      const down = pressed[index] || dipping[index];
      const caught = band !== null && index === band + 1;
      let target = 0;
      if (down) {
        target = 1;
      } else if (caught) {
        target = LATCHED;
      }
      keys[index].target = target;
    }
  };

  const commit = () => {
    if (band !== null) {
      emit({ key: band + 1, type: "release" });
    }
    band = wanted;
    if (band !== null) {
      emit({ key: band + 1, type: "latch" });
    }
    emit({ band, type: "band" });
  };

  const stepKey = (index: number, dt: number) => {
    const key = keys[index];
    const rising = key.target < key.value;
    pull(key, rising ? KEY_RETURN : KEY_PUSH, dt);
    if (key.value < 0) {
      key.value = 0;
      const speed = -key.velocity;
      key.velocity = speed > KEY_REST_SPEED ? speed * KEY_BOUNCE : 0;
      if (speed > KEY_HEARD) {
        emit({ key: index, speed, type: "key-stop" });
      }
    }
    if (key.value > 1) {
      key.value = 1;
      if (key.velocity > KEY_HEARD) {
        emit({ key: index, speed: key.velocity, type: "key-bottom" });
      }
      key.velocity = 0;
    }
    if (dipping[index] && key.value >= BOTTOM) {
      dipping[index] = false;
    }
  };

  const stepLamps = (dt: number) => {
    for (let index = 0; index < lamps.length; index += 1) {
      const on = band === index;
      const rate = dt / (on ? LAMP_ON_S : LAMP_OFF_S);
      lamps[index] = on
        ? Math.min(1, lamps[index] + rate)
        : Math.max(0, lamps[index] - rate);
    }
  };

  const step = (dt: number) => {
    aim();
    for (let index = 0; index < keys.length; index += 1) {
      stepKey(index, dt);
    }
    if (wanted !== band && keys[keyOf(wanted)].value >= LATCHED) {
      commit();
    }
    stepLamps(dt);
    for (const each of Object.values(knobs)) {
      if (!each.held) {
        pull(each.spring, KNOB_TURN, dt);
      }
    }
  };

  const snapAll = () => {
    if (wanted !== band) {
      commit();
    }
    dipping.fill(false);
    aim();
    for (const key of keys) {
      snap(key);
    }
    stepLamps(Number.POSITIVE_INFINITY);
    for (const each of Object.values(knobs)) {
      if (!each.held) {
        snap(each.spring);
      }
    }
  };

  const rest = () => {
    for (const key of keys) {
      if (settled(key)) {
        snap(key);
      }
    }
    for (const each of Object.values(knobs)) {
      if (!each.held && settled(each.spring)) {
        snap(each.spring);
      }
    }
  };

  const still = () =>
    wanted === band &&
    !dipping.includes(true) &&
    keys.every(settled) &&
    lamps.every((lamp, index) => lamp === (band === index ? 1 : 0)) &&
    Object.values(knobs).every((each) => each.held || settled(each.spring));

  const publish = () => {
    for (let index = 0; index < keys.length; index += 1) {
      pose.keys[index] = keys[index].value;
    }
    for (let index = 0; index < lamps.length; index += 1) {
      pose.lamps[index] = lamps[index];
    }
    for (const name of ["tuning", "volume"] as const) {
      const { value } = knobs[name].spring;
      if (value !== pose[name]) {
        pose[name] = value;
        emit({ type: name, value });
      }
    }
    draw(pose);
  };

  const hear = () => {
    for (const name of ["tuning", "volume"] as const) {
      const each = knobs[name];
      if (!each.held && Math.abs(each.spring.velocity) > KNOB_HEARD) {
        emit({ speed: each.spring.velocity, type: `${name}-turn` });
      }
    }
  };

  const tick = (now: number) => {
    frame = 0;
    const elapsed = Math.min((now - last) / 1000, 1 / 20);
    last = now;
    if (reduced) {
      snapAll();
    } else {
      let left = elapsed;
      while (left > 0) {
        const dt = Math.min(left, MAX_STEP_S);
        step(dt);
        left -= dt;
      }
    }
    rest();
    hear();
    publish();
    if (!still()) {
      frame = requestAnimationFrame(tick);
    }
  };

  const wake = () => {
    if (frame === 0) {
      last = performance.now();
      frame = requestAnimationFrame(tick);
    }
  };

  return {
    dispose: () => {
      cancelAnimationFrame(frame);
      frame = 0;
    },
    holdKnob: (name, value) => {
      const each = knobs[name];
      const now = performance.now();
      const dt = (now - each.handTime) / 1000;
      each.spring.velocity =
        dt > 0 && dt * 1000 < STALE_HAND_MS ? (value - each.hand) / dt : 0;
      each.held = true;
      each.spring.value = value;
      each.spring.target = value;
      each.hand = value;
      each.handTime = now;
      emit({ speed: each.spring.velocity, type: `${name}-turn` });
      wake();
    },
    invalidate: wake,
    place: (placed) => {
      const next = inRange(placed);
      band = next;
      wanted = next;
      emit({ band, type: "band" });
      emit({ type: "tuning", value: knobs.tuning.spring.value });
      emit({ type: "volume", value: knobs.volume.spring.value });
      dipping.fill(false);
      aim();
      for (const key of keys) {
        snap(key);
      }
      stepLamps(Number.POSITIVE_INFINITY);
      wake();
    },
    pose,
    releaseKnob: (name) => {
      knobs[name].held = false;
      knobs[name].spring.velocity = 0;
      wake();
    },
    setBand: (asked) => {
      const next = inRange(asked);
      if (next === wanted) {
        return;
      }
      wanted = next;
      const key = keyOf(next);
      dipping.fill(false);
      if (!pressed[key] && keys[key].value < LATCHED) {
        dipping[key] = true;
      }
      wake();
    },
    setBands: (count) => {
      if (count === lamps.length) {
        return;
      }
      const kept = keys;
      keys = Array.from(
        { length: count + 1 },
        (_, index) => kept[index] ?? spring(0)
      );
      pressed = keys.map((_, index) => pressed[index] ?? false);
      dipping = keys.map(() => false);
      lamps = Array.from({ length: count }, (_, index) => lamps[index] ?? 0);
      pose.keys = keys.map((key) => key.value);
      pose.lamps = [...lamps];
      if (band !== null && band >= count) {
        band = null;
        emit({ band, type: "band" });
      }
      if (wanted !== null && wanted >= count) {
        wanted = null;
      }
      wake();
    },
    setKey: (key, down) => {
      if (key < keys.length) {
        pressed[key] = down;
        wake();
      }
    },
    setKnob: (name, value) => {
      knobs[name].spring.target = value;
      wake();
    },
    setReducedMotion: (value) => {
      reduced = value;
    },
  };
};
