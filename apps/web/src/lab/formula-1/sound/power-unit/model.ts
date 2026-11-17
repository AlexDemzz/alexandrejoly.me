// A physical model of a 2022–2025 F1 power unit (1.6 L 90° V6, one turbo with
// an MGU-H), heard from the cockpit. Nothing is sampled or looped.
//
//   crank phase ─ 6 blowdown pulses (bank A 0/240/480°, bank B 90/330/570°)
//     each bank ─ closed-open pipe (waveguide) ─┐
//                                               ├─ turbine (low-pass, wastegate
//                                               │  bypass) ─ soft shock ─ open
//                                               │  tailpipe (waveguide) ─ radiation
//   6 intake pulses ─ airbox resonances + airflow noise
//   turbo speed (lags load) ─ whistle; gear mesh and wind follow road speed
//   everything ─ earpiece EQ ─ compressor ─ soft limit
//
// The pulses last a fixed time, not a fixed crank angle, and the pipes resonate
// at fixed frequencies: the harmonics of the firing frequency (rpm / 20 Hz, and
// rpm / 40 Hz per bank, the two banks being 90° apart) sweep through them as
// the revs climb, which a re-pitched loop cannot do. Load raises the cylinder
// pressure at exhaust-valve opening: taller, steeper pulses. An ignition cut
// or a limiter gates the combustion itself, cylinder by cylinder. A lifted
// throttle gates nothing: the engine keeps pumping against the car, a drone
// the pulses fade into and swell out of, while unburnt fuel pops in the pipes.
//
// This runs inside an AudioWorklet: it allocates nothing while rendering.

import { Biquad } from "./biquad.ts";
import { Pipe } from "./pipe.ts";

export interface PowerUnitInputs {
  /** 1 while the engine runs, 0 to fade it out. */
  running: number;
  rpm: number;
  /** Throttle, 0..1. */
  load: number;
  /** Lifted at high revs, 0..1. */
  overrun: number;
  /** 1 during an upshift's ignition cut. */
  cut: number;
  /** One of LIMITER_CODES. */
  limiter: number;
  speedKph: number;
}

export const PROCESSOR_NAME = "power-unit";

export const LIMITER_CODES = { off: 0, pit: 2, rev: 1 } as const;

export const INPUT_NAMES = [
  "running",
  "rpm",
  "load",
  "overrun",
  "cut",
  "limiter",
  "speedKph",
] as const satisfies readonly (keyof PowerUnitInputs)[];

const OVERSAMPLE = 2;
const CYLINDERS = 6;
/** Exhaust-valve opening of each cylinder, as a share of the 720° cycle. */
const FIRING = [0, 240, 480, 90, 330, 570].map((degrees) => degrees / 720);
const BANK = [0, 0, 0, 1, 1, 1];
/** No two cylinders breathe alike: runner lengths and port flow differ a little. */
const CYLINDER_GAIN = [1, 0.92, 1.06, 0.96, 1.07, 0.93];
const CYLINDER_LATE = [0, 0.003, 0.001, 0.0035, 0.0005, 0.002];

const MIN_RPM = 1500;
const TOP_RPM = 12_500;
const TOP_KPH = 340;

// Blowdown pulse x·e^(1−x), x = time / rise.
const TABLE_SIZE = 2048;
const PULSE_SPAN = 12;
const RISE_SOFT = 620e-6;
const RISE_HARD = 130e-6;
const RISE_POP = 90e-6;
const IDLE_FIRE = 0.12;
const LOAD_CURVE = 1.3;
/** A cylinder that doesn't fire at all: an ignition cut. */
const MOTORING = 0.05;
/** Off the throttle at high revs the engine brakes the car, pumping air: a drone under the blips. */
const ENGINE_BRAKING = 0.25;
/** The lifted throttle's fuel cut is ragged: some cylinders still light a little. */
const BURBLE = 0.14;
const TIMING_JITTER = 0.004;
const TURBULENCE = 0.5;
const POST_CUT_EVENTS = 3;
const POST_CUT_BOOST = 1.7;
const OVERRUN_POP_CHANCE = 0.05;
const LIMITER_POP_CHANCE = 0.1;

