"use client";

import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@portfolio/ui/components/drawer";
import * as PopoverParts from "@portfolio/ui/components/popover";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@portfolio/ui/components/popover";
import { useIsMobile } from "@portfolio/ui/hooks/use-mobile";
import { cn } from "@portfolio/ui/lib/utils";
import * as React from "react";

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
  override: Props | undefined,
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

function readExport(parts: object, name: string) {
  return (parts as Record<string, React.ElementType | undefined>)[name];
}

const PopoverAnchor = readExport(PopoverParts, "PopoverAnchor");

const ROOT_DESKTOP_ONLY = ["handle", "triggerId", "defaultTriggerId"];

const TRIGGER_DESKTOP_ONLY = [
  "handle",
  "payload",
  "openOnHover",
  "delay",
  "closeDelay",
];

const CONTENT_DESKTOP_ONLY = [
  "side",
  "align",
  "sideOffset",
  "alignOffset",
  "avoidCollisions",
  "collisionBoundary",
  "collisionPadding",
  "arrowPadding",
  "sticky",
  "hideWhenDetached",
  "updatePositionStrategy",
];

const PopoverDrawerContext = React.createContext<{ isMobile: boolean } | null>(
  null
);

function usePopoverDrawer() {
  const context = React.useContext(PopoverDrawerContext);

  if (!context) {
    throw new Error("PopoverDrawer parts must be used within a PopoverDrawer.");
  }

  return context;
}

type PopoverDrawerProps = React.ComponentProps<typeof Popover> & {
  drawer?: Override<
    React.ComponentProps<typeof Drawer>,
    "open" | "defaultOpen" | "handle" | "triggerId" | "defaultTriggerId"
  >;
};

function PopoverDrawer({
  drawer,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  children,
  ...props
}: PopoverDrawerProps) {
  const isMobile = useIsMobile();
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen);
  const open = openProp ?? uncontrolledOpen;
  const contextValue = React.useMemo(() => ({ isMobile }), [isMobile]);

  const handleOpenChange = React.useCallback(
    (nextOpen: boolean, ...details: unknown[]) => {
      if (callOpenChange(onOpenChange, [nextOpen, ...details])) {
        setUncontrolledOpen(nextOpen);
      }
    },
    [onOpenChange]
  );

  return (
    <PopoverDrawerContext.Provider value={contextValue}>
      {isMobile ? (
        <Drawer
          {...toMobileRootProps<React.ComponentProps<typeof Drawer>>(
            { autoFocus: true, ...props, open, onOpenChange: handleOpenChange },
            drawer,
            ROOT_DESKTOP_ONLY
          )}
        >
          {children}
        </Drawer>
      ) : (
        <Popover {...props} open={open} onOpenChange={handleOpenChange}>
          {children}
        </Popover>
      )}
    </PopoverDrawerContext.Provider>
  );
}

type PopoverDrawerTriggerProps = React.ComponentProps<typeof PopoverTrigger> & {
  drawer?: Override<
    React.ComponentProps<typeof DrawerTrigger>,
    "handle" | "payload"
  >;
};

function PopoverDrawerTrigger({ drawer, ...props }: PopoverDrawerTriggerProps) {
  const context = React.useContext(PopoverDrawerContext);

  if (context?.isMobile) {
    return (
      <DrawerTrigger {...toMobileProps(props, drawer, TRIGGER_DESKTOP_ONLY)} />
    );
  }
  return <PopoverTrigger {...props} />;
}

type PopoverDrawerAnchorProps = typeof PopoverParts extends {
  PopoverAnchor: infer Anchor extends React.ElementType;
}
  ? React.ComponentProps<Anchor>
  : never;

