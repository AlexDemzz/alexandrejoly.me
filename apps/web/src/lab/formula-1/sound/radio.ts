// The team radio's key-up chirp, heard in the driver's earpieces: two short
// tones a fourth apart as the channel opens, one as it closes, each ending in
// a breath of squelch. Rendered into buffers like the clicks, band-limited to
// a radio's 300 Hz – 3 kHz.

export interface RadioTone {
  hz: number;
  /** Milliseconds from the start of the buffer. */
  at: number;
  ms: number;
}

export interface RadioSpec {
  tones: readonly RadioTone[];
  /** Squelch noise after the last tone, in milliseconds. */
  squelchMs: number;
  squelchLevel: number;
}

const EDGE_SECONDS = 0.004;
const GRIT = 1.6;
const BAND_LOW_HZ = 300;
const BAND_HIGH_HZ = 3000;
const TAIL_SECONDS = 0.01;
const VIBRATO_HZ = 31;
const VIBRATO_DEPTH = 0.004;

const endOf = (tone: RadioTone): number => (tone.at + tone.ms) / 1000;

/** One take of a chirp, peaking at 1; the squelch differs from take to take. */
export const renderRadio = (
  context: BaseAudioContext,
  spec: RadioSpec
): AudioBuffer => {
  const rate = context.sampleRate;
  const tonesEnd = Math.max(...spec.tones.map(endOf));
  const squelch = spec.squelchMs / 1000;
  const length = Math.ceil((tonesEnd + squelch + TAIL_SECONDS) * rate);
  const buffer = context.createBuffer(1, length, rate);
  const samples = buffer.getChannelData(0);

  for (const tone of spec.tones) {
    const start = Math.floor((tone.at / 1000) * rate);
    const count = Math.floor((tone.ms / 1000) * rate);
    const edge = EDGE_SECONDS * rate;
    for (let index = 0; index < count; index += 1) {
      const time = index / rate;
      const ramp = Math.min(1, index / edge, (count - index) / edge);
      const shape = 0.5 - 0.5 * Math.cos(Math.PI * ramp);
      const wobble =
        (VIBRATO_DEPTH * Math.sin(2 * Math.PI * VIBRATO_HZ * time)) /
        (2 * Math.PI * VIBRATO_HZ);
      // A small speaker driven hard: the tone is squared off a little.
      samples[start + index] +=
        shape *
        Math.tanh(GRIT * Math.sin(2 * Math.PI * tone.hz * (time + wobble)));
    }
  }

  const squelchStart = Math.floor(tonesEnd * rate);
  const squelchCount = Math.floor(squelch * rate);
  for (let index = 0; index < squelchCount; index += 1) {
    const fall = (1 - index / squelchCount) ** 2;
    const rise = Math.min(1, index / (EDGE_SECONDS * rate));
    samples[squelchStart + index] +=
      spec.squelchLevel * fall * rise * (Math.random() * 2 - 1);
  }

  const low = 1 - Math.exp((-2 * Math.PI * BAND_LOW_HZ) / rate);
  const high = 1 - Math.exp((-2 * Math.PI * BAND_HIGH_HZ) / rate);
  let below = 0;
  let within = 0;
  let within2 = 0;
  let peak = 0;
  for (let index = 0; index < length; index += 1) {
    below += low * (samples[index] - below);
    within += high * (samples[index] - below - within);
    within2 += high * (within - within2);
    samples[index] = within2;
    peak = Math.max(peak, Math.abs(within2));
  }
  for (let index = 0; index < length; index += 1) {
    samples[index] /= peak || 1;
  }
  return buffer;
};

/** Channel open: D6 then G6, "tu-dut". */
export const RADIO_ON: RadioSpec = {
  squelchLevel: 0.35,
  squelchMs: 45,
  tones: [
    { at: 0, hz: 1175, ms: 46 },
    { at: 62, hz: 1568, ms: 64 },
  ],
};

/** Channel closed: one lower, shorter tone. */
export const RADIO_OFF: RadioSpec = {
  squelchLevel: 0.4,
  squelchMs: 60,
  tones: [{ at: 0, hz: 988, ms: 52 }],
};
