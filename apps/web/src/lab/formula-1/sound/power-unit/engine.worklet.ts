// The power unit's AudioWorklet: the model runs on the audio thread, driven by
// one k-rate AudioParam per input.

import { INPUT_NAMES, PROCESSOR_NAME, PowerUnit } from "./model";

declare const sampleRate: number;
declare const AudioWorkletProcessor: new () => object;
declare const registerProcessor: (
  name: string,
  processor: new () => object
) => void;

class PowerUnitProcessor extends AudioWorkletProcessor {
  static get parameterDescriptors() {
    return INPUT_NAMES.map((name) => ({
      automationRate: "k-rate",
      defaultValue: 0,
      name,
    }));
  }

  private readonly unit = new PowerUnit(sampleRate);
  private started = false;

  process(
    _inputs: Float32Array[][],
    outputs: Float32Array[][],
    parameters: Record<string, Float32Array>
  ): boolean {
    const { inputs } = this.unit;
    for (const name of INPUT_NAMES) {
      [inputs[name]] = parameters[name];
    }
    this.started ||= inputs.running > 0.5;
    this.unit.render(outputs[0][0]);
    // An engine that ran and was stopped lets go of its processor once it has faded out.
    return !(this.started && this.unit.silent);
  }
}

registerProcessor(PROCESSOR_NAME, PowerUnitProcessor);