// Round-trip times of the pipes, seconds: ~0.45 m primaries and collector per
// bank, ~1 m of tailpipe, in gas near 600 m/s.
const BANK_SECONDS = [1.38e-3, 1.72e-3];
const BANK_REFLECTION = 0.5;
const BANK_LOSS_HZ = 5200;
const HOT_GAS = 0.08;
const TAIL_SECONDS = 3.9e-3;
const TAIL_REFLECTION = 0.5;
const TAIL_LOSS_HZ = 3800;
const TURBINE_HZ = 1500;
const TURBINE_OPEN_HZ = 4200;
const WASTEGATE_FROM = 0.55;
const WASTEGATE_SHARE = 0.45;
const SHOCK_DRIVE = 0.75;
const SHOCK_BIAS = 0.35;
const RADIATION_HZ = 1300;
const TAIL_POP_SECONDS = 0.0035;
const TAIL_POPS_PER_SECOND = 9;

const INTAKE_WIDTH = 0.03;
const AIRBOX_HZ = 410;
const RUNNER_HZ = 1180;
const AIR_NOISE_HZ = 2300;

const BOOST_UP_SECONDS = 0.24;
const BOOST_DOWN_SECONDS = 0.8;
const WHISTLE_LOW_HZ = 2100;
const WHISTLE_HIGH_HZ = 5600;
const WHISTLE_Q = 28;
const WHISTLE_WANDER = 0.004;
const GEAR_HZ_PER_KPH = 11.5;

const RPM_SECONDS = 0.018;
// The manifold fills faster than it empties: a blip swells, then dies away.
const LOAD_UP_SECONDS = 0.035;
const LOAD_DOWN_SECONDS = 0.07;
const SPEED_SECONDS = 0.2;
const FADE_SECONDS = 0.05;
const REV_LIMITER = { bounceRpm: 260, cutShare: 0.5, hz: 15 };
const PIT_LIMITER = { bounceRpm: 0, cutShare: 0.52, hz: 11 };

const MIX = {
  airNoise: 0.5,
  airbox: 0.07,
  exhaust: 1.5,
  gear: 0.02,
  whistleNoise: 0.42,
  whistleTone: 0.045,
  wind: 0.3,
};
const EARPIECE = {
  highpassHz: 170,
  lowpassHz: 7200,
  presenceDb: 5,
  presenceHz: 2700,
};
const COMPRESSOR = {
  attackSeconds: 0.004,
  ratio: 3.5,
  releaseSeconds: 0.14,
  threshold: 0.16,
};
const MAKEUP = 0.9;
/** The loudest the engine gets, as a peak. */
export const CEILING = 0.3;

const TWO_PI = 2 * Math.PI;

const PULSE = new Float32Array(TABLE_SIZE + 2);
for (let index = 0; index < PULSE.length; index += 1) {
  const x = (index / TABLE_SIZE) * PULSE_SPAN;
  PULSE[index] = x * Math.exp(1 - x);
}
const TABLE_STEP = TABLE_SIZE / PULSE_SPAN;

const pulseAt = (x: number): number => {
  const position = x * TABLE_STEP;
  const index = Math.trunc(position);
  const low = PULSE[index];
  return low + (PULSE[index + 1] - low) * (position - index);
};

const clamp01 = (value: number): number => Math.min(1, Math.max(0, value));

const glideFor = (seconds: number, rate: number): number =>
  1 - Math.exp(-1 / (seconds * rate));

const poleFor = (hz: number, rate: number): number =>
  1 - Math.exp((-TWO_PI * hz) / rate);

