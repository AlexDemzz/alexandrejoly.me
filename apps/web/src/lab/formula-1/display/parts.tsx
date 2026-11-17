import {
  Meter,
  MeterIndicator,
  MeterLabel,
  MeterTrack,
  MeterValue,
} from "@ui-sdk/react/meter";
import type { CSSProperties, ReactNode } from "react";

import { NOTHING } from "./format";

/** The flat fills of the 2025 dash, plus the temperature-window and DRS fills. */
export type Fill =
  | "black"
  | "grey"
  | "steel"
  | "green"
  | "red"
  | "yellow"
  | "cold"
  | "ok"
  | "hot"
  | "open";

interface CellProps {
  /** Where the cell sits in its page's grid areas. */
  area?: string;
  children: ReactNode;
  fill?: Fill;
}

/** One flat block of the dash. */
export const Cell = ({ area, children, fill = "black" }: CellProps) => (
  <div data-area={area} data-fill={fill} data-slot="dash-cell">
    {children}
  </div>
);

export const CellLabel = ({ children }: { children: ReactNode }) => (
  <span data-slot="dash-label">{children}</span>
);

export type Ink = "white" | "black" | "red" | "green" | "blue";

interface CellValueProps {
  children: ReactNode;
  ink?: Ink;
  /** Height of the figures as a share of the screen height, in `cqh`. */
  size: number;
}

export const CellValue = ({ children, ink, size }: CellValueProps) => (
  <span
    data-ink={ink}
    data-slot="dash-value"
    style={{ "--size": size } as CSSProperties}
  >
    {children}
  </span>
);

interface ReadingProps {
  /** Spoken before the value, e.g. "Last lap". */
  name: string;
  ink?: Ink;
  size: number;
  /** null when the car can't give the reading: the cell shows a dash. */
  value: string | null;
}

/** A figure with its spoken name, or a dash when there is none. */
export const Reading = ({ ink, name, size, value }: ReadingProps) => (
  <CellValue ink={ink} size={size}>
    <span className="sr-only">
      {value === null ? `${name}: none` : `${name} `}
    </span>
    {value === null ? <span aria-hidden>{NOTHING}</span> : <span>{value}</span>}
  </CellValue>
);

interface GaugeProps {
  /** The bar's colour. */
  fill?: Fill;
  format: (value: number) => string;
  label: string;
  max: number;
  /** Fills the bar from the end, e.g. harvest facing deploy. */
  mirrored?: boolean;
  value: number;
}

/** A labelled bar for a reading in a range, on ui-sdk's Meter. */
export const Gauge = ({
  fill = "green",
  format,
  label,
  max,
  mirrored = false,
  value,
}: GaugeProps) => (
  <Meter
    data-fill={fill}
    data-mirrored={mirrored ? "" : undefined}
    format={format}
    max={max}
    value={value}
  >
    <MeterLabel>{label}</MeterLabel>
    <MeterValue />
    <MeterTrack>
      <MeterIndicator />
    </MeterTrack>
  </Meter>
);
