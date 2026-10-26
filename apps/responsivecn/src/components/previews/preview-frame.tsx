import { useIsMobile } from "@portfolio/ui/hooks/use-mobile";
import type * as React from "react";

export const previewInputClassName =
  "h-9 rounded-md border border-input bg-transparent px-3 text-sm font-normal outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

// The bordered box and breakpoint caption shared by the docs examples.
export const PreviewFrame = ({
  desktop,
  mobile,
  children,
}: {
  desktop: string;
  mobile: string;
  children: React.ReactNode;
}) => {
  const isMobile = useIsMobile();

  return (
    <div className="not-prose flex flex-col items-center gap-4 rounded-xl border p-10">
      {children}
      <p className="text-muted-foreground text-xs">
        {isMobile ? mobile : desktop}
      </p>
    </div>
  );
};
