import { useEffect, useRef, useState } from "react";
import type { RefObject } from "react";

// Starts fetching only once the video nears the viewport, so below-the-fold
// clips stay out of the initial page load.
const PRELOAD_MARGIN = "200px";

const CAN_HOVER = "(hover: hover) and (pointer: fine)";
const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

// Holds the clip on its first frame and plays it only while its row is hovered
// or keyboard-focused. Pausing rather than resetting resumes it where it left
// off, so moving between rows never jumps back to the start.
const usePlayWhileRowActive = (
  ref: RefObject<HTMLVideoElement | null>,
  enabled: boolean
) => {
  useEffect(() => {
    const video = ref.current;
    const row = video?.closest<HTMLElement>('[data-slot="item-light"]');
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

export const LazyVideo = ({
  className,
  playOnRowHover = false,
  src,
}: {
  className?: string;
  playOnRowHover?: boolean;
  src: string;
}) => {
  const ref = useRef<HTMLVideoElement>(null);
  const [isNear, setIsNear] = useState(false);

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

  // Safari paints no frame for a paused video until it seeks, which the
  // media fragment forces.
  const source = playOnRowHover ? `${src}#t=0.001` : src;

  return (
    <video
      aria-hidden
      autoPlay={!playOnRowHover}
      className={className}
      loop
      muted
      playsInline
      preload={isNear ? "auto" : "none"}
      ref={ref}
      src={isNear ? source : undefined}
    />
  );
};
