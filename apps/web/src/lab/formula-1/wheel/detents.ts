import { useState } from "react";

const wrapIndex = (position: number, count: number): number =>
  ((Math.round(position) % count) + count) % count;

const stepBetween = (
  from: number,
  to: number,
  count: number,
  wrap: boolean
): number => {
  if (!wrap) {
    return to - from;
  }
  const step = wrapIndex(to - from, count);
  return step > count / 2 ? step - count : step;
};

export interface Detents {
  min: number;
  max: number;
  /** The slider's value: the detent's own value, on whichever turn the gesture is on. */
  value: number;
  /** A position that only ever moves by the shortest step, for the drum and knob to roll. */
  roll: number;
  /** The index, from 0, a slider value lands on. */
  indexOf: (value: number) => number;
  /** Takes a slider value and returns the index it lands on. */
  change: (value: number) => number;
  /** A gesture ended: the next one starts on the middle turn again. */
  commit: () => void;
}

/*
 * An endless encoder isn't a slider: a wrapping one spans three turns and every
 * gesture starts on the middle one, so a drag or a key rolls on past the last
 * detent to the first and back, while Home and End still land on the ends.
 */
export const useDetents = (
  count: number,
  wrap: boolean,
  index: number,
  /** The value of the first detent, so the slider (and an agent) speaks in real values. */
  first = 0
): Detents => {
  const [turns, setTurns] = useState(0);
  const [roll, setRoll] = useState({ index, position: index });
  if (roll.index !== index) {
    setRoll({
      index,
      position: roll.position + stepBetween(roll.index, index, count, wrap),
    });
  }

  const min = first + (wrap ? -count : 0);
  const max = first + (wrap ? count * 2 - 1 : count - 1);
  const value = first + index + turns * count;
  const indexOf = (next: number): number =>
    wrap
      ? wrapIndex(next - first, count)
      : Math.min(Math.max(Math.round(next - first), 0), count - 1);

  return {
    change: (next) => {
      const landed = indexOf(next);
      if (wrap) {
        setTurns(Math.round((next - first - landed) / count));
      }
      return landed;
    },
    commit: () => setTurns(0),
    indexOf,
    max,
    min,
    roll: roll.position,
    value,
  };
};
