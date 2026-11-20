"use client";

import { mergeProps } from "@base-ui/react/merge-props";
import type { PhotoSwipeOptions } from "photoswipe";
import PhotoSwipeLightbox from "photoswipe/lightbox";
import {
  createContext,
  use,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal, flushSync } from "react-dom";

import "photoswipe/style.css";

import { IconPlaceholder } from "@/components/icon-placeholder";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type PhotoSwipe = NonNullable<PhotoSwipeLightbox["pswp"]>;

type LightboxOptions = Omit<
  PhotoSwipeOptions,
  "children" | "dataSource" | "gallery" | "pswpModule"
>;

interface LightboxViewer {
  container: HTMLElement;
  pswp: PhotoSwipe;
}

interface LightboxSlide {
  canZoom: boolean;
  index: number;
  isZoomed: boolean;
  item: HTMLElement | null;
}

const CLOSED_SLIDE: LightboxSlide = {
  canZoom: false,
  index: 0,
  isZoomed: false,
  item: null,
};

const isSameSlide = (a: LightboxSlide, b: LightboxSlide) =>
  a.canZoom === b.canZoom &&
  a.index === b.index &&
  a.isZoomed === b.isZoomed &&
  a.item === b.item;

interface LightboxContextValue {
  caption: HTMLElement | null;
  registerCaption: (node: HTMLElement | null) => void;
  slide: LightboxSlide;
  viewer: LightboxViewer | null;
}

const LightboxContext = createContext<LightboxContextValue | null>(null);

function useLightboxContext() {
  const context = use(LightboxContext);
  if (!context) {
    throw new Error("useLightbox must be used within a Lightbox component");
  }
  return context;
}

function useLightbox() {
  const { slide, viewer } = useLightboxContext();
  const pswp = viewer?.pswp;
  const count = pswp?.getNumItems() ?? 0;
  const loop = (pswp?.options.loop ?? true) && count > 1;

  return {
    canGoNext: loop || slide.index < count - 1,
    canGoPrevious: loop || slide.index > 0,
    canZoom: slide.canZoom,
    close: () => pswp?.close(),
    count,
    index: slide.index,
    isZoomed: slide.isZoomed,
    next: () => pswp?.next(),
    previous: () => pswp?.prev(),
    toggleZoom: () => pswp?.toggleZoom(),
  };
}

