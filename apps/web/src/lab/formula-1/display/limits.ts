// Temperature windows the dash colours its cells by, and the reference the
// main page counts tyre degrees from [INV]. The tyre window matches the grip
// model's 85–115 °C.

export const TYRE_REFERENCE_C = 85;
export const TYRE_WINDOW_C = { from: 85, to: 115 };
export const BRAKE_WINDOW_C = { from: 400, to: 950 };

export const windowFill = (
  value: number,
  range: { from: number; to: number }
): "cold" | "ok" | "hot" => {
  if (value < range.from) {
    return "cold";
  }
  return value > range.to ? "hot" : "ok";
};
