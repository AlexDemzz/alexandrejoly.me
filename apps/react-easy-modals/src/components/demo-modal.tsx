import { cn } from "@portfolio/ui/lib/utils";
import type { ComponentProps, ReactNode } from "react";

// Shared look for the hand-rolled demo modals: react-easy-modals is headless,
// so each demo draws its own backdrop and panel.

export function DemoBackdrop({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "animate-in fade-in-0 fixed inset-0 z-50 grid place-items-center bg-black/40 p-4 duration-150",
        className
      )}
      {...props}
    />
  );
}

export function DemoPanel({
  title,
  children,
  actions,
  className,
  ...props
}: Omit<ComponentProps<"div">, "title"> & {
  title: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      className={cn(
        "bg-popover text-popover-foreground ring-border animate-in fade-in-0 zoom-in-95 flex w-full max-w-xs flex-col gap-3 rounded-xl p-5 shadow-lg ring-1 duration-150",
        className
      )}
      {...props}
    >
      <strong className="text-foreground font-medium">{title}</strong>
      {children}
      {actions && <div className="mt-1 flex justify-end gap-2">{actions}</div>}
    </div>
  );
}

export function DemoOutput({ className, ...props }: ComponentProps<"code">) {
  return (
    <code
      className={cn(
        "text-muted-foreground max-w-full overflow-x-auto font-mono",
        className
      )}
      {...props}
    />
  );
}