function composeRefs<T>(...refs: (React.Ref<T> | undefined)[]) {
  return (node: T | null) => {
    for (const ref of refs) {
      if (typeof ref === "function") {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
    }
  };
}

const ITEM_SELECTOR = "[data-slot=lightbox-item]";
const ITEM_CAPTION_SELECTOR = "[data-slot=lightbox-item-caption]";
const CONTENT_SELECTOR = "[data-slot=lightbox-content]";
const IMAGE_FRAME = 64;
const NARROW_VIEWPORT = 640;

const measureCaptionSpace = (
  caption: HTMLElement | null,
  item: HTMLElement | undefined
) => {
  const text = item?.querySelector(ITEM_CAPTION_SELECTOR);
  const probe = caption?.cloneNode(false);
  if (!(text && probe instanceof HTMLElement && caption?.parentElement)) {
    return 0;
  }
  probe.replaceChildren(
    ...Array.from(text.childNodes, (node) => node.cloneNode(true))
  );
  probe.style.visibility = "hidden";
  caption.parentElement.append(probe);
  const { marginBottom, marginTop } = getComputedStyle(probe);
  const space =
    Number.parseFloat(marginTop) +
    probe.getBoundingClientRect().height +
    Number.parseFloat(marginBottom);
  probe.remove();
  return space;
};

const getOptions = (
  gallery: string,
  options: LightboxOptions | undefined,
  measureCaption: (item: HTMLElement | undefined) => number
): PhotoSwipeOptions => ({
  arrowNext: false,
  arrowPrev: false,
  bgOpacity: 1,
  close: false,
  counter: false,
  wheelToZoom: true,
  zoom: false,
  ...(options?.padding
    ? {}
    : {
        paddingFn: (viewportSize, itemData) => {
          const side = viewportSize.x < NARROW_VIEWPORT ? 0 : IMAGE_FRAME;
          return {
            bottom: Math.max(IMAGE_FRAME, measureCaption(itemData.element)),
            left: side,
            right: side,
            top: IMAGE_FRAME,
          };
        },
      }),
  ...options,
  children: ITEM_SELECTOR,
  gallery: `#${CSS.escape(gallery)}`,
  mainClass: cn(
    "[--pswp-bg:var(--background)]! [--pswp-error-text-color:var(--muted-foreground)]! [--pswp-icon-color:var(--foreground)]! [--pswp-placeholder-bg:var(--muted)]!",
    options?.mainClass
  ),
  pswpModule: () => import("photoswipe"),
});

const videoIn = (element: HTMLElement | undefined) =>
  element?.querySelector("video");

interface LightboxProps extends React.ComponentProps<"div"> {
  options?: LightboxOptions;
}

function Lightbox({ className, id, options, ...props }: LightboxProps) {
  const autoId = useId();
  const galleryId = id ?? autoId;
  const lightboxRef = useRef<PhotoSwipeLightbox | null>(null);
  const optionsRef = useRef(options);
  const captionRef = useRef<HTMLElement | null>(null);
  const captionSpaceRef = useRef(new WeakMap<HTMLElement, number>());
  const [caption, setCaption] = useState<HTMLElement | null>(null);
  const [viewer, setViewer] = useState<LightboxViewer | null>(null);
  const [slide, setSlide] = useState<LightboxSlide>(CLOSED_SLIDE);

  const registerCaption = useCallback((node: HTMLElement | null) => {
    captionRef.current = node;
    setCaption(node);
  }, []);

  const measureCaption = useCallback((item: HTMLElement | undefined) => {
    const space = measureCaptionSpace(captionRef.current, item);
    if (item) {
      captionSpaceRef.current.set(item, space);
    }
    return space;
  }, []);

  useEffect(() => {
    optionsRef.current = options;
    const lightbox = lightboxRef.current;
    if (lightbox) {
      lightbox.options = getOptions(galleryId, options, measureCaption);
    }
  }, [galleryId, measureCaption, options]);

  useEffect(() => {
    const lightbox = new PhotoSwipeLightbox(
      getOptions(galleryId, optionsRef.current, measureCaption)
    );
    lightboxRef.current = lightbox;

    lightbox.on("contentLoad", (event) => {
      const { content } = event;
      if (content.type !== "video") {
        return;
      }
      event.preventDefault();
      const video = document.createElement("video");
      video.className = "size-full";
      video.controls = true;
      video.playsInline = true;
      video.preload = "metadata";
      video.src = content.data.src ?? "";
      const element = document.createElement("div");
      element.append(video);
      content.element = element;
    });

    lightbox.on("contentActivate", ({ content }) => {
      void videoIn(content.element)
        ?.play()
        .catch(() => undefined);
    });

    lightbox.on("contentDeactivate", ({ content }) => {
      videoIn(content.element)?.pause();
    });

    lightbox.on("uiRegister", () => {
      lightbox.pswp?.ui?.registerElement({
        appendTo: "root",
        name: "lightbox-content",
        onInit: (container, pswp) => {
          const syncSlide = () => {
            const current = pswp.currSlide;
            if (!current) {
              return;
            }
            const { currZoomLevel, zoomLevels } = current;
            const isZoomed = currZoomLevel > zoomLevels.initial;
            const next: LightboxSlide = {
              canZoom:
                current.isZoomable() &&
                (isZoomed || zoomLevels.secondary > zoomLevels.initial),
              index: pswp.currIndex,
              isZoomed,
              item: current.data.element ?? null,
            };
            const content = container.querySelector(CONTENT_SELECTOR);
            const contentTop = content
              ? Number.parseFloat(getComputedStyle(content).paddingTop)
              : 0;
            container.style.setProperty(
              "--lightbox-image-bottom",
              `${current.pan.y + current.height * currZoomLevel - contentTop}px`
            );
            container.toggleAttribute("data-zoomed", isZoomed);
            setSlide((previous) =>
              isSameSlide(previous, next) ? previous : next
            );
          };

          const startIndex = pswp.options.index ?? 0;
          flushSync(() => {
            setViewer({ container, pswp });
            setSlide({
              ...CLOSED_SLIDE,
              index: startIndex,
              item: pswp.getItemData(startIndex).element ?? null,
            });
          });

          pswp.on("change", syncSlide);
          pswp.on("zoomPanUpdate", syncSlide);
          pswp.on("loadComplete", syncSlide);
          pswp.on("loadError", syncSlide);

          const setAnimating = (isAnimating: boolean) =>
            container.toggleAttribute("data-animating", isAnimating);
          setAnimating(true);
          pswp.on("openingAnimationEnd", () => setAnimating(false));
          pswp.on("closingAnimationStart", () => setAnimating(true));
        },
      });
    });

    lightbox.on("destroy", () => {
      setViewer(null);
      setSlide(CLOSED_SLIDE);
    });

    lightbox.init();

    return () => {
      lightbox.destroy();
      lightboxRef.current = null;
    };
  }, [galleryId, measureCaption]);

  useEffect(() => {
    const { item } = slide;
    if (!(caption && viewer && item)) {
      return;
    }
    const observer = new ResizeObserver(() => {
      const reserved = captionSpaceRef.current.get(item);
      if (reserved !== undefined && measureCaption(item) !== reserved) {
        viewer.pswp.updateSize(true);
      }
    });
    observer.observe(caption);
    return () => observer.disconnect();
  }, [caption, measureCaption, slide, viewer]);

  const context = useMemo<LightboxContextValue>(
    () => ({ caption, registerCaption, slide, viewer }),
    [caption, registerCaption, slide, viewer]
  );

  return (
    <LightboxContext value={context}>
      <div
        className={cn(
          "grid grid-cols-[repeat(auto-fill,minmax(--spacing(24),1fr))] gap-2",
          className
        )}
        data-slot="lightbox"
        id={galleryId}
        {...props}
      />
    </LightboxContext>
  );
}

interface LightboxItemProps extends Omit<React.ComponentProps<"a">, "type"> {
  height: number;
  sizes?: string;
  srcSet?: string;
  type?: "image" | "video";
  width: number;
}

function LightboxItem({
  className,
  height,
  sizes,
  srcSet,
  type = "image",
  width,
  ...props
}: LightboxItemProps) {
  return (
    <a
      className={cn(
        "focus-visible:ring-ring/50 cursor-zoom-in outline-none focus-visible:ring-3",
        className
      )}
      data-cropped="true"
      data-pswp-height={height}
      data-pswp-sizes={sizes}
      data-pswp-srcset={srcSet}
      data-pswp-type={type}
      data-pswp-width={width}
      data-slot="lightbox-item"
      {...props}
    />
  );
}

function LightboxItemCaption({
  children,
  ref,
  ...props
}: React.ComponentProps<"div">) {
  const { caption, slide } = useLightboxContext();
  const [node, setNode] = useState<HTMLDivElement | null>(null);
  const setRefs = useMemo(() => composeRefs(ref, setNode), [ref]);
  const isOpen = node !== null && node.closest(ITEM_SELECTOR) === slide.item;

  return (
    <>
      <div data-slot="lightbox-item-caption" hidden ref={setRefs} {...props}>
        {children}
      </div>
      {isOpen && caption ? createPortal(children, caption) : null}
    </>
  );
}

function LightboxContent({ className, ...props }: React.ComponentProps<"div">) {
  const { viewer } = useLightboxContext();

  if (!viewer) {
    return null;
  }

  return createPortal(
    <div
      className={cn(
        "text-foreground pointer-events-none absolute inset-0 z-10 grid p-4 opacity-0 transition-opacity duration-(--pswp-transition-duration) *:col-start-1 *:row-start-1 in-[.pswp--ui-visible]:opacity-100 in-[.pswp--ui-visible]:*:pointer-events-auto",
        className
      )}
      data-slot="lightbox-content"
      {...props}
    />,
    viewer.container
  );
}

function LightboxCounter({ className, ...props }: React.ComponentProps<"div">) {
  const { count, index } = useLightbox();

  return (
    <div
      className={cn(
        "text-muted-foreground flex h-8 items-center self-start justify-self-center text-sm",
        className
      )}
      data-slot="lightbox-counter"
      {...props}
    >
      {index + 1} / {count}
    </div>
  );
}

function LightboxCaption({
  className,
  ref,
  ...props
}: React.ComponentProps<"div">) {
  const { registerCaption } = useLightboxContext();
  const setRefs = useMemo(
    () => composeRefs(ref, registerCaption),
    [ref, registerCaption]
  );

  return (
    <div
      className={cn(
        "text-muted-foreground absolute inset-x-0 top-(--lightbox-image-bottom) mt-3 mb-4 text-center text-sm transition-opacity in-data-animating:opacity-0 in-data-animating:transition-none in-data-zoomed:opacity-0",
        className
      )}
      data-slot="lightbox-caption"
      ref={setRefs}
      {...props}
    />
  );
}

function LightboxActions({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("flex gap-2 self-start justify-self-end", className)}
      data-slot="lightbox-actions"
      {...props}
    />
  );
}

