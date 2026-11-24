import type { ToasterEvent } from "./toaster-events";

export interface Pose {
  dial: number;
  heat: number;
  lever: number;
  slice: SlicePose;
  stop: number;
}

export interface SlicePose {
  browning: number;
  drop: number;
  lift: number;
  opacity: number;
  present: boolean;
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

export const DIAL_ANGLES = [
  Math.PI,
  (3 * Math.PI) / 4,
  Math.PI / 2,
  Math.PI / 4,
  0,
] as const;

const LEVER_RETURN: SpringConfig = { damping: 15, stiffness: 140 };
const LEVER_CATCH: SpringConfig = { damping: 3, stiffness: 60 };
const LEVER_PRELOAD = 0.3;
const CATCH_PRELOAD = 0.4;
const STALE_HAND_MS = 100;
const LEVER_REST_SPEED = 0.5;
const DIAL_TURN: SpringConfig = { damping: 22, stiffness: 320 };
const STOP_PRESS: SpringConfig = { damping: 95, stiffness: 2200 };
const SLICE_SINK: SpringConfig = { damping: 26, stiffness: 170 };
const SLICE_SETTLE: SpringConfig = { damping: 32, stiffness: 420 };

const GRAVITY = 48;
const LEVER_BOUNCE = 0.18;
const SLICE_BOUNCE = 0.25;
const HEAT_RISE_S = 0.45;
const HEAT_FALL_S = 0.6;
const HEAT_REST = 0.02;
const EXIT_FADE_S = 0.26;
const EXIT_SPEED_MIN = 0.35;
const EXIT_SPEED_MAX = 0.8;
const EXIT_ACCELERATION = 1.5;
const DROP_HEIGHT = 0.55;
const ENTER_FADE_S = 0.16;
const HEIGHTS_PER_TRAVEL = 100;
const REDUCED_STRIKE_SPEED = 1;
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

const handSpeed = (at: number, previous: number, since: number) => {
  const now = performance.now();
  const dt = (now - since) / 1000;
  return { now, speed: dt > 0 && dt < 0.1 ? (at - previous) / dt : 0 };
};

type Exit = "down" | "up" | null;
type LeverEnd = "bottom" | "top" | null;

export interface Rig {
  catchLever: () => void;
  dispose: () => void;
  holdLever: (travel: number) => void;
  invalidate: () => void;
  releaseLever: () => void;
  insertSlice: (browning: number) => void;
  dropSlice: (browning: number) => void;
  placeSlice: (browning: number) => void;
  removeSlice: (way: "down" | "up") => void;
  setBrowning: (browning: number) => void;
  setDial: (angle: number) => void;
  setHeat: (on: boolean) => void;
  setLift: (lift: number | null) => void;
  setReducedMotion: (reduced: boolean) => void;
  setStop: (pressed: boolean) => void;
  readonly pose: Pose;
}

export const createRig = (
  draw: (pose: Pose) => void,
  options: { dial: number; emit: (event: ToasterEvent) => void }
): Rig => {
  const lever = spring(0);
  let leverHeld = false;
  let leverConfig = LEVER_RETURN;
  let handAt = 0;
  let handTime = 0;
  let against: LeverEnd = "top";

  const dial = spring(options.dial);
  const stop = spring(0);
  const heat = spring(0);

  const drop = spring(0);
  const lift = spring(0);
  let liftHeld = false;
  let liftAt = 0;
  let liftTime = 0;
  let exit: Exit = null;
  let incoming: number | null = null;
  let falling = false;
  const slice: SlicePose = {
    browning: 0,
    drop: 0,
    lift: 0,
    opacity: 1,
    present: false,
  };

  let reduced = false;
  let frame = 0;
  let last = 0;

  const pose: Pose = {
    dial: dial.value,
    heat: 0,
    lever: 0,
    slice,
    stop: 0,
  };

  const strike = (end: "bottom" | "top", velocity: number) => {
    if (against === end) {
      return;
    }
    against = end;
    options.emit(
      end === "bottom"
        ? { type: "lever-catch" }
        : { speed: -velocity * HEIGHTS_PER_TRAVEL, type: "lever-top" }
    );
  };

  const stepLever = (dt: number) => {
    if (leverHeld) {
      return;
    }
    pull(lever, leverConfig, dt);
    if (lever.value >= 0 && lever.value <= 1) {
      if (lever.value > 0 && lever.value < 1) {
        against = null;
      }
      return;
    }
    const caught = lever.value > 1;
    strike(caught ? "bottom" : "top", lever.velocity);
    lever.value = caught ? 1 : 0;
    lever.velocity =
      caught || Math.abs(lever.velocity) < LEVER_REST_SPEED
        ? 0
        : -lever.velocity * LEVER_BOUNCE;
  };

  const leverStill = () =>
    leverHeld ||
    settled(lever) ||
    (lever.velocity === 0 &&
      ((lever.value === 0 && lever.target < 0) ||
        (lever.value === 1 && lever.target > 1)));

  const stepSlice = (dt: number) => {
    if (exit === "down") {
      pull(drop, SLICE_SINK, dt);
      return;
    }
    if ((leverHeld || leverConfig === LEVER_CATCH) && !falling) {
      drop.value = lever.value;
      drop.velocity = lever.velocity;
      return;
    }
    drop.velocity += GRAVITY * dt;
    drop.value += drop.velocity * dt;
    if (drop.value >= lever.value) {
      falling = false;
      const landing = drop.velocity - lever.velocity;
      drop.value = lever.value;
      drop.velocity =
        landing > 1 ? lever.velocity - landing * SLICE_BOUNCE : lever.velocity;
    }
  };

  const stepLift = (dt: number) => {
    if (exit === "up") {
      lift.velocity += EXIT_ACCELERATION * dt;
      lift.value += lift.velocity * dt;
      slice.opacity = Math.max(0, slice.opacity - dt / EXIT_FADE_S);
      return;
    }
    slice.opacity = Math.min(1, slice.opacity + dt / ENTER_FADE_S);
    if (!liftHeld) {
      pull(lift, SLICE_SETTLE, dt);
    }
  };

  const stepHeat = (dt: number) => {
    const tau = heat.target > heat.value ? HEAT_RISE_S : HEAT_FALL_S;
    heat.value += (heat.target - heat.value) * (1 - Math.exp(-dt / tau));
    if (Math.abs(heat.target - heat.value) < HEAT_REST) {
      heat.value = heat.target;
    }
  };

  const settle = (browning: number, at: number) => {
    incoming = null;
    exit = null;
    falling = false;
    slice.present = true;
    slice.opacity = 1;
    slice.browning = browning;
    drop.value = at;
    drop.velocity = 0;
    lift.value = 0;
    lift.velocity = 0;
    lift.target = 0;
    liftHeld = false;
  };

  const placeIncoming = () => {
    if (incoming === null || lever.value < 1 - REST) {
      return;
    }
    settle(incoming, 1);
  };

  const step = (dt: number) => {
    stepLever(dt);
    placeIncoming();
    if (slice.present) {
      stepSlice(dt);
      stepLift(dt);
    }
    pull(dial, DIAL_TURN, dt);
    pull(stop, STOP_PRESS, dt);
    stepHeat(dt);
  };

  const snapAll = () => {
    if (!leverHeld) {
      lever.value = Math.min(1, Math.max(0, lever.target));
      lever.velocity = 0;
      if (lever.value === 1) {
        strike("bottom", REDUCED_STRIKE_SPEED);
      } else if (lever.value === 0) {
        strike("top", -REDUCED_STRIKE_SPEED);
      }
    }
    drop.value = exit === "down" ? 1 : lever.value;
    drop.velocity = 0;
    falling = false;
    if (exit === null) {
      slice.opacity = 1;
    }
    if (!liftHeld) {
      snap(lift);
    }
    snap(dial);
    snap(stop);
  };

  const finishExit = () => {
    const gone =
      (exit === "up" && slice.opacity <= 0) ||
      (exit === "down" && drop.value > 0.99);
    if (gone) {
      slice.present = false;
      exit = null;
    }
  };

  const rest = () => {
    for (const each of [dial, stop]) {
      if (settled(each)) {
        snap(each);
      }
    }
    if (!leverHeld && settled(lever)) {
      snap(lever);
    }
    if (!liftHeld && exit === null && settled(lift)) {
      snap(lift);
    }
  };

  const still = () =>
    incoming === null &&
    leverStill() &&
    (!slice.present ||
      (exit === null &&
        slice.opacity === 1 &&
        Math.abs(drop.value - lever.value) < REST &&
        Math.abs(drop.velocity) < REST &&
        (liftHeld || settled(lift)))) &&
    settled(dial) &&
    settled(stop) &&
    heat.value === heat.target;

  const publish = () => {
    pose.lever = lever.value;
    pose.dial = dial.value;
    pose.stop = stop.value;
    pose.heat = heat.value;
    slice.drop = drop.value;
    slice.lift = lift.value;
    draw(pose);
  };

  const tick = (now: number) => {
    frame = 0;
    const elapsed = Math.min((now - last) / 1000, 1 / 20);
    last = now;
    if (reduced) {
      snapAll();
      placeIncoming();
      stepHeat(elapsed);
      if (exit === "up") {
        slice.opacity = 0;
      }
    } else {
      let left = elapsed;
      while (left > 0) {
        const dt = Math.min(left, MAX_STEP_S);
        step(dt);
        left -= dt;
      }
    }
    rest();
    finishExit();
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

  const letGo = (config: SpringConfig, target: number) => {
    if (leverHeld && performance.now() - handTime > STALE_HAND_MS) {
      lever.velocity = 0;
    }
    leverHeld = false;
    leverConfig = config;
    lever.target = target;
    wake();
  };

  return {
    catchLever: () => {
      letGo(LEVER_CATCH, 1 + CATCH_PRELOAD);
    },
    dispose: () => {
      cancelAnimationFrame(frame);
      frame = 0;
    },
    dropSlice: (browning) => {
      settle(browning, -DROP_HEIGHT);
      slice.opacity = 0;
      falling = true;
      wake();
    },
    holdLever: (travel) => {
      const { now, speed } = handSpeed(travel, handAt, handTime);
      against = travel <= 0 ? "top" : null;
      leverHeld = true;
      lever.velocity = speed;
      lever.value = travel;
      lever.target = travel;
      handAt = travel;
      handTime = now;
      wake();
    },
    insertSlice: (browning) => {
      slice.present = false;
      exit = null;
      incoming = browning;
      wake();
    },
    invalidate: wake,
    placeSlice: (browning) => {
      settle(browning, lever.value);
      drop.velocity = lever.velocity;
      wake();
    },
    pose,
    releaseLever: () => {
      letGo(LEVER_RETURN, -LEVER_PRELOAD);
    },
    removeSlice: (way) => {
      if (!slice.present) {
        return;
      }
      exit = way;
      liftHeld = false;
      if (way === "down") {
        drop.target = 1;
      } else {
        lift.velocity = Math.min(
          EXIT_SPEED_MAX,
          Math.max(lift.velocity, EXIT_SPEED_MIN)
        );
      }
      wake();
    },
    setBrowning: (browning) => {
      slice.browning = browning;
      wake();
    },
    setDial: (angle) => {
      dial.target = angle;
      wake();
    },
    setHeat: (on) => {
      heat.target = on ? 1 : 0;
      wake();
    },
    setLift: (value) => {
      if (exit !== null) {
        return;
      }
      if (value === null) {
        liftHeld = false;
      } else {
        const { now, speed } = handSpeed(value, liftAt, liftTime);
        liftHeld = true;
        lift.value = value;
        lift.velocity = speed;
        liftAt = value;
        liftTime = now;
      }
      wake();
    },
    setReducedMotion: (value) => {
      reduced = value;
    },
    setStop: (pressed) => {
      stop.target = pressed ? 1 : 0;
      wake();
    },
  };
};