export class PowerUnit {
  readonly inputs: PowerUnitInputs = {
    cut: 0,
    limiter: LIMITER_CODES.off,
    load: 0,
    overrun: 0,
    rpm: 0,
    running: 0,
    speedKph: 0,
  };

  private readonly rate: number;
  private readonly innerRate: number;
  private seed: number;

  private rpm = MIN_RPM;
  private load = 0;
  private overrun = 0;
  /** How much of the pulse is engine braking: the overrun, less whatever throttle is open. */
  private lift = 0;
  private speed = 0;
  private boost = 0;
  private level = 0;

  private phase = 0;
  private readonly last = new Float32Array(CYLINDERS);
  private readonly amplitude = new Float32Array(CYLINDERS);
  private readonly inverseRise = new Float32Array(CYLINDERS).fill(1);
  private readonly lateness = new Float32Array(CYLINDERS);
  private sinceCut = 0;
  private limiterPhase = 0;
  private limiterCut = false;

  private readonly banks = [new Pipe(1024), new Pipe(1024)];
  private readonly bankLoss = new Float32Array(2);
  private readonly bankIn = new Float32Array(2);
  private readonly tail = new Pipe(2048);
  private tailLoss = 0;
  private turbine = 0;
  private turbinePole = 1;
  private radiation = 0;
  private pop = 0;

  private readonly airbox = new Biquad();
  private readonly runner = new Biquad();
  private readonly airNoise = new Biquad();
  private readonly half = new Float32Array(7);

  private whistlePhase = 0;
  private whistleWander = 0;
  private readonly whistleNoise = new Biquad();
  private gearPhase = 0;
  private windLow = 0;
  private windRumble = 0;
  private windGust = 0;

  private readonly highpass = new Biquad();
  private readonly presence = new Biquad();
  private readonly lowpass = new Biquad();
  private envelope = 0;
  private gain = 1;

  private readonly glide: {
    boostDown: number;
    boostUp: number;
    fade: number;
    loadDown: number;
    loadUp: number;
    rpm: number;
    speed: number;
    attack: number;
    release: number;
  };
  private readonly poles: {
    bankLoss: number;
    radiation: number;
    rumble: number;
    tailLoss: number;
    wind: number;
  };

  constructor(sampleRate: number, seed = 20_250_316) {
    this.rate = sampleRate;
    this.innerRate = sampleRate * OVERSAMPLE;
    this.seed = seed;
    const inner = this.innerRate;
    this.glide = {
      attack: glideFor(COMPRESSOR.attackSeconds, sampleRate),
      boostDown: glideFor(BOOST_DOWN_SECONDS, sampleRate),
      boostUp: glideFor(BOOST_UP_SECONDS, sampleRate),
      fade: glideFor(FADE_SECONDS, sampleRate),
      loadDown: glideFor(LOAD_DOWN_SECONDS, sampleRate),
      loadUp: glideFor(LOAD_UP_SECONDS, sampleRate),
      release: glideFor(COMPRESSOR.releaseSeconds, sampleRate),
      rpm: glideFor(RPM_SECONDS, sampleRate),
      speed: glideFor(SPEED_SECONDS, sampleRate),
    };
    this.poles = {
      bankLoss: poleFor(BANK_LOSS_HZ, inner),
      radiation: poleFor(RADIATION_HZ, inner),
      tailLoss: poleFor(TAIL_LOSS_HZ, inner),
      rumble: poleFor(250, sampleRate),
      wind: poleFor(2600, sampleRate),
    };
    this.airbox.bandpass(AIRBOX_HZ, 3, inner);
    this.runner.bandpass(RUNNER_HZ, 5, inner);
    this.airNoise.bandpass(AIR_NOISE_HZ, 0.7, inner);
    this.whistleNoise.bandpass(WHISTLE_LOW_HZ, WHISTLE_Q, sampleRate);
    this.highpass.highpass(EARPIECE.highpassHz, 0.7, sampleRate);
    this.presence.peaking(
      EARPIECE.presenceHz,
      0.8,
      EARPIECE.presenceDb,
      sampleRate
    );
    this.lowpass.lowpass(EARPIECE.lowpassHz, 0.7, sampleRate);
  }

