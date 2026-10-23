import { useEffect, useRef, useState } from "react";
import type { RefObject } from "react";

// Starts fetching only once the video nears the viewport, so below-the-fold
// clips stay out of the initial page load.
const PRELOAD_MARGIN = "200px";

// Must match the `can-hover` variant in packages/ui/src/styles/globals.css, so
// clips load and play exactly where hover can reveal them.
const CAN_HOVER = "(hover: hover)";
const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";
const ROW_SELECTOR = '[data-slot="item-light"]';

// A hover-only clip stays unfetched until a hover-capable pointer is primary or
// its row takes keyboard focus, so touch-only visitors never download it.
const useCanReveal = (
  ref: RefObject<HTMLVideoElement | null>,
  hoverOnly: boolean
) => {
  const [canReveal, setCanReveal] = useState(!hoverOnly);

  useEffect(() => {
    const row = ref.current?.closest<HTMLElement>(ROW_SELECTOR);
    if (!(hoverOnly && row)) {
      return;
    }
    const canHover = window.matchMedia(CAN_HOVER);
    const reveal = () => setCanReveal(true);
    if (canHover.matches) {
      reveal();
      return;
    }
    const onChange = () => {
      if (canHover.matches) {
        reveal();
      }
    };
    canHover.addEventListener("change", onChange);
    row.addEventListener("focusin", reveal, { once: true });
    return () => {
      canHover.removeEventListener("change", onChange);
      row.removeEventListener("focusin", reveal);
    };
  }, [hoverOnly, ref]);

  return canReveal;
};

// Holds the clip on its poster or first frame and plays it only while its row
// is hovered or keyboard-focused. Pausing rather than resetting resumes it
// where it left off, so moving between rows never jumps back to the start.
const usePlayWhileRowActive = (
  ref: RefObject<HTMLVideoElement | null>,
  enabled: boolean
) => {
  useEffect(() => {
    const video = ref.current;
    const row = video?.closest<HTMLElement>(ROW_SELECTOR);
    if (!(enabled && video && row)) {
      return;
    }
    const canHover = window.matchMedia(CAN_HOVER);
    const reducedMotion = window.matchMedia(REDUCED_MOTION);

    const play = async () => {
      if (reducedMotion.matches) {
        return;
      }
      try {
        await video.play();
      } catch {
        // Interrupted by a pause before playback started.
      }
    };
    const pause = () => video.pause();
    const onPointerEnter = () => {
      if (canHover.matches) {
        play();
      }
    };
    const onPointerLeave = () => {
      if (!row.matches(":focus-visible")) {
        pause();
      }
    };
    const onFocus = () => {
      if (row.matches(":focus-visible")) {
        play();
      }
    };
    const onBlur = () => {
      if (!row.matches(":hover")) {
        pause();
      }
    };

    row.addEventListener("pointerenter", onPointerEnter);
    row.addEventListener("pointerleave", onPointerLeave);
    row.addEventListener("focus", onFocus);
    row.addEventListener("blur", onBlur);
    return () => {
      row.removeEventListener("pointerenter", onPointerEnter);
      row.removeEventListener("pointerleave", onPointerLeave);
      row.removeEventListener("focus", onFocus);
      row.removeEventListener("blur", onBlur);
    };
  }, [enabled, ref]);
};

type LazyVideoProps = {
  className?: string;
  /** Skip the download where only hover could reveal the clip. */
  hoverOnly?: boolean;
  src: string;
} & (
  | { playOnRowHover?: false; poster?: never }
  | {
      playOnRowHover: true;
      /** Shown until playback, so the clip downloads only once played. */
      poster: string;
    }
);

export const LazyVideo = ({
  className,
  hoverOnly = false,
  playOnRowHover = false,
  poster,
  src,
}: LazyVideoProps) => {
  const ref = useRef<HTMLVideoElement>(null);
  const [isNear, setIsNear] = useState(false);
  const canReveal = useCanReveal(ref, hoverOnly);

  useEffect(() => {
    const video = ref.current;
    if (!video) {
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setIsNear(true);
          observer.disconnect();
        }
      },
      { rootMargin: PRELOAD_MARGIN }
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  usePlayWhileRowActive(ref, playOnRowHover);

  const shouldLoad = isNear && canReveal;
  const preload = playOnRowHover ? "none" : "auto";

  return (
    <video
      aria-hidden
      autoPlay={!playOnRowHover}
      className={className}
      loop
      muted
      playsInline
      poster={poster}
      preload={shouldLoad ? preload : "none"}
      ref={ref}
      src={shouldLoad ? src : undefined}
    />
  );
};
