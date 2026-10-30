import type { ReactNode } from "react";

/** A key phrase in body prose, lifted to `foreground`. */
export const Emphasis = ({ children }: { children: ReactNode }) => (
  <span className="text-foreground">{children}</span>
);
