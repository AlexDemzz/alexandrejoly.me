import { describe, expect, it } from "vitest";

import { IDLE_RPM, LIMITER_RPM, rpmAtSpeed } from "../../model/car";
import { initialState, toTrack } from "../../model/initial-state";
import { DOWNSHIFT_MS, UPSHIFT_MS } from "../../model/ranges";
import type { WheelState } from "../../model/types";
import {
  CUT_MS,
  createEngineFrame,
  createEngineMemory,
  readEngine,
} from "./frame";
import type { EngineFrame, EngineMemory } from "./frame";

const NOW = 10_000;

const RACING_KPH = 250;

/** Mid-race, past lights out, flat out in 5th: Start alone leaves the car on the grid. */
const onTrack = (overrides: Partial<WheelState> = {}): WheelState => ({
  ...toTrack(initialState(NOW)),
  clutch: 0,
  gear: 5,
  rpm: rpmAtSpeed(RACING_KPH, 5),
  speedKph: RACING_KPH,
  start: { elapsedMs: 60_000, kind: "go" },
  throttle: 1,
  ...overrides,
});

const read = (
  state: WheelState,
  memory: EngineMemory = createEngineMemory()
): EngineFrame => ({ ...readEngine(state, memory, createEngineFrame()) });

describe("engine frame", () => {
  it("keeps the engine off in the garage, where the car is switched off", () => {
    const frame = read(initialState(NOW));
    expect(frame.running).toBe(false);
    expect(frame.rpm).toBe(0);
  });

  it("follows the car's revs and the hidden driver's throttle on track", () => {
    const frame = read(onTrack({ gear: 5, rpm: 10_800, throttle: 0.6 }));
    expect(frame).toMatchObject({
      cut: false,
      limiter: "off",
      load: 0.6,
      rpm: 10_800,
      running: true,
    });
  });

  it("cuts the ignition at the end of an upshift, until the gear lands", () => {
    const requested = onTrack({
      gear: 4,
      rpm: 12_000,
      shift: { doneAt: NOW + UPSHIFT_MS, to: 5 },
      throttle: 1,
    });
    expect(read(requested).cut).toBe(false);
    expect(read({ ...requested, now: NOW + UPSHIFT_MS - CUT_MS }).cut).toBe(
      true
    );
    const landed = { ...requested, gear: 5 as const, shift: null };
    expect(read(landed).cut).toBe(false);
  });

  it("plays a downshift's blip from the model: its revs, and the ECU's opening as the load", () => {
    const speedKph = 150;
    const blipping = onTrack({
      blip: 0.85,
      brake: 1,
      gear: 5,
      rpm: 11_000,
      shift: { doneAt: NOW + DOWNSHIFT_MS, to: 4 },
      speedKph,
      throttle: 0,
    });
    const frame = read(blipping);
    expect(frame.rpm).toBe(11_000);
    expect(frame.load).toBe(0.85);
    expect(frame.overrun).toBe(0);
  });

  it("crackles on the overrun as the blip closes after the gear lands", () => {
    const settling = onTrack({
      blip: 0.4,
      brake: 1,
      gear: 4,
      rpm: 11_200,
      shift: null,
      speedKph: 150,
      throttle: 0,
    });
    expect(read(settling).overrun).toBeGreaterThan(0.5);
  });

  it("burbles on the overrun when the driver lifts at high revs, not on the throttle", () => {
    expect(read(onTrack({ rpm: 11_500, throttle: 0 })).overrun).toBeGreaterThan(
      0.5
    );
    expect(read(onTrack({ rpm: 11_500, throttle: 1 })).overrun).toBe(0);
    expect(read(onTrack({ rpm: 5000, throttle: 0 })).overrun).toBe(0);
  });

  it("bounces on the rev limiter only when floored at 12,500 rpm", () => {
    const held = onTrack({ gear: 3, rpm: LIMITER_RPM, throttle: 1 });
    expect(read(held).limiter).toBe("rev");
    expect(read({ ...held, rpm: 12_000 }).limiter).toBe("off");
    expect(read({ ...held, throttle: 0 }).limiter).toBe("off");
  });

  it("pulses on the pit limiter once the car holds 80 km/h, and not on the way up to it", () => {
    const pit = onTrack({
      gear: 1,
      pitLimiter: true,
      rpm: rpmAtSpeed(80, 1),
      speedKph: 80,
      throttle: 1,
    });
    expect(read(pit).limiter).toBe("pit");
    expect(read({ ...pit, speedKph: 60 }).limiter).toBe("off");
  });

  it("blips in neutral while the driver's foot is down, falling back to idle between blips", () => {
    const memory = createEngineMemory();
    const neutral = onTrack({ gear: "N", rpm: IDLE_RPM, throttle: 1 });
    const at = (ms: number): number =>
      read({ ...neutral, now: NOW + ms }, memory).rpm;
    const start = at(0);
    const peak = at(120);
    const settled = at(700);
    expect(start).toBe(IDLE_RPM);
    expect(peak).toBeGreaterThan(9000);
    expect(settled).toBe(IDLE_RPM);
    expect(at(1100)).toBe(IDLE_RPM);
    expect(at(1100 + 120)).toBeGreaterThan(9000);
    expect(read({ ...neutral, throttle: 0 }, memory).rpm).toBe(IDLE_RPM);
  });
});