  /** True once a stopped engine has faded to nothing. */
  get silent(): boolean {
    return this.inputs.running < 0.5 && this.level < 1e-4;
  }

  /** White noise, −1..1 (Park–Miller). */
  private noise(): number {
    this.seed = (this.seed * 16_807) % 2_147_483_647;
    return this.seed / 1_073_741_823.5 - 1;
  }

  private chance(): number {
    return this.noise() * 0.5 + 0.5;
  }

  /** One cylinder's exhaust valve opens: what its combustion was decides the pulse. */
  private fire(cylinder: number): void {
    const { load } = this;
    const cycleHz = this.rpm / 120;
    let amplitude = MOTORING * (1 + 0.5 * this.chance());
    let rise = RISE_SOFT;
    const cut = this.inputs.cut > 0.5 || this.limiterCut;
    if (cut) {
      this.sinceCut = POST_CUT_EVENTS;
      if (this.limiterCut && this.chance() < LIMITER_POP_CHANCE) {
        amplitude = 0.35 + 0.5 * this.chance();
        rise = RISE_POP;
      }
    } else {
      const { lift } = this;
      const jitter = 0.05 + 0.2 * (1 - load);
      amplitude =
        (IDLE_FIRE + (1 - IDLE_FIRE) * load ** LOAD_CURVE) *
          (1 + jitter * this.noise()) +
        lift * (ENGINE_BRAKING + BURBLE * this.chance() ** 2);
      rise = RISE_SOFT + (RISE_HARD - RISE_SOFT) * load ** 0.7;
      if (this.chance() < lift * OVERRUN_POP_CHANCE) {
        // What little fuel gets through burns late, in the pipe.
        amplitude = 0.35 + 0.6 * this.chance();
        rise = RISE_POP;
        this.pop = Math.max(this.pop, 0.5 * amplitude);
      } else if (this.sinceCut > 0) {
        // The fuel that went through unburnt during the cut lights with the first sparks.
        this.sinceCut -= 1;
        amplitude *= 1 + (POST_CUT_BOOST - 1) * load;
        rise *= 0.7;
        this.pop = Math.max(this.pop, 0.35 * load);
      }
    }
    this.amplitude[cylinder] = amplitude * CYLINDER_GAIN[cylinder];
    this.inverseRise[cylinder] = 1 / (rise * cycleHz);
    this.lateness[cylinder] =
      CYLINDER_LATE[cylinder] + this.chance() * TIMING_JITTER;
  }

  private stepLimiter(): void {
    const { limiter } = this.inputs;
    if (limiter === LIMITER_CODES.off) {
      this.limiterCut = false;
      this.limiterPhase = 0;
      return;
    }
    const shape = limiter === LIMITER_CODES.rev ? REV_LIMITER : PIT_LIMITER;
    this.limiterPhase += shape.hz / this.rate;
    if (this.limiterPhase >= 1) {
      this.limiterPhase -= 1;
    }
    this.limiterCut = this.limiterPhase < shape.cutShare;
  }

