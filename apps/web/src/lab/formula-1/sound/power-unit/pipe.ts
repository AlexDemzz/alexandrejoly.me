/** A delay line read at a fractional distance behind its write head. */
export class Pipe {
  private readonly line: Float32Array;
  private head = 0;

  constructor(size: number) {
    this.line = new Float32Array(size);
  }

  /** `samples` must stay under the line's size minus one. */
  read(samples: number): number {
    const { line } = this;
    const whole = Math.trunc(samples);
    const share = samples - whole;
    let at = this.head - whole;
    if (at < 0) {
      at += line.length;
    }
    const near = line[at];
    const far = line[at === 0 ? line.length - 1 : at - 1];
    return near + (far - near) * share;
  }

  write(value: number): void {
    this.head = this.head + 1 === this.line.length ? 0 : this.head + 1;
    this.line[this.head] = value;
  }
}
