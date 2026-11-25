import type { CarouselEvent } from "./carousel-events";

export interface Pose {
  focus: number;
  forward: number;
  gate: GatePose;
  reverse: number;
  shutter: number;
  timer: number;
  tray: number;
}

export interface GatePose {
  drop: number;
  slot: number;
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

type Phase = "dropping" | "lifting" | "opening" | "showing" | "turning";

const TRAY_TURN: SpringConfig = { damping: 41, stiffness: 420 };
const TRAY_MAX_SPEED = 110;
const TRAY_DETENT = { offset: 0.02, speed: 1.5 };
const SLIDE_LIFT: SpringConfig = { damping: 72, stiffness: 1296 };
const KEY_PRESS: SpringConfig = { damping: 95, stiffness: 2200 };
const TIMER_SLIDE: SpringConfig = { damping: 44, stiffness: 620 };
const FOCUS_TURN: SpringConfig = { damping: 22, stiffness: 320 };

const GRAVITY = 196;
const SLIDE_BOUNCE = 0.18;
const SLIDE_REST_SPEED = 1.2;
const LIFTED = 0.03;
const SHUTTER_OPEN_S = 0.035;
const STALE_HAND_MS = 100;
const FOCUS_HEARD = 0.05;
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

export interface Rig {
  dispose: () => void;
  goTo: (slot: number) => void;
  holdFocus: (focus: number) => void;
  invalidate: () => void;
  place: (slot: number) => void;
  releaseFocus: () => void;
  setFocus: (focus: number) => void;
  setKey: (key: "forward" | "reverse", pressed: boolean) => void;
  setReady: (ready: boolean) => void;
  setReducedMotion: (reduced: boolean) => void;
  setTimer: (on: boolean) => void;
  readonly pose: Pose;
}

export const createRig = (
  draw: (pose: Pose) => void,
  options: { emit: (event: CarouselEvent) => void; focus: number }
): Rig => {
  const { emit } = options;
  const tray = spring(0);
  const drop = spring(1);
  const forward = spring(0);
  const reverse = spring(0);
  const timer = spring(0);
  const focus = spring(options.focus);
  let focusHeld = false;
  let handAt = options.focus;
  let handTime = 0;

  let phase: Phase = "showing";
  let ready = true;
  let shutter = 0;
  let landed = true;
  const gate: GatePose = { drop: 1, slot: 0 };

  let reduced = false;
  let frame = 0;
  let last = 0;

  const pose: Pose = {
    focus: focus.value,
    forward: 0,
    gate,
    reverse: 0,
    shutter: 0,
    timer: 0,
    tray: 0,
  };

  const shut = () => {
    if (phase === "showing" || phase === "opening") {
      emit({ open: false, type: "shutter" });
    }
  };

  const shutterTarget = () =>
    phase === "showing" || (phase === "opening" && ready) ? 0 : 1;

  const stepShutter = (dt: number) => {
    shutter =
      shutterTarget() === 1 ? 1 : Math.max(0, shutter - dt / SHUTTER_OPEN_S);
    if (phase === "opening" && ready && shutter === 0) {
      phase = "showing";
      emit({ open: true, type: "shutter" });
    }
  };

  const stepLift = (dt: number) => {
    drop.target = 0;
    pull(drop, SLIDE_LIFT, dt);
    if (drop.value > LIFTED) {
      return;
    }
    drop.value = 0;
    drop.velocity = 0;
    phase = "turning";
    emit({ slots: tray.target - tray.value, type: "tray-turn" });
  };

  const stepTurn = (dt: number) => {
    const from = tray.value;
    pull(tray, TRAY_TURN, dt);
    const over = Math.abs(tray.velocity) - TRAY_MAX_SPEED;
    if (over > 0) {
      tray.value -= Math.sign(tray.velocity) * over * dt;
      tray.velocity = Math.sign(tray.velocity) * TRAY_MAX_SPEED;
    }
    const passed =
      tray.value > from
        ? Math.floor(tray.value) > Math.floor(from)
        : Math.ceil(tray.value) < Math.ceil(from);
    if (passed) {
      emit({ speed: tray.velocity, type: "tray-click" });
    }
    const home =
      Math.abs(tray.value - tray.target) < TRAY_DETENT.offset &&
      Math.abs(tray.velocity) < TRAY_DETENT.speed;
    if (!home) {
      return;
    }
    snap(tray);
    gate.slot = tray.value;
    landed = false;
    phase = "dropping";
    emit({ type: "tray-stop" });
  };

  const stepDrop = (dt: number) => {
    drop.velocity += GRAVITY * dt;
    drop.value += drop.velocity * dt;
    if (drop.value < 1) {
      return;
    }
    if (!landed) {
      landed = true;
      emit({ type: "slide-drop" });
    }
    drop.value = 1;
    if (drop.velocity > SLIDE_REST_SPEED) {
      drop.velocity *= -SLIDE_BOUNCE;
      return;
    }
    drop.velocity = 0;
    phase = "opening";
  };

  const step = (dt: number) => {
    if (phase === "lifting") {
      stepLift(dt);
    } else if (phase === "turning") {
      stepTurn(dt);
    } else if (phase === "dropping") {
      stepDrop(dt);
    }
    stepShutter(dt);
    pull(forward, KEY_PRESS, dt);
    pull(reverse, KEY_PRESS, dt);
    pull(timer, TIMER_SLIDE, dt);
    if (!focusHeld) {
      pull(focus, FOCUS_TURN, dt);
    }
  };

  const snapAll = () => {
    if (phase !== "showing") {
      snap(tray);
      gate.slot = tray.value;
      drop.value = 1;
      drop.velocity = 0;
      landed = true;
      phase = "opening";
    }
    stepShutter(Number.POSITIVE_INFINITY);
    for (const each of [forward, reverse, timer]) {
      snap(each);
    }
    if (!focusHeld) {
      snap(focus);
    }
  };

  const rest = () => {
    for (const each of [forward, reverse, timer]) {
      if (settled(each)) {
        snap(each);
      }
    }
    if (!focusHeld && settled(focus)) {
      snap(focus);
    }
  };

  const still = () =>
    (phase === "showing" || (phase === "opening" && !ready)) &&
    shutter === shutterTarget() &&
    settled(forward) &&
    settled(reverse) &&
    settled(timer) &&
    (focusHeld || settled(focus));

  const publish = () => {
    pose.tray = tray.value;
    gate.drop = drop.value;
    pose.shutter = shutter;
    pose.forward = forward.value;
    pose.reverse = reverse.value;
    pose.timer = timer.value;
    pose.focus = focus.value;
    draw(pose);
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
    if (!focusHeld && Math.abs(focus.velocity) > FOCUS_HEARD) {
      emit({ speed: focus.velocity, type: "focus-turn" });
    }
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
    goTo: (slot) => {
      if (slot === tray.target) {
        return;
      }
      tray.target = slot;
      shut();
      shutter = 1;
      if (phase === "turning") {
        emit({ slots: slot - tray.value, type: "tray-turn" });
      } else if (phase !== "lifting") {
        phase = "lifting";
        drop.velocity = 0;
        emit({ type: "slide-lift" });
      }
      wake();
    },
    holdFocus: (value) => {
      const now = performance.now();
      const dt = (now - handTime) / 1000;
      focus.velocity =
        dt > 0 && dt * 1000 < STALE_HAND_MS ? (value - handAt) / dt : 0;
      focusHeld = true;
      focus.value = value;
      focus.target = value;
      handAt = value;
      handTime = now;
      emit({ speed: focus.velocity, type: "focus-turn" });
      wake();
    },
    invalidate: wake,
    place: (slot) => {
      tray.target = slot;
      snap(tray);
      gate.slot = slot;
      drop.value = 1;
      drop.velocity = 0;
      landed = true;
      phase = "showing";
      shutter = 0;
      wake();
    },
    pose,
    releaseFocus: () => {
      focusHeld = false;
      focus.velocity = 0;
      wake();
    },
    setFocus: (value) => {
      focus.target = value;
      wake();
    },
    setKey: (key, pressed) => {
      (key === "forward" ? forward : reverse).target = pressed ? 1 : 0;
      wake();
    },
    setReady: (value) => {
      ready = value;
      wake();
    },
    setReducedMotion: (value) => {
      reduced = value;
    },
    setTimer: (on) => {
      timer.target = on ? 1 : 0;
      wake();
    },
  };
};
