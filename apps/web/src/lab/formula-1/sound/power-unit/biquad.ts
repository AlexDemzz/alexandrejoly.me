const TWO_PI = 2 * Math.PI;

/** A second-order filter (RBJ cookbook), direct form 1. */
export class Biquad {
  private b0 = 1;
  private b1 = 0;
  private b2 = 0;
  private a1 = 0;
  private a2 = 0;
  private x1 = 0;
  private x2 = 0;
  private y1 = 0;
  private y2 = 0;

  private set(
    b0: number,
    b1: number,
    b2: number,
    a: readonly [number, number, number]
  ): this {
    const [a0, a1, a2] = a;
    this.b0 = b0 / a0;
    this.b1 = b1 / a0;
    this.b2 = b2 / a0;
    this.a1 = a1 / a0;
    this.a2 = a2 / a0;
    return this;
  }

  lowpass(hz: number, q: number, rate: number): this {
    const w = (TWO_PI * hz) / rate;
    const alpha = Math.sin(w) / (2 * q);
    const cos = Math.cos(w);
    return this.set((1 - cos) / 2, 1 - cos, (1 - cos) / 2, [
      1 + alpha,
      -2 * cos,
      1 - alpha,
    ]);
  }

  highpass(hz: number, q: number, rate: number): this {
    const w = (TWO_PI * hz) / rate;
    const alpha = Math.sin(w) / (2 * q);
    const cos = Math.cos(w);
    return this.set((1 + cos) / 2, -(1 + cos), (1 + cos) / 2, [
      1 + alpha,
      -2 * cos,
      1 - alpha,
    ]);
  }

  bandpass(hz: number, q: number, rate: number): this {
    const w = (TWO_PI * hz) / rate;
    const alpha = Math.sin(w) / (2 * q);
    return this.set(alpha, 0, -alpha, [1 + alpha, -2 * Math.cos(w), 1 - alpha]);
  }

  peaking(hz: number, q: number, db: number, rate: number): this {
    const w = (TWO_PI * hz) / rate;
    const gain = 10 ** (db / 40);
    const alpha = Math.sin(w) / (2 * q);
    const cos = Math.cos(w);
    return this.set(1 + alpha * gain, -2 * cos, 1 - alpha * gain, [
      1 + alpha / gain,
      -2 * cos,
      1 - alpha / gain,
    ]);
  }

  run(x: number): number {
    const y =
      this.b0 * x +
      this.b1 * this.x1 +
      this.b2 * this.x2 -
      this.a1 * this.y1 -
      this.a2 * this.y2;
    this.x2 = this.x1;
    this.x1 = x;
    this.y2 = this.y1;
    this.y1 = y;
    return y;
  }
}