function LightboxZoom({
  className,
  ...props
}: React.ComponentProps<typeof Button>) {
  const { canZoom, isZoomed, toggleZoom } = useLightbox();

  return (
    <Button
      className={cn("self-start justify-self-end", className)}
      data-slot="lightbox-zoom"
      {...mergeProps<typeof Button>(
        {
          disabled: !canZoom,
          onClick: toggleZoom,
          size: "icon",
          variant: "outline",
        },
        props
      )}
    >
      {isZoomed ? (
        <IconPlaceholder
          aria-hidden
          hugeicons="ZoomOutAreaIcon"
          lucide="ZoomOutIcon"
          phosphor="MagnifyingGlassMinusIcon"
          remixicon="RiZoomOutLine"
          tabler="IconZoomOut"
        />
      ) : (
        <IconPlaceholder
          aria-hidden
          hugeicons="ZoomInAreaIcon"
          lucide="ZoomInIcon"
          phosphor="MagnifyingGlassPlusIcon"
          remixicon="RiZoomInLine"
          tabler="IconZoomIn"
        />
      )}
      <span className="sr-only">{isZoomed ? "Zoom out" : "Zoom in"}</span>
    </Button>
  );
}

function LightboxClose({
  className,
  ...props
}: React.ComponentProps<typeof Button>) {
  const { close } = useLightbox();

  return (
    <Button
      className={cn("self-start justify-self-end", className)}
      data-slot="lightbox-close"
      {...mergeProps<typeof Button>(
        {
          onClick: close,
          size: "icon",
          variant: "outline",
        },
        props
      )}
    >
      <IconPlaceholder
        aria-hidden
        hugeicons="Cancel01Icon"
        lucide="XIcon"
        phosphor="XIcon"
        remixicon="RiCloseLine"
        tabler="IconX"
      />
      <span className="sr-only">Close</span>
    </Button>
  );
}