  /** Glides the controls toward the inputs, once per output sample. */
  private follow(): void {
    const { inputs, glide } = this;
    this.stepLimiter();
    const bounce =
      this.limiterCut && inputs.limiter === LIMITER_CODES.rev
        ? REV_LIMITER.bounceRpm
        : 0;
    const rpm = Math.max(MIN_RPM, inputs.rpm) - bounce;
    this.rpm += glide.rpm * (rpm - this.rpm);
    const load = clamp01(inputs.load);
    this.load +=
      (load > this.load ? glide.loadUp : glide.loadDown) * (load - this.load);
    this.overrun += glide.loadUp * (clamp01(inputs.overrun) - this.overrun);
    this.lift = this.overrun * (1 - this.load);
    this.speed += glide.speed * (inputs.speedKph - this.speed);
    this.level += glide.fade * ((inputs.running > 0.5 ? 1 : 0) - this.level);
    // The MGU-H holds some turbo speed off the throttle; boost builds with load.
    const revs = clamp01(this.rpm / TOP_RPM);
    const wanted = this.load * (0.25 + 0.6 * revs) + 0.13 * revs;
    this.boost +=
      (wanted > this.boost ? glide.boostUp : glide.boostDown) *
      (wanted - this.boost);
    // The turbine takes more of the edge off the pulses the less it is driven.
    this.turbinePole = poleFor(
      TURBINE_HZ + (TURBINE_OPEN_HZ - TURBINE_HZ) * this.load * this.boost,
      this.innerRate
    );
  }

  /** Exhaust and intake, one sample at the inner rate. */
  private breathe(): number {
    const { amplitude, bankIn, inverseRise, last, lateness, load, poles } =
      this;
    this.phase += this.rpm / 120 / this.innerRate;
    if (this.phase >= 1) {
      this.phase -= 1;
    }
    bankIn[0] = 0;
    bankIn[1] = 0;
    let intake = 0;
    for (let cylinder = 0; cylinder < CYLINDERS; cylinder += 1) {
      let local = this.phase - FIRING[cylinder];
      if (local < 0) {
        local += 1;
      }
      if (local < last[cylinder]) {
        this.fire(cylinder);
      }
      last[cylinder] = local;
      const x = (local - lateness[cylinder]) * inverseRise[cylinder];
      if (x > 0 && x < PULSE_SPAN) {
        bankIn[BANK[cylinder]] += amplitude[cylinder] * pulseAt(x);
      }
      const opened = (local < 0.5 ? local + 0.5 : local - 0.5) / INTAKE_WIDTH;
      if (opened < PULSE_SPAN) {
        intake += pulseAt(opened);
      }
    }

    // Each bank: a pipe closed at the valves and open into the collector.
    const hot = 1 - HOT_GAS * load;
    let merged = 0;
    for (let bank = 0; bank < 2; bank += 1) {
      const pipe = this.banks[bank];
      const back = pipe.read(BANK_SECONDS[bank] * hot * this.innerRate);
      this.bankLoss[bank] += poles.bankLoss * (back - this.bankLoss[bank]);
      const flow = bankIn[bank] * (1 + TURBULENCE * this.noise());
      const wave = flow - BANK_REFLECTION * this.bankLoss[bank];
      pipe.write(wave);
      merged += wave;
    }

    // Past the turbine, or round it through the wastegate.
    this.turbine += this.turbinePole * (merged - this.turbine);
    const bypass =
      WASTEGATE_SHARE * clamp01((load - WASTEGATE_FROM) / (1 - WASTEGATE_FROM));
    const past = this.turbine + bypass * (merged - this.turbine);
    // Strong pulses steepen into shocks: an uneven, saturating curve.
    const shocked =
      (Math.tanh(past * SHOCK_DRIVE + SHOCK_BIAS) - Math.tanh(SHOCK_BIAS)) /
      SHOCK_DRIVE;

    this.pop *= 1 - 1 / (TAIL_POP_SECONDS * this.innerRate);
    if (this.chance() < (this.lift * TAIL_POPS_PER_SECOND) / this.innerRate) {
      this.pop = 0.3 + 0.5 * this.chance();
    }
    const back = this.tail.read(TAIL_SECONDS * hot * this.innerRate);
    this.tailLoss += poles.tailLoss * (back - this.tailLoss);
    const out =
      shocked + TAIL_REFLECTION * this.tailLoss + this.pop * this.noise();
    this.tail.write(out);
    this.radiation += poles.radiation * (out - this.radiation);
    const exhaust = out - this.radiation;

    const air = clamp01(this.rpm / TOP_RPM) * (0.2 + 0.8 * load);
    const breath = intake * (0.3 + 0.7 * load);
    const induction = this.airbox.run(breath) + 0.6 * this.runner.run(breath);
    const hiss = this.airNoise.run(this.noise()) * air * (0.5 + 0.25 * intake);
    return (
      MIX.exhaust * exhaust + MIX.airbox * induction + MIX.airNoise * hiss * 0.2
    );
  }