function PopoverDrawerAnchor(props: PopoverDrawerAnchorProps) {
  const { isMobile } = usePopoverDrawer();
  const anchorProps = props as React.ComponentProps<"div"> & {
    asChild?: boolean;
  };

  if (!isMobile && PopoverAnchor) {
    return <PopoverAnchor {...anchorProps} />;
  }

  const { asChild, children, ...rest } = anchorProps;

  if (asChild && React.isValidElement<React.ComponentProps<"div">>(children)) {
    const childProps: React.ComponentProps<"div"> = children.props;
    return React.cloneElement(children, {
      ...rest,
      ...childProps,
      className: cn(rest.className, childProps.className),
    });
  }
  return (
    <div data-slot="popover-anchor" {...rest}>
      {children}
    </div>
  );
}

type PopoverDrawerContentProps = React.ComponentProps<typeof PopoverContent> & {
  drawer?: Override<React.ComponentProps<typeof DrawerContent>>;
};

function PopoverDrawerContent({
  drawer,
  children,
  ...props
}: PopoverDrawerContentProps) {
  const { isMobile } = usePopoverDrawer();

  if (isMobile) {
    const { className } = props as { className?: unknown };
    const bodyClassName = typeof className === "string" ? className : undefined;
    const desktopOnly =
      bodyClassName === undefined
        ? CONTENT_DESKTOP_ONLY
        : [...CONTENT_DESKTOP_ONLY, "className"];

    return (
      <DrawerContent {...toMobileProps(props, drawer, desktopOnly)}>
        <div
          data-slot="popover-drawer-body"
          className={cn(
            "mx-auto flex min-h-0 w-full flex-1 flex-col gap-2.5 overflow-y-auto p-4",
            bodyClassName
          )}
        >
          {children}
        </div>
      </DrawerContent>
    );
  }
  return <PopoverContent {...props}>{children}</PopoverContent>;
}

type PopoverDrawerHeaderProps = React.ComponentProps<typeof PopoverHeader> & {
  drawer?: Override<React.ComponentProps<typeof DrawerHeader>>;
};

function PopoverDrawerHeader({
  drawer,
  className,
  ...props
}: PopoverDrawerHeaderProps) {
  const { isMobile } = usePopoverDrawer();

  if (isMobile) {
    return (
      <DrawerHeader
        {...toMobileProps(
          { className: cn("p-0", className), ...props },
          drawer
        )}
      />
    );
  }
  return <PopoverHeader className={className} {...props} />;
}

type PopoverDrawerFooterProps = React.ComponentProps<"div"> & {
  drawer?: Override<React.ComponentProps<typeof DrawerFooter>>;
};

function PopoverDrawerFooter({
  drawer,
  className,
  ...props
}: PopoverDrawerFooterProps) {
  const { isMobile } = usePopoverDrawer();

  if (isMobile) {
    return (
      <DrawerFooter
        {...toMobileProps(
          { className: cn("p-0", className), ...props },
          drawer
        )}
      />
    );
  }
  return (
    <div
      data-slot="popover-footer"
      className={cn("flex justify-end gap-2", className)}
      {...props}
    />
  );
}

type PopoverDrawerTitleProps = React.ComponentProps<typeof PopoverTitle> & {
  drawer?: Override<React.ComponentProps<typeof DrawerTitle>>;
};

function PopoverDrawerTitle({ drawer, ...props }: PopoverDrawerTitleProps) {
  const { isMobile } = usePopoverDrawer();

  if (isMobile) {
    return <DrawerTitle {...toMobileProps(props, drawer)} />;
  }
  return <PopoverTitle {...props} />;
}

type PopoverDrawerDescriptionProps = React.ComponentProps<
  typeof PopoverDescription
> & {
  drawer?: Override<React.ComponentProps<typeof DrawerDescription>>;
};

function PopoverDrawerDescription({
  drawer,
  ...props
}: PopoverDrawerDescriptionProps) {
  const { isMobile } = usePopoverDrawer();

  if (isMobile) {
    return <DrawerDescription {...toMobileProps(props, drawer)} />;
  }
  return <PopoverDescription {...props} />;
}

export {
  PopoverDrawer,
  PopoverDrawerAnchor,
  PopoverDrawerContent,
  PopoverDrawerDescription,
  PopoverDrawerFooter,
  PopoverDrawerHeader,
  PopoverDrawerTitle,
  PopoverDrawerTrigger,
};
