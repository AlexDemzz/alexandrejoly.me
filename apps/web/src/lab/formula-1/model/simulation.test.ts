import { describe, expect, it } from "vitest";

import {
  CLUTCH_OPEN,
  DEPLOY_CAP_MJ,
  ERS_MAX_KW,
  GEAR_TOP_KPH,
  HARVEST_CAP_MJ,
  LAUNCH_LIMITER_RPM,
  RACE_LAPS,
} from "./car";
import { DRS_FIRST_LAP } from "./drs";
import { initialState, toTrack } from "./initial-state";
import { PIT_LIMIT_KPH } from "./ranges";
import { reduce } from "./reducer";
import { MAX_ELAPSED_MS } from "./simulation";
import {
  DRIVER_REACTION_MS,
  GRID_WAIT_MS,
  HOLD_MAX_MS,
  HOLD_MIN_MS,
  LIGHT_INTERVAL_MS,
  holdFor,
} from "./start";
import {
  CORNERS,
  CORNER_APEX_AT,
  DRS_ZONES,
  LAP_LENGTH_M,
  cornerAt,
  cornerProgress,
} from "./track";
import type { WheelAction, WheelButton, WheelState } from "./types";

const FRAME_MS = 20;
const [backZone] = DRS_ZONES;
const [firstCorner] = CORNERS;
/** About one lap of driving. */
const LAP_MS = 95_000;

const started = (): WheelState =>
  reduce(initialState(0), { session: "track", type: "session" });

/** A car mid-race: lights long out, 6th gear at 240 km/h on lap 5. */
const racing = (overrides: Partial<WheelState> = {}): WheelState => ({
  ...toTrack(initialState(0)),
  distanceM: 1100,
  gapAheadS: 0.75,
  gapBehindS: 0.7,
  gear: 6,
  lapTrace: [0],
  rpm: 11_000,
  speedKph: 240,
  start: { elapsedMs: 60_000, kind: "go" },
  throttle: 1,
  timing: { ...toTrack(initialState(0)).timing, lap: 5 },
  tyreTempsC: { fl: 95, fr: 95, rl: 95, rr: 95 },
  ...overrides,
});

const apply = (state: WheelState, ...actions: WheelAction[]): WheelState => {
  let next = state;
  for (const action of actions) {
    next = reduce(next, action);
  }
  return next;
};

const run = (
  state: WheelState,
  ms: number,
  each?: (state: WheelState) => void
): WheelState => {
  let next = state;
  for (let elapsed = 0; elapsed < ms; elapsed += FRAME_MS) {
    next = reduce(next, { now: next.now + FRAME_MS, type: "tick" });
    each?.(next);
  }
  return next;
};

/** Ticks until the lights go out, returning the last state before and the first after. */
const untilLightsOut = (state: WheelState): [WheelState, WheelState] => {
  let before = state;
  let next = state;
  while (next.start.kind !== "go") {
    before = next;
    next = reduce(next, { now: next.now + FRAME_MS, type: "tick" });
  }
  return [before, next];
};

const press = (button: WheelButton): WheelAction => ({ button, type: "press" });
const release = (button: WheelButton): WheelAction => ({
  button,
  type: "release",
});
const up: WheelAction = { paddle: "upshift", type: "paddle" };
const down: WheelAction = { paddle: "downshift", type: "paddle" };

const atDetection = (gapAheadS: number, lap = 5): WheelState =>
  racing({
    distanceM: backZone.detectionM - 5,
    gapAheadS,
    timing: { ...racing().timing, lap },
  });

const straight = (overrides: Partial<WheelState> = {}): WheelState =>
  racing({
    deployedThisLapMJ: 0,
    distanceM: backZone.startM + 1,
    socMJ: 3,
    speedKph: 200,
    ...overrides,
  });

const exitSpeed = (gear: 3 | 7): number =>
  run(
    racing({ distanceM: 950, gear, gearControl: "manual", speedKph: 95 }),
    1000
  ).speedKph;

const secondLapMs = (state: WheelState): number | null => {
  let time: number | null = null;
  run(state, LAP_MS * 2, (next) => {
    time ??= next.timing.lapTimesMs.at(1) ?? null;
  });
  return time;
};

type Pedal = "brake" | "throttle" | "none";

const pedalOf = (state: WheelState): Pedal => {
  if (state.brake > 0) {
    return "brake";
  }
  return state.throttle > 0 ? "throttle" : "none";
};

/** One full flying lap of the hidden driver, every frame, after a warm-up lap. */
const LAP_FRAMES: readonly WheelState[] = (() => {
  const frames: WheelState[] = [];
  const flyingLap = racing().timing.lap + 1;
  run(racing(), LAP_MS * 2, (state) => {
    if (state.timing.lap === flyingLap) {
      frames.push(state);
    }
  });
  return frames;
})();