  /** Turbo whistle, gear mesh and wind, at the output rate. */
  private whine(): number {
    const { boost, rate } = this;
    this.whistleWander += 0.002 * (this.noise() - this.whistleWander);
    const whistleHz =
      (WHISTLE_LOW_HZ + (WHISTLE_HIGH_HZ - WHISTLE_LOW_HZ) * boost) *
      (1 + WHISTLE_WANDER * this.whistleWander * 20);
    this.whistlePhase += whistleHz / rate;
    if (this.whistlePhase >= 1) {
      this.whistlePhase -= 1;
    }
    const angle = TWO_PI * this.whistlePhase;
    const spool = boost ** 1.5;
    const tone = Math.sin(angle) + 0.35 * Math.sin(angle * 0.5);
    const air = this.whistleNoise.run(this.noise());

    const speed = clamp01(this.speed / TOP_KPH);
    this.gearPhase += (this.speed * GEAR_HZ_PER_KPH) / rate;
    if (this.gearPhase >= 1) {
      this.gearPhase -= 1;
    }
    const mesh = TWO_PI * this.gearPhase;
    const gear =
      (Math.sin(mesh) + 0.4 * Math.sin(2 * mesh)) *
      Math.min(1, speed * 6) *
      (0.5 + 0.5 * this.load);

    this.windGust += 0.0004 * (this.noise() - this.windGust);
    const rush = this.noise();
    this.windLow += this.poles.wind * (rush - this.windLow);
    this.windRumble += this.poles.rumble * (rush - this.windRumble);
    const wind =
      (this.windLow - this.windRumble) *
      speed *
      speed *
      (1 + 25 * this.windGust);

    return (
      spool * (MIX.whistleTone * tone + MIX.whistleNoise * air) +
      MIX.gear * gear +
      MIX.wind * wind
    );
  }

  /** The earpiece: low end tamed, upper mids forward, squeezed and capped. */
  private earpiece(sample: number): number {
    const { glide } = this;
    const shaped = this.lowpass.run(
      this.presence.run(this.highpass.run(sample))
    );
    const size = Math.abs(shaped);
    this.envelope +=
      (size > this.envelope ? glide.attack : glide.release) *
      (size - this.envelope);
    const over = this.envelope / COMPRESSOR.threshold;
    const wanted = over > 1 ? over ** (1 / COMPRESSOR.ratio - 1) : 1;
    this.gain += glide.attack * (wanted - this.gain);
    return (
      CEILING * Math.tanh((shaped * this.gain * MAKEUP) / CEILING) * this.level
    );
  }

  /** Fills `out` with the next samples of the engine. */
  render(out: Float32Array): void {
    if (this.silent) {
      out.fill(0);
      return;
    }
    const { half } = this;
    for (let index = 0; index < out.length; index += 1) {
      this.follow();
      this.whistleNoise.bandpass(
        WHISTLE_LOW_HZ + (WHISTLE_HIGH_HZ - WHISTLE_LOW_HZ) * this.boost,
        WHISTLE_Q,
        this.rate
      );
      for (let step = 0; step < OVERSAMPLE; step += 1) {
        half.copyWithin(0, 1);
        half[6] = this.breathe();
      }
      // Half-band low-pass before dropping every other sample.
      const breathed =
        (16 * half[3] + 9 * (half[2] + half[4]) - (half[0] + half[6])) / 32;
      out[index] = this.earpiece(breathed + this.whine());
    }
  }
}
