import { describe, expect, it } from "vitest";

import {
  DEPLOY_CAP_MJ,
  ERS_MAX_KW,
  GEAR_TOP_KPH,
  HARVEST_CAP_MJ,
  RACE_LAPS,
} from "./car";
import { DRS_FIRST_LAP } from "./drs";
import { initialState, toTrack } from "./initial-state";
import { PIT_LIMIT_KPH } from "./ranges";
import { reduce } from "./reducer";
import { MAX_ELAPSED_MS } from "./simulation";
import { CORNERS, DRS_ZONES, LAP_LENGTH_M } from "./track";
import type { WheelAction, WheelButton, WheelState } from "./types";

const FRAME_MS = 20;
const [backZone] = DRS_ZONES;
const [firstCorner] = CORNERS;

const onTrack = (overrides: Partial<WheelState> = {}): WheelState => ({
  ...toTrack(initialState(0)),
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

const press = (button: WheelButton): WheelAction => ({ button, type: "press" });
const release = (button: WheelButton): WheelAction => ({
  button,
  type: "release",
});
const up: WheelAction = { paddle: "upshift", type: "paddle" };
const down: WheelAction = { paddle: "downshift", type: "paddle" };

/** About one lap of driving. */
const LAP_MS = 95_000;

describe("sessions", () => {
  it("joins a flying lap 3 of 20 in P4, in 6th at speed, between two cars", () => {
    const joined = apply(initialState(0), {
      session: "track",
      type: "session",
    });
    expect(joined).toMatchObject({
      gear: 6,
      position: 4,
      session: "track",
      timing: { lap: 3 },
    });
    expect(joined.speedKph).toBeGreaterThan(200);
    expect(joined.gapAheadS).toBeGreaterThanOrEqual(0.6);
    expect(joined.gapAheadS).toBeLessThanOrEqual(0.9);
    expect(joined.gapBehindS).toBeLessThan(1);
  });

  it("goes back to a car standing still in the garage, keeping the driver's set-up", () => {
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
    const driven = run(tuned, 3000);
    const garage = apply(driven, { session: "garage", type: "session" });
    expect(garage).toMatchObject({
      brakeBalance: tuned.brakeBalance,
      dashSwitch: "S",
      gear: "N",
      multi: tuned.multi,
      rotaries: tuned.rotaries,
      session: "garage",
      speedKph: 0,
      thumbwheels: tuned.thumbwheels,
      timing: { lap: 0 },
    });
  });

  it("leaves the car still in the garage however long it ticks", () => {
    expect(run(initialState(0), 2000)).toMatchObject({
      distanceM: 0,
      speedKph: 0,
    });
  });
});

const atDetection = (gapAheadS: number, lap = 5): WheelState =>
  onTrack({
    distanceM: backZone.detectionM - 5,
    gapAheadS,
    speedKph: 240,
    timing: { ...onTrack().timing, lap },
  });

it("is available within 1 s of the car ahead at detection, from lap 3", () => {
  expect(run(atDetection(0.6), 200).drs).toBe("available");
  expect(run(atDetection(1.2), 200).drs).toBe("disabled");
  expect(run(atDetection(0.6, DRS_FIRST_LAP - 1), 200).drs).toBe("disabled");
});

describe("DRS", () => {
  it("is enabled inside the zone, never opened by the hidden driver", () => {
    let opened = false;
    const enabled = run(atDetection(0.6), 12_000, (state) => {
      opened ||= state.drs === "open";
    });
    expect(opened).toBe(false);
    expect(
      run(
        {
          ...atDetection(0.6),
          distanceM: backZone.startM - 2,
          drs: "available",
        },
        100
      ).drs
    ).toBe("enabled");
    expect(enabled.drs).not.toBe("open");
  });

  it("opens on the driver's press only once enabled", () => {
    expect(
      apply(onTrack({ drs: "available" }), press("drs")).popup
    ).toMatchObject({
      label: "DRS",
      value: "NOT ENABLED",
    });
    expect(apply(onTrack({ drs: "enabled" }), press("drs")).drs).toBe("open");
  });

  it("closes on the first brake application", () => {
    const open = onTrack({
      brake: 0.2,
      distanceM: backZone.startM + 50,
      drs: "open",
      speedKph: 280,
    });
    expect(run(open, FRAME_MS).drs).toBe("disabled");
  });

  it("closes at the end of the zone", () => {
    const open = onTrack({
      distanceM: backZone.endM - 3,
      drs: "open",
      speedKph: 290,
    });
    expect(run(open, 200).drs).toBe("disabled");
  });

  it("adds about 10 km/h by the end of the straight", () => {
    const start = onTrack({
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

const straight = (overrides: Partial<WheelState> = {}): WheelState =>
  onTrack({
    deployedThisLapMJ: 0,
    distanceM: backZone.startM + 1,
    gear: 6,
    socMJ: 3,
    speedKph: 200,
    ...overrides,
  });

it("deploys the full 120 kW only while K1 is held", () => {
  const held = run(apply(straight(), press("k1")), 200);
  expect(held.mgukKW).toBe(ERS_MAX_KW);
  const released = run(apply(held, release("k1")), 200);
  expect(released.ers).toBe("base");
  expect(released.mgukKW).toBeLessThan(ERS_MAX_KW);
});

describe("energy", () => {
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
    const braking = onTrack({
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
    const crossing = onTrack({ distanceM: LAP_LENGTH_M - 1, speedKph: 290 });
    expect(run(crossing, FRAME_MS)).toMatchObject({
      deployedThisLapMJ: 0,
      harvestedThisLapMJ: 0,
    });
  });
});

const exit = (gear: 2 | 7): number =>
  run(apply(onTrack({ distanceM: 950, gear, speedKph: 95 }), up, down), 1500)
    .speedKph;
expect(exit(2)).toBeGreaterThan(exit(7) + 20);

describe("gears on track", () => {
  it("hands the gearbox to the human on a paddle press", () => {
    const manual = apply(onTrack(), up);
    expect(manual.gearControl).toBe("manual");
    expect(manual.popup).toMatchObject({ label: "GEARBOX", value: "MANUAL" });
  });

  it("then stops shifting for the human, who bounces on the limiter", () => {
    const manual = onTrack({
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

  it("rejects a downshift that would over-rev", () => {
    const rejected = apply(onTrack({ gear: 5, speedKph: 230 }), down);
    expect(rejected.shift).toBeNull();
    expect(rejected.message).toMatchObject({
      text: "SHIFT REJECTED",
      tone: "warn",
    });
  });

  it("bogs out of a slow corner in too high a gear", () => {});

  it("gives the gears back to the driver after a lap without a paddle", () => {
    const manual = apply(onTrack(), up);
    const lapLater = run(manual, LAP_MS);
    expect(lapLater.gearControl).toBe("auto");
  });

  it("keeps them with the human while the paddles are used", () => {
    let state = apply(onTrack(), up);
    for (let second = 0; second < LAP_MS / 1000; second += 10) {
      state = run(apply(state, down, up), 10_000);
    }
    expect(state.gearControl).toBe("manual");
  });
});

describe("pit limiter on track", () => {
  it("clamps to 80 km/h at once and holds it with the throttle on", () => {
    const limited = apply(onTrack({ speedKph: 240 }), press("pit"));
    let top = 0;
    run(limited, 3000, (state) => {
      top = Math.max(top, state.speedKph);
    });
    expect(top).toBeLessThanOrEqual(PIT_LIMIT_KPH);
  });
});

const lap = (state: WheelState): number | null => {
  let first: number | null = null;
  run(state, LAP_MS * 2, (next) => {
    first ??= next.timing.lapTimesMs.at(1) ?? null;
  });
  return first;
};

describe("handling", () => {
  it("notes a front lock-up once a lap with the balance far forward", () => {
    let notes = 0;
    let previous: WheelState["message"] = null;
    run(onTrack({ brakeBalance: 63 }), LAP_MS, (state) => {
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
    const tuned = lap(onTrack());
    const off = lap(
      onTrack({
        brakeBalance: 64,
        thumbwheels: { ...onTrack().thumbwheels, dMid: 5, difIn: -5, trq: 8 },
      })
    );
    expect(tuned).not.toBeNull();
    expect(off).toBeGreaterThan((tuned ?? 0) + 500);
  });
});

describe("the race", () => {
  it("counts a lap at the line and keeps its time", () => {
    const crossing = onTrack({
      distanceM: LAP_LENGTH_M - 1,
      speedKph: 290,
      timing: { ...onTrack().timing, currentMs: 88_000, lap: 5 },
    });
    expect(run(crossing, FRAME_MS).timing).toMatchObject({
      lap: 6,
      lapTimesMs: [88_020],
      lastMs: 88_020,
    });
  });

  it("ends after lap 20 with the chequered flag, back in the garage", () => {
    const last = onTrack({
      distanceM: LAP_LENGTH_M - 1,
      speedKph: 290,
      timing: { ...onTrack().timing, lap: RACE_LAPS },
    });
    const finished = run(last, FRAME_MS);
    expect(finished.session).toBe("garage");
    expect(finished.message?.text).toBe("CHEQUERED FLAG");
  });

  it("changes places only on a straight", () => {
    const inCorner = onTrack({
      distanceM: firstCorner.startM + 10,
      gapAheadS: 0.05,
      speedKph: 90,
    });
    expect(run(inCorner, FRAME_MS).position).toBe(4);
    const onStraight = onTrack({
      distanceM: 300,
      gapAheadS: 0.05,
      speedKph: 300,
    });
    const passed = run(onStraight, FRAME_MS);
    expect(passed.position).toBe(3);
    expect(passed.gapBehindS).toBeLessThan(1);
  });

  it("never simulates more than 100 ms in one tick", () => {
    const state = onTrack();
    const late = reduce(state, { now: 60_000, type: "tick" });
    const travelled = late.distanceM - state.distanceM;
    expect(travelled).toBeLessThan(
      ((state.speedKph + 10) / 3.6) * (MAX_ELAPSED_MS / 1000)
    );
    expect(late.now).toBe(60_000);
  });
});
