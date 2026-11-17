// Modal click synthesis, adapted from the Formula 2030 sound engine: a contact
// transient exciting the damped resonances of a part, rendered into buffers.

export interface Mode {
  frequency: number;
  /** Time for the mode to fall to 1/e, in milliseconds. */
  tau: number;
  amplitude: number;
}

export interface ClickSpec {
  modes: readonly Mode[];
  /** Level of the contact transient that starts the click. */
  contact: number;
  /** A second, weaker strike when the part bottoms out, in milliseconds. */
  bottomOut?: { delay: number; scale: number };
  lowpass: number;
  /** Buffer length, in seconds. */
  seconds: number;
}

const CONTACT_SECONDS = 0.0003;
const FADE_IN_SECONDS = 0.00008;
const FADE_OUT_SHARE = 0.3;
const TAKE_DETUNE = 0.04;
const TAKE_SPREAD = 0.15;
const TAKE_TIMING = 0.0003;
const ROOM_SECONDS = 0.3;
const ROOM_SMOOTHING = 0.35;
const ROOM_FALL = 3;

const spread = (amount: number): number => 1 + (Math.random() * 2 - 1) * amount;

const excite = (
  samples: Float32Array,
  rate: number,
  spec: ClickSpec,
  start: number,
  scale: number
): void => {
  const offset = Math.max(0, Math.floor(start * rate));
  const contactLength = Math.floor(CONTACT_SECONDS * rate);
  const modes = spec.modes.map((mode) => ({
    amplitude: mode.amplitude * spread(TAKE_SPREAD) * scale,
    omega: 2 * Math.PI * mode.frequency * spread(TAKE_DETUNE),
    phase: Math.random() * Math.PI * 2,
    tau: (mode.tau / 1000) * spread(TAKE_SPREAD),
  }));
  let previous = 0;

  for (let index = offset; index < samples.length; index += 1) {
    const time = (index - offset) / rate;
    let value = 0;
    for (const mode of modes) {
      value +=
        mode.amplitude *
        Math.exp(-time / mode.tau) *
        Math.sin(mode.omega * time + mode.phase);
    }
    if (index - offset < contactLength) {
      // Differentiated noise: the contact is all edge and no low end.
      const noise = Math.random() * 2 - 1;
      value +=
        spec.contact *
        scale *
        (noise - previous) *
        0.5 *
        Math.exp(-time / (CONTACT_SECONDS / 3));
      previous = noise;
    }
    samples[index] += value;
  }
};

/** One take of a click, normalised to a peak of 1; every take differs a little. */
export const renderClick = (
  context: BaseAudioContext,
  spec: ClickSpec
): AudioBuffer => {
  const rate = context.sampleRate;
  const buffer = context.createBuffer(1, Math.floor(spec.seconds * rate), rate);
  const samples = buffer.getChannelData(0);

  excite(samples, rate, spec, 0, 1);
  if (spec.bottomOut) {
    const jitter = (Math.random() * 2 - 1) * TAKE_TIMING;
    excite(
      samples,
      rate,
      spec,
      spec.bottomOut.delay / 1000 + jitter,
      spec.bottomOut.scale
    );
  }

  const smoothing = 1 - Math.exp((-2 * Math.PI * spec.lowpass) / rate);
  const fadeIn = FADE_IN_SECONDS * rate;
  const fadeOut = samples.length * FADE_OUT_SHARE;
  let filtered = 0;
  let peak = 0;
  for (let index = 0; index < samples.length; index += 1) {
    filtered += smoothing * (samples[index] - filtered);
    const edge =
      Math.min(1, index / fadeIn) *
      Math.min(1, (samples.length - index) / fadeOut);
    samples[index] = filtered * edge;
    peak = Math.max(peak, Math.abs(samples[index]));
  }
  for (let index = 0; index < samples.length; index += 1) {
    samples[index] /= peak || 1;
  }
  return buffer;
};

/** A short, dark stereo tail: the cockpit around the wheel, not a hall. */
export const roomBuffer = (context: BaseAudioContext): AudioBuffer => {
  const length = Math.floor(context.sampleRate * ROOM_SECONDS);
  const buffer = context.createBuffer(2, length, context.sampleRate);
  for (let channel = 0; channel < 2; channel += 1) {
    const samples = buffer.getChannelData(channel);
    let smooth = 0;
    for (let index = 0; index < length; index += 1) {
      smooth += ROOM_SMOOTHING * (Math.random() * 2 - 1 - smooth);
      samples[index] = smooth * (1 - index / length) ** ROOM_FALL;
    }
  }
  return buffer;
};
