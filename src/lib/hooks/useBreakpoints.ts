"use client";
import useWindowSize from "./useWindowSize";
import { BREAKPOINTS } from "../constants";
import { BreakpointsT } from "../types";

export default function useBreakpoints() {
  const { width } = useWindowSize();

  const withBreakpoints = (val: BreakpointsT, width: number | undefined) => {
    if (typeof val === "object" && width) {
      if (val["2xl"] !== undefined && width >= BREAKPOINTS["2xl"])
        return val.xl;
      if (val.xl !== undefined && width >= BREAKPOINTS.xl) return val.xl;
      if (val.lg !== undefined && width >= BREAKPOINTS.lg) return val.lg;
      if (val.md !== undefined && width >= BREAKPOINTS.md) return val.md;
      if (val.sm !== undefined && width >= BREAKPOINTS.sm) return val.sm;
      return val.xs;
    }
    return val;
  };

  return { get: (val: BreakpointsT) => withBreakpoints(val, width) };
}