describe("the hidden driver in corners", () => {
  it("records a whole lap", () => {
    expect(LAP_FRAMES.at(-1)?.distanceM).toBeGreaterThan(LAP_LENGTH_M - 100);
  });

  it("changes pedal at most once in each corner", () => {
    for (const corner of CORNERS) {
      const inside = LAP_FRAMES.filter(
        (state) => cornerAt(state.distanceM) === corner
      );
      const pedals = inside.map(pedalOf).filter((pedal) => pedal !== "none");
      const changes = pedals.filter(
        (pedal, index) => index > 0 && pedal !== pedals[index - 1]
      );
      expect(changes.length, corner.name).toBeLessThanOrEqual(1);
    }
  });

  it("only lets the brake off in a corner, never puts it on", () => {
    for (const [index, state] of LAP_FRAMES.entries()) {
      const before = LAP_FRAMES[index - 1];
      const corner = cornerAt(state.distanceM);
      const stillIn =
        before !== undefined &&
        corner !== null &&
        cornerAt(before.distanceM) === corner;
      if (stillIn) {
        expect(state.brake).toBeLessThanOrEqual(before.brake);
      }
    }
  });

  it("rolls the throttle on from the apex to the exit, never backing off", () => {
    for (const corner of CORNERS) {
      const exit = LAP_FRAMES.filter(
        (state) =>
          cornerAt(state.distanceM) === corner &&
          cornerProgress(corner, state.distanceM) > CORNER_APEX_AT
      );
      for (const [index, state] of exit.entries()) {
        if (index > 0) {
          expect(state.throttle, corner.name).toBeGreaterThanOrEqual(
            exit[index - 1].throttle - 0.01
          );
        }
      }
    }
  });

  it("brakes before each slow corner, not in it", () => {
    for (const corner of CORNERS.filter((turn) => turn.apexKph < 150)) {
      const approach = LAP_FRAMES.filter(
        (state) =>
          state.distanceM >= corner.startM - 300 &&
          state.distanceM < corner.startM
      );
      expect(
        approach.some((state) => state.brake > 0.3),
        corner.name
      ).toBe(true);
    }
  });

  it("never alternates pedals within 300 ms", () => {
    let lastChange = Number.NEGATIVE_INFINITY;
    let last: Pedal = "none";
    for (const state of LAP_FRAMES) {
      const pedal = pedalOf(state);
      if (pedal !== "none" && pedal !== last) {
        if (last !== "none") {
          expect(state.now - lastChange).toBeGreaterThanOrEqual(300);
        }
        lastChange = state.now;
        last = pedal;
      }
    }
  });

  it("never presses both pedals at once", () => {
    expect(
      LAP_FRAMES.some((state) => state.brake > 0 && state.throttle > 0)
    ).toBe(false);
  });
});