function LightboxPrevious({
  className,
  ...props
}: React.ComponentProps<typeof Button>) {
  const { canGoPrevious, count, previous } = useLightbox();

  if (count < 2) {
    return null;
  }

  return (
    <Button
      className={cn("self-center justify-self-start max-sm:hidden", className)}
      data-slot="lightbox-previous"
      {...mergeProps<typeof Button>(
        {
          disabled: !canGoPrevious,
          onClick: previous,
          size: "icon",
          variant: "outline",
        },
        props
      )}
    >
      <IconPlaceholder
        aria-hidden
        hugeicons="ArrowLeft01Icon"
        lucide="ChevronLeftIcon"
        phosphor="CaretLeftIcon"
        remixicon="RiArrowLeftSLine"
        tabler="IconChevronLeft"
      />
      <span className="sr-only">Previous slide</span>
    </Button>
  );
}

function LightboxNext({
  className,
  ...props
}: React.ComponentProps<typeof Button>) {
  const { canGoNext, count, next } = useLightbox();

  if (count < 2) {
    return null;
  }

  return (
    <Button
      className={cn("self-center justify-self-end max-sm:hidden", className)}
      data-slot="lightbox-next"
      {...mergeProps<typeof Button>(
        {
          disabled: !canGoNext,
          onClick: next,
          size: "icon",
          variant: "outline",
        },
        props
      )}
    >
      <IconPlaceholder
        aria-hidden
        hugeicons="ArrowRight01Icon"
        lucide="ChevronRightIcon"
        phosphor="CaretRightIcon"
        remixicon="RiArrowRightSLine"
        tabler="IconChevronRight"
      />
      <span className="sr-only">Next slide</span>
    </Button>
  );
}

export {
  Lightbox,
  LightboxActions,
  LightboxCaption,
  LightboxClose,
  LightboxContent,
  LightboxCounter,
  LightboxItem,
  LightboxItemCaption,
  LightboxNext,
  LightboxPrevious,
  LightboxZoom,
  useLightbox,
};
