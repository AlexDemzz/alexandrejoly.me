"use client";

import * as React from "react";

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
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

const SIDE_TO_DRAWER_EDGE = new Map<unknown, object>([
  ["top", { swipeDirection: "up", direction: "top" }],
  ["right", { swipeDirection: "right", direction: "right" }],
  ["bottom", { swipeDirection: "down", direction: "bottom" }],
  ["left", { swipeDirection: "left", direction: "left" }],
]);

const ROOT_DESKTOP_ONLY = ["handle", "triggerId", "defaultTriggerId"];

const TRIGGER_DESKTOP_ONLY = ["handle", "payload"];

const CONTENT_DESKTOP_ONLY = ["side", "showCloseButton"];

type SheetDrawerContextValue = {
  isMobile: boolean;
  setSide: (side: unknown) => void;
};

const SheetDrawerContext = React.createContext<SheetDrawerContextValue | null>(
  null
);

function useSheetDrawer() {
  const context = React.useContext(SheetDrawerContext);

  if (!context) {
    throw new Error("SheetDrawer parts must be used within a SheetDrawer.");
  }

  return context;
}

type SheetDrawerProps = React.ComponentProps<typeof Sheet> & {
  drawer?: Override<
    React.ComponentProps<typeof Drawer>,
    "open" | "defaultOpen" | "handle" | "triggerId" | "defaultTriggerId"
  >;
};

function SheetDrawer({
  drawer,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  children,
  ...props
}: SheetDrawerProps) {
  const isMobile = useIsMobile();
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen);
  const [side, setSide] = React.useState<unknown>();
  const open = openProp ?? uncontrolledOpen;
  const contextValue = React.useMemo(() => ({ isMobile, setSide }), [isMobile]);

  const handleOpenChange = React.useCallback(
    (nextOpen: boolean, ...details: unknown[]) => {
      if (callOpenChange(onOpenChange, [nextOpen, ...details])) {
        setUncontrolledOpen(nextOpen);
      }
    },
    [onOpenChange]
  );

  return (
    <SheetDrawerContext.Provider value={contextValue}>
      {isMobile ? (
        <Drawer
          {...toMobileRootProps<React.ComponentProps<typeof Drawer>>(
            {
              autoFocus: true,
              ...SIDE_TO_DRAWER_EDGE.get(side),
              ...props,
              open,
              onOpenChange: handleOpenChange,
            },
            drawer,
            ROOT_DESKTOP_ONLY
          )}
        >
          {children}
        </Drawer>
      ) : (
        <Sheet {...props} open={open} onOpenChange={handleOpenChange}>
          {children}
        </Sheet>
      )}
    </SheetDrawerContext.Provider>
  );
}

type SheetDrawerTriggerProps = React.ComponentProps<typeof SheetTrigger> & {
  drawer?: Override<
    React.ComponentProps<typeof DrawerTrigger>,
    "handle" | "payload"
  >;
};

function SheetDrawerTrigger({ drawer, ...props }: SheetDrawerTriggerProps) {
  const context = React.useContext(SheetDrawerContext);

  if (context?.isMobile) {
    return (
      <DrawerTrigger {...toMobileProps(props, drawer, TRIGGER_DESKTOP_ONLY)} />
    );
  }
  return <SheetTrigger {...props} />;
}

type SheetDrawerContentProps = React.ComponentProps<typeof SheetContent> & {
  drawer?: Override<React.ComponentProps<typeof DrawerContent>>;
};

function SheetDrawerContent({
  drawer,
  children,
  ...props
}: SheetDrawerContentProps) {
  const { isMobile, setSide } = useSheetDrawer();
  const { side } = props;

  React.useEffect(() => {
    setSide(side);
    return () => setSide(undefined);
  }, [side, setSide]);

  if (isMobile) {
    return (
      <DrawerContent {...toMobileProps(props, drawer, CONTENT_DESKTOP_ONLY)}>
        {children}
      </DrawerContent>
    );
  }
  return <SheetContent {...props}>{children}</SheetContent>;
}

type SheetDrawerHeaderProps = React.ComponentProps<typeof SheetHeader> & {
  drawer?: Override<React.ComponentProps<typeof DrawerHeader>>;
};

function SheetDrawerHeader({ drawer, ...props }: SheetDrawerHeaderProps) {
  const { isMobile } = useSheetDrawer();

  if (isMobile) {
    return <DrawerHeader {...toMobileProps(props, drawer)} />;
  }
  return <SheetHeader {...props} />;
}

type SheetDrawerFooterProps = React.ComponentProps<typeof SheetFooter> & {
  drawer?: Override<React.ComponentProps<typeof DrawerFooter>>;
};

function SheetDrawerFooter({ drawer, ...props }: SheetDrawerFooterProps) {
  const { isMobile } = useSheetDrawer();

  if (isMobile) {
    return <DrawerFooter {...toMobileProps(props, drawer)} />;
  }
  return <SheetFooter {...props} />;
}

type SheetDrawerTitleProps = React.ComponentProps<typeof SheetTitle> & {
  drawer?: Override<React.ComponentProps<typeof DrawerTitle>>;
};

function SheetDrawerTitle({ drawer, ...props }: SheetDrawerTitleProps) {
  const { isMobile } = useSheetDrawer();

  if (isMobile) {
    return <DrawerTitle {...toMobileProps(props, drawer)} />;
  }
  return <SheetTitle {...props} />;
}

type SheetDrawerDescriptionProps = React.ComponentProps<
  typeof SheetDescription
> & {
  drawer?: Override<React.ComponentProps<typeof DrawerDescription>>;
};

function SheetDrawerDescription({
  drawer,
  ...props
}: SheetDrawerDescriptionProps) {
  const { isMobile } = useSheetDrawer();

  if (isMobile) {
    return <DrawerDescription {...toMobileProps(props, drawer)} />;
  }
  return <SheetDescription {...props} />;
}

type SheetDrawerCloseProps = React.ComponentProps<typeof SheetClose> & {
  drawer?: Override<React.ComponentProps<typeof DrawerClose>>;
};

function SheetDrawerClose({ drawer, ...props }: SheetDrawerCloseProps) {
  const { isMobile } = useSheetDrawer();

  if (isMobile) {
    return <DrawerClose {...toMobileProps(props, drawer)} />;
  }
  return <SheetClose {...props} />;
}

export {
  SheetDrawer,
  SheetDrawerClose,
  SheetDrawerContent,
  SheetDrawerDescription,
  SheetDrawerFooter,
  SheetDrawerHeader,
  SheetDrawerTitle,
  SheetDrawerTrigger,
};
