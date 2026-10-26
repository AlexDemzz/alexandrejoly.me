"use client";

import { buttonVariants } from "@portfolio/ui/components/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@portfolio/ui/components/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@portfolio/ui/components/drawer";
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

const ROOT_DESKTOP_ONLY = ["handle", "triggerId", "defaultTriggerId"];

const TRIGGER_DESKTOP_ONLY = ["handle", "payload"];

const CONTENT_DESKTOP_ONLY = ["showCloseButton"];

const DialogDrawerContext = React.createContext<{ isMobile: boolean } | null>(
  null
);

function useDialogDrawer() {
  const context = React.useContext(DialogDrawerContext);

  if (!context) {
    throw new Error("DialogDrawer parts must be used within a DialogDrawer.");
  }

  return context;
}

type DialogDrawerProps = React.ComponentProps<typeof Dialog> & {
  drawer?: Override<
    React.ComponentProps<typeof Drawer>,
    "open" | "defaultOpen" | "handle" | "triggerId" | "defaultTriggerId"
  >;
};

function DialogDrawer({
  drawer,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  children,
  ...props
}: DialogDrawerProps) {
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
    <DialogDrawerContext.Provider value={contextValue}>
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
        <Dialog {...props} open={open} onOpenChange={handleOpenChange}>
          {children}
        </Dialog>
      )}
    </DialogDrawerContext.Provider>
  );
}

type DialogDrawerTriggerProps = React.ComponentProps<typeof DialogTrigger> & {
  drawer?: Override<
    React.ComponentProps<typeof DrawerTrigger>,
    "handle" | "payload"
  >;
};

function DialogDrawerTrigger({ drawer, ...props }: DialogDrawerTriggerProps) {
  const context = React.useContext(DialogDrawerContext);

  if (context?.isMobile) {
    return (
      <DrawerTrigger {...toMobileProps(props, drawer, TRIGGER_DESKTOP_ONLY)} />
    );
  }
  return <DialogTrigger {...props} />;
}

type DialogDrawerContentProps = React.ComponentProps<typeof DialogContent> & {
  drawer?: Override<React.ComponentProps<typeof DrawerContent>>;
};

function DialogDrawerContent({
  drawer,
  children,
  ...props
}: DialogDrawerContentProps) {
  const { isMobile } = useDialogDrawer();

  if (isMobile) {
    return (
      <DrawerContent {...toMobileProps(props, drawer, CONTENT_DESKTOP_ONLY)}>
        {children}
      </DrawerContent>
    );
  }
  return <DialogContent {...props}>{children}</DialogContent>;
}

type DialogDrawerHeaderProps = React.ComponentProps<typeof DialogHeader> & {
  drawer?: Override<React.ComponentProps<typeof DrawerHeader>>;
};

function DialogDrawerHeader({ drawer, ...props }: DialogDrawerHeaderProps) {
  const { isMobile } = useDialogDrawer();

  if (isMobile) {
    return <DrawerHeader {...toMobileProps(props, drawer)} />;
  }
  return <DialogHeader {...props} />;
}

type DialogDrawerFooterProps = React.ComponentProps<typeof DialogFooter> & {
  drawer?: Override<React.ComponentProps<typeof DrawerFooter>>;
};

function DialogDrawerFooter({
  drawer,
  showCloseButton,
  children,
  ...props
}: DialogDrawerFooterProps) {
  const { isMobile } = useDialogDrawer();

  if (isMobile) {
    return (
      <DrawerFooter {...toMobileProps(props, drawer)}>
        {children}
        {showCloseButton && (
          <DrawerClose className={buttonVariants({ variant: "outline" })}>
            Close
          </DrawerClose>
        )}
      </DrawerFooter>
    );
  }
  return (
    <DialogFooter showCloseButton={showCloseButton} {...props}>
      {children}
    </DialogFooter>
  );
}

type DialogDrawerTitleProps = React.ComponentProps<typeof DialogTitle> & {
  drawer?: Override<React.ComponentProps<typeof DrawerTitle>>;
};

function DialogDrawerTitle({ drawer, ...props }: DialogDrawerTitleProps) {
  const { isMobile } = useDialogDrawer();

  if (isMobile) {
    return <DrawerTitle {...toMobileProps(props, drawer)} />;
  }
  return <DialogTitle {...props} />;
}

type DialogDrawerDescriptionProps = React.ComponentProps<
  typeof DialogDescription
> & {
  drawer?: Override<React.ComponentProps<typeof DrawerDescription>>;
};

function DialogDrawerDescription({
  drawer,
  ...props
}: DialogDrawerDescriptionProps) {
  const { isMobile } = useDialogDrawer();

  if (isMobile) {
    return <DrawerDescription {...toMobileProps(props, drawer)} />;
  }
  return <DialogDescription {...props} />;
}

type DialogDrawerCloseProps = React.ComponentProps<typeof DialogClose> & {
  drawer?: Override<React.ComponentProps<typeof DrawerClose>>;
};

function DialogDrawerClose({ drawer, ...props }: DialogDrawerCloseProps) {
  const { isMobile } = useDialogDrawer();

  if (isMobile) {
    return <DrawerClose {...toMobileProps(props, drawer)} />;
  }
  return <DialogClose {...props} />;
}

export {
  DialogDrawer,
  DialogDrawerClose,
  DialogDrawerContent,
  DialogDrawerDescription,
  DialogDrawerFooter,
  DialogDrawerHeader,
  DialogDrawerTitle,
  DialogDrawerTrigger,
};