describe("the start", () => {
  it("lines up on the grid of lap 1: P4, idling in neutral, full fuel and store, tyres off the blankets", () => {
    const grid = started();
    expect(grid).toMatchObject({
      fuelKg: 100,
      gear: "N",
      position: 4,
      session: "track",
      socMJ: 4,
      speedKph: 0,
      start: { kind: "grid" },
      timing: { lap: 1 },
    });
    expect(grid.tyreTempsC.fl).toBe(70);
  });

  it("brings the five reds on a second apart after the grid wait", () => {
    const lights = run(started(), GRID_WAIT_MS);
    expect(lights.start).toMatchObject({ kind: "lights", lit: 1 });
    expect(run(lights, LIGHT_INTERVAL_MS).start).toMatchObject({ lit: 2 });
    expect(run(lights, 4 * LIGHT_INTERVAL_MS).start).toMatchObject({ lit: 5 });
  });

  it("holds the five reds for 0.2 to 3 s before lights out", () => {
    for (const now of [0, 1234.5, 98_765.4, 5e6]) {
      expect(holdFor(now)).toBeGreaterThanOrEqual(HOLD_MIN_MS);
      expect(holdFor(now)).toBeLessThanOrEqual(HOLD_MAX_MS);
    }
    const lights = run(started(), GRID_WAIT_MS);
    const hold = lights.start.kind === "lights" ? lights.start.holdMs : 0;
    const allLit = 4 * LIGHT_INTERVAL_MS;
    expect(run(lights, allLit + hold - 2 * FRAME_MS).start.kind).toBe("lights");
    expect(run(lights, allLit + hold + FRAME_MS).start.kind).toBe("go");
  });

  it("selects 1st and holds launch revs on the clutch, the car still", () => {
    const [last] = untilLightsOut(started());
    expect(last).toMatchObject({ gear: 1, speedKph: 0 });
    expect(last.clutch).toBeGreaterThanOrEqual(CLUTCH_OPEN);
    expect(last.rpm).toBeGreaterThan(LAUNCH_LIMITER_RPM * 0.6);
    expect(last.rpm).toBeLessThanOrEqual(LAUNCH_LIMITER_RPM);
  });

  it("lets the clutch go only after lights out and a reaction", () => {
    let releasedEarly = false;
    let releasedAt: number | null = null;
    run(started(), 20_000, (state) => {
      if (state.start.kind !== "go" && state.clutch < CLUTCH_OPEN) {
        releasedEarly = true;
      }
      if (state.start.kind === "go" && state.clutch < 1) {
        releasedAt ??= state.start.elapsedMs;
      }
    });
    expect(releasedEarly).toBe(false);
    expect(releasedAt).toBeGreaterThan(DRIVER_REACTION_MS);
  });

  it("gets off the line and past 100 km/h within 3 s", () => {
    const [, go] = untilLightsOut(started());
    expect(run(go, 3000).speedKph).toBeGreaterThan(100);
  });

  it("refuses a hand upshift beyond 1st before lights out", () => {
    const [last] = untilLightsOut(started());
    const pushed = apply(last, up);
    expect(pushed.shift).toBeNull();
    expect(pushed.message?.text).toBe("SHIFT REJECTED");
    expect(pushed.gearControl).toBe("auto");
  });

  it("allows one gear change below 80 km/h after the start", () => {
    const off = racing({
      gear: 1,
      gearControl: "manual",
      speedKph: 60,
      timing: { ...racing().timing, lap: 1 },
    });
    expect(apply(off, up).shift?.to).toBe(2);
    expect(apply({ ...off, gear: 2 }, up).message?.text).toBe("SHIFT REJECTED");
    expect(apply({ ...off, gear: 2, speedKph: 90 }, up).shift?.to).toBe(3);
  });

  it("keeps DRS off on lap 1, even within a second at detection", () => {
    expect(run(atDetection(0.6, DRS_FIRST_LAP - 1), 200).drs).toBe("disabled");
  });
});

describe("start and stop", () => {
  it("goes back to a car standing still in the garage on Stop, keeping the driver's set-up", () => {
    const tuned = apply(
      initialState(0),
      { type: "thumbwheel", value: 3, wheel: "difIn" },
      { index: 6, rotary: "mode", type: "rotary" },
      { index: 0, rotary: "mfl", type: "rotary" },
      press("plus"),
      press("bbForward"),
      { type: "dashSwitch", value: "S" },
      { session: "track", type: "session" }
    );
    const midRace = run(tuned, 20_000);
    const stopped = apply(midRace, { session: "garage", type: "session" });
    expect(stopped).toMatchObject({
      brakeBalance: tuned.brakeBalance,
      dashSwitch: "S",
      gear: "N",
      multi: tuned.multi,
      rotaries: tuned.rotaries,
      rpm: 0,
      session: "garage",
      speedKph: 0,
      thumbwheels: tuned.thumbwheels,
      timing: { lap: 0 },
    });
  });

  it("starts again from the grid after a Stop", () => {
    const midRace = run(started(), 30_000);
    const restarted = apply(
      midRace,
      { session: "garage", type: "session" },
      { session: "track", type: "session" }
    );
    expect(restarted).toMatchObject({
      distanceM: 0,
      speedKph: 0,
      start: { elapsedMs: 0, kind: "grid" },
      timing: { lap: 1 },
    });
  });

  it("leaves the car still in the garage however long it ticks", () => {
    expect(run(initialState(0), 2000)).toMatchObject({
      distanceM: 0,
      speedKph: 0,
    });
  });
});

