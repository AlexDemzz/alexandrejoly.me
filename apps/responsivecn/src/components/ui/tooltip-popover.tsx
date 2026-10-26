"use client";

import * as React from "react";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

type Override<Props, Keys extends PropertyKey = never> = Props extends unknown
  ? Omit<Props, "children" | Keys>
  : never;

const ROOT_CALLBACKS = ["onOpenChange", "onOpenChangeComplete"];

function mergeClassNames(shared: unknown, override: unknown): unknown {
  if (shared == null) return override;
  if (override == null) return shared;
  if (typeof shared === "string" && typeof override === "string") {
    return cn(shared, override);
  }
  const resolve = (value: unknown, state: unknown) =>
    typeof value === "function"
      ? (value as (state: unknown) => string | undefined)(state)
      : (value as string | undefined);
  return (state: unknown) =>
    cn(resolve(shared, state), resolve(override, state));
}

function composeRootCallbacks(shared: object, override: object | undefined) {
  const sharedProps = shared as Record<string, unknown>;
  const overrideProps = (override ?? {}) as Record<string, unknown>;
  const composed: Record<string, unknown> = {};
  for (const key of ROOT_CALLBACKS) {
    const sharedCallback = sharedProps[key];
    const overrideCallback = overrideProps[key];
    if (
      typeof sharedCallback === "function" &&
      typeof overrideCallback === "function"
    ) {
      composed[key] = (...args: unknown[]) => {
        sharedCallback(...args);
        overrideCallback(...args);
      };
    }
  }
  return composed;
}

function omitKeys(props: object, keys: readonly string[]) {
  const rest: Record<string, unknown> = { ...props };
  for (const key of keys) delete rest[key];
  return rest;
}

function toMobileRootProps<Props extends object>(
  shared: object,
  override: object | undefined,
  desktopOnly: readonly string[] = []
) {
  const forwarded = omitKeys(shared, desktopOnly);
  return {
    ...forwarded,
    ...override,
    ...composeRootCallbacks(forwarded, override),
  } as Props;
}

function toMobileProps<Props extends object>(
  shared: object,
  override: Props | undefined,
  desktopOnly: readonly string[] = []
) {
  const forwarded = omitKeys(shared, desktopOnly);
  const overrideProps: Record<string, unknown> = { ...override };
  const className = mergeClassNames(
    forwarded.className,
    overrideProps.className
  );
  return {
    ...forwarded,
    ...overrideProps,
    ...(className === undefined ? {} : { className }),
  } as Props;
}

function callOpenChange(handler: unknown, args: unknown[]) {
  if (typeof handler === "function") handler(...args);
  const details = args[1] as { isCanceled?: boolean } | undefined;
  return details?.isCanceled !== true;
}

function isDisabled(props: object) {
  return (props as { disabled?: unknown }).disabled === true;
}

function nativeButtonFor(props: object) {
  const { render } = props as { render?: unknown };
  if (
    React.isValidElement(render) &&
    typeof render.type === "string" &&
    render.type !== "button"
  ) {
    return { nativeButton: false };
  }
  return {};
}

const ROOT_DESKTOP_ONLY = [
  "handle",
  "triggerId",
  "defaultTriggerId",
  "disabled",
  "trackCursorAxis",
  "disableHoverablePopup",
  "delayDuration",
  "disableHoverableContent",
];

const TRIGGER_DESKTOP_ONLY = [
  "handle",
  "payload",
  "disabled",
  "delay",
  "closeDelay",
  "closeOnClick",
];

const TooltipPopoverContext = React.createContext<{
  isMobile: boolean;
  triggerDisabledRef: React.RefObject<boolean>;
} | null>(null);

function useTooltipPopover() {
  const context = React.useContext(TooltipPopoverContext);

  if (!context) {
    throw new Error(
      "TooltipPopover parts must be used within a TooltipPopover."
    );
  }

  return context;
}

type TooltipPopoverProps = React.ComponentProps<typeof Tooltip> & {
  popover?: Override<
    React.ComponentProps<typeof Popover>,
    "open" | "defaultOpen" | "handle" | "triggerId" | "defaultTriggerId"
  >;
};

function TooltipPopover({
  popover,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  children,
  ...props
}: TooltipPopoverProps) {
  const isMobile = useIsMobile();
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen);
  const triggerDisabledRef = React.useRef(false);
  const open = openProp ?? uncontrolledOpen;
  const disabled = isDisabled(props);
  const contextValue = React.useMemo(
    () => ({ isMobile, triggerDisabledRef }),
    [isMobile]
  );

  const handleOpenChange = React.useCallback(
    (nextOpen: boolean, ...details: unknown[]) => {
      const blocked = disabled || triggerDisabledRef.current;
      if (nextOpen && isMobile && blocked) return;
      if (callOpenChange(onOpenChange, [nextOpen, ...details])) {
        setUncontrolledOpen(nextOpen);
      }
    },
    [disabled, isMobile, onOpenChange]
  );

  return (
    <TooltipPopoverContext.Provider value={contextValue}>
      {isMobile ? (
        <Popover
          {...toMobileRootProps<React.ComponentProps<typeof Popover>>(
            {
              ...props,
              open: open && !disabled,
              onOpenChange: handleOpenChange,
            },
            popover,
            ROOT_DESKTOP_ONLY
          )}
        >
          {children}
        </Popover>
      ) : (
        <Tooltip {...props} open={open} onOpenChange={handleOpenChange}>
          {children}
        </Tooltip>
      )}
    </TooltipPopoverContext.Provider>
  );
}

type TooltipPopoverTriggerProps = Omit<
  React.ComponentProps<typeof TooltipTrigger>,
  "popover"
> & {
  popover?: Override<
    React.ComponentProps<typeof PopoverTrigger>,
    "handle" | "payload"
  >;
};

function TooltipPopoverTrigger({
  popover,
  ...props
}: TooltipPopoverTriggerProps) {
  const context = React.useContext(TooltipPopoverContext);
  const triggerDisabledRef = context?.triggerDisabledRef;
  const disabled = isDisabled(props);

  React.useEffect(() => {
    if (!triggerDisabledRef) return;
    triggerDisabledRef.current = disabled;
    return () => {
      triggerDisabledRef.current = false;
    };
  }, [disabled, triggerDisabledRef]);

  if (context?.isMobile) {
    return (
      <PopoverTrigger
        {...toMobileProps(
          { ...nativeButtonFor(props), ...props },
          popover,
          TRIGGER_DESKTOP_ONLY
        )}
      />
    );
  }
  return <TooltipTrigger {...props} />;
}

type TooltipPopoverContentProps = Omit<
  React.ComponentProps<typeof TooltipContent>,
  "popover"
> & {
  popover?: Override<React.ComponentProps<typeof PopoverContent>>;
};

function TooltipPopoverContent({
  popover,
  ...props
}: TooltipPopoverContentProps) {
  const { isMobile } = useTooltipPopover();

  if (isMobile) {
    return <PopoverContent {...toMobileProps(props, popover)} />;
  }
  return <TooltipContent {...props} />;
}

export { TooltipPopover, TooltipPopoverContent, TooltipPopoverTrigger };
