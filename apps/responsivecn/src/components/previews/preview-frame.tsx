import { Preview } from "@portfolio/ui/components/preview";
import { useIsMobile } from "@portfolio/ui/hooks/use-mobile";
import type * as React from "react";

// The design system's Preview card and the breakpoint caption shared by the
// docs examples.
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
    <Preview>
      <div className="flex flex-col items-center gap-4">
        {children}
        <p className="text-muted-foreground text-center text-xs">
          {isMobile ? mobile : desktop}
        </p>
      </div>
    </Preview>
  );
};
