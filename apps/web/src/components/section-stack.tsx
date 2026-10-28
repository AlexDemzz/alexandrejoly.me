import type { ReactNode } from "react";

// DESIGN.md › Site › Layout: sections 48px apart, 64px from the header and the
// footer once the header's pb-6 and the footer's pt-10 are counted. Its
// sections take `spacing="none"`.
export const SectionStack = ({ children }: { children: ReactNode }) => (
  <div className="mt-10 mb-6 flex flex-col gap-12">{children}</div>
);