describe("DRS", () => {
  it("is available within 1 s of the car ahead at detection", () => {
    expect(run(atDetection(0.6), 200).drs).toBe("available");
    expect(run(atDetection(1.2), 200).drs).toBe("disabled");
  });

  it("is enabled inside the zone and never opened by the hidden driver", () => {
    let opened = false;
    run(atDetection(0.6), 12_000, (state) => {
      opened ||= state.drs === "open";
    });
    expect(opened).toBe(false);
    expect(
      run(racing({ distanceM: backZone.startM - 2, drs: "available" }), 100).drs
    ).toBe("enabled");
  });

  it("opens on the driver's press only once enabled", () => {
    expect(
      apply(racing({ drs: "available" }), press("drs")).popup
    ).toMatchObject({ label: "DRS", value: "NOT ENABLED" });
    expect(apply(racing({ drs: "enabled" }), press("drs")).drs).toBe("open");
  });

  it("closes on the first brake application", () => {
    const open = racing({
      brake: 0.2,
      distanceM: backZone.startM + 50,
      drs: "open",
      speedKph: 280,
    });
    expect(run(open, FRAME_MS).drs).toBe("disabled");
  });

  it("closes at the end of the zone", () => {
    const open = racing({
      distanceM: backZone.endM - 3,
      drs: "open",
      speedKph: 290,
    });
    expect(run(open, 200).drs).toBe("disabled");
  });

  it("adds about 10 km/h by the end of the straight", () => {
    const start = racing({
      distanceM: backZone.startM + 1,
      drs: "enabled",
      gear: 7,
      speedKph: 250,
    });
    let open = 0;
    let closed = 0;
    run(apply(start, press("drs")), 9000, (state) => {
      open = Math.max(open, state.speedKph);
    });
    run(start, 9000, (state) => {
      closed = Math.max(closed, state.speedKph);
    });
    expect(open - closed).toBeGreaterThan(6);
    expect(open - closed).toBeLessThan(16);
  });
});

describe("energy", () => {
  it("deploys the full 120 kW only while K1 is held", () => {
    const held = run(apply(straight(), press("k1")), 200);
    expect(held.mgukKW).toBe(ERS_MAX_KW);
    const released = run(apply(held, release("k1")), 200);
    expect(released.ers).toBe("base");
    expect(released.mgukKW).toBeLessThan(ERS_MAX_KW);
  });

  it("stops deploying once the lap's 4 MJ is spent, and says so", () => {
    const almost = apply(
      straight({ deployedThisLapMJ: DEPLOY_CAP_MJ - 0.01 }),
      press("k1")
    );
    const spent = run(almost, 1000);
    expect(spent.deployedThisLapMJ).toBe(DEPLOY_CAP_MJ);
    expect(spent.mgukKW).toBe(0);
    expect(spent.message?.text).toBe("DEPLOY LIMIT");
  });

  it("stops the MGU-K recovering at the lap's 2 MJ", () => {
    const braking = racing({
      distanceM: firstCorner.startM - 120,
      harvestedThisLapMJ: HARVEST_CAP_MJ - 0.005,
      socMJ: 1,
      speedKph: 300,
    });
    const capped = run(braking, 1500);
    expect(capped.harvestedThisLapMJ).toBe(HARVEST_CAP_MJ);
    expect(capped.mgukKW).toBeGreaterThanOrEqual(0);
  });

  it("keeps charging from the MGU-H flat out, past the MGU-K's caps", () => {
    const flat = straight({
      deployedThisLapMJ: DEPLOY_CAP_MJ,
      harvestedThisLapMJ: HARVEST_CAP_MJ,
      socMJ: 1,
      speedKph: 260,
    });
    expect(run(flat, 2000).socMJ).toBeGreaterThan(1);
  });

  it("recovers on CHR even flat out at speed", () => {
    const charging = run(apply(straight({ speedKph: 280 }), press("chr")), 200);
    expect(charging.mgukKW).toBeLessThan(0);
  });

  it("resets both lap allowances at the line", () => {
    const crossing = racing({ distanceM: LAP_LENGTH_M - 1, speedKph: 290 });
    expect(run(crossing, FRAME_MS)).toMatchObject({
      deployedThisLapMJ: 0,
      harvestedThisLapMJ: 0,
    });
  });
});

describe("gears on track", () => {
  it("hands the gearbox to the human on a paddle press", () => {
    const manual = apply(racing(), up);
    expect(manual.gearControl).toBe("manual");
    expect(manual.popup).toMatchObject({ label: "GEARBOX", value: "MANUAL" });
  });

  it("switches between auto and manual on the gearbox toggle", () => {
    const manual = apply(racing(), { type: "gearControl", value: "manual" });
    expect(manual.popup).toMatchObject({ label: "GEARBOX", value: "MANUAL" });
    const auto = apply(manual, { type: "gearControl", value: "auto" });
    expect(auto.gearControl).toBe("auto");
    expect(auto.popup).toMatchObject({ label: "GEARBOX", value: "AUTO" });
  });

  it("leaves the human to shift in manual, bouncing on the limiter", () => {
    const manual = racing({
      distanceM: backZone.startM + 1,
      gear: 5,
      gearControl: "manual",
      speedKph: 200,
    });
    let bounced = false;
    const later = run(manual, 6000, (state) => {
      bounced ||= state.rpm >= 12_400;
    });
    expect(later.gear).toBe(5);
    expect(bounced).toBe(true);
    expect(later.speedKph).toBeLessThan(GEAR_TOP_KPH[5] + 1);
  });

  it("keeps manual for a whole lap without a paddle", () => {
    expect(run(apply(racing(), up), LAP_MS).gearControl).toBe("manual");
  });

  it("picks the gears up from where the car is when switched back to auto", () => {
    const stuck = racing({
      distanceM: backZone.startM + 1,
      gear: 5,
      gearControl: "manual",
      speedKph: 225,
    });
    const gears: WheelState["gear"][] = [];
    run(apply(stuck, { type: "gearControl", value: "auto" }), 3000, (state) => {
      gears.push(state.gear);
    });
    expect(gears[0]).toBe(5);
    expect(gears).toContain(6);
    for (let index = 1; index < gears.length; index += 1) {
      const step = Number(gears[index]) - Number(gears[index - 1]);
      expect(Math.abs(step)).toBeLessThanOrEqual(1);
    }
  });

  it("rejects a downshift that would over-rev", () => {
    const rejected = apply(racing({ gear: 5, speedKph: 230 }), down);
    expect(rejected.shift).toBeNull();
    expect(rejected.message).toMatchObject({
      text: "SHIFT REJECTED",
      tone: "warn",
    });
  });

  it("bogs out of a slow corner in too high a gear", () => {
    expect(exitSpeed(3)).toBeGreaterThan(exitSpeed(7) + 15);
  });
});

describe("pit limiter on track", () => {
  it("clamps to 80 km/h at once and holds it with the throttle on", () => {
    const limited = apply(racing({ speedKph: 240 }), press("pit"));
    let top = 0;
    run(limited, 3000, (state) => {
      top = Math.max(top, state.speedKph);
    });
    expect(top).toBeLessThanOrEqual(PIT_LIMIT_KPH);
  });
});

describe("handling", () => {
  it("notes a front lock-up at most once a lap with the balance far forward", () => {
    let notes = 0;
    let previous: WheelState["message"] = null;
    run(racing({ brakeBalance: 63 }), LAP_MS, (state) => {
      if (
        state.message !== previous &&
        state.message?.text === "LOCK-UP FRONT"
      ) {
        notes += 1;
      }
      previous = state.message;
    });
    expect(notes).toBeGreaterThanOrEqual(1);
    expect(notes).toBeLessThanOrEqual(2);
  });

  it("costs lap time with the set-up far off", () => {
    const tuned = secondLapMs(racing());
    const off = secondLapMs(
      racing({
        brakeBalance: 64,
        thumbwheels: { ...racing().thumbwheels, dMid: 5, difIn: -5, trq: 8 },
      })
    );
    expect(tuned).not.toBeNull();
    expect(off).toBeGreaterThan((tuned ?? 0) + 500);
  });
});

describe("the race", () => {
  it("counts a lap at the line and keeps its time", () => {
    const crossing = racing({
      distanceM: LAP_LENGTH_M - 1,
      speedKph: 290,
      timing: { ...racing().timing, currentMs: 88_000 },
    });
    expect(run(crossing, FRAME_MS).timing).toMatchObject({
      lap: 6,
      lapTimesMs: [88_020],
      lastMs: 88_020,
    });
  });

  it("stops after lap 20 with the chequered flag", () => {
    const last = racing({
      distanceM: LAP_LENGTH_M - 1,
      speedKph: 290,
      timing: { ...racing().timing, lap: RACE_LAPS },
    });
    const finished = run(last, FRAME_MS);
    expect(finished.session).toBe("garage");
    expect(finished.message?.text).toBe("CHEQUERED FLAG");
  });

  it("changes places only on a straight", () => {
    const inCorner = racing({
      distanceM: firstCorner.startM + 10,
      gapAheadS: 0.05,
      speedKph: 90,
    });
    expect(run(inCorner, FRAME_MS).position).toBe(4);
    const onStraight = racing({
      distanceM: 300,
      gapAheadS: 0.05,
      speedKph: 300,
    });
    const passed = run(onStraight, FRAME_MS);
    expect(passed.position).toBe(3);
    expect(passed.gapBehindS).toBeLessThanOrEqual(1);
  });

  it("never simulates more than 100 ms in one tick", () => {
    const state = racing();
    const late = reduce(state, { now: 60_000, type: "tick" });
    const travelled = late.distanceM - state.distanceM;
    expect(travelled).toBeLessThan(
      ((state.speedKph + 10) / 3.6) * (MAX_ELAPSED_MS / 1000)
    );
    expect(late.now).toBe(60_000);
  });
});
