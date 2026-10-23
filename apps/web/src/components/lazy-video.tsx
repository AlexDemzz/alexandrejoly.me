import { useEffect, useRef, useState } from "react";

const PRELOAD_MARGIN = "200px";
const CAN_HOVER = "(hover: hover)";
const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";
const ROW_SELECTOR = '[data-slot="item-light"]';

interface LazyVideoProps {
  className?: string;
  poster?: string;
  src: string;
}

export const LazyVideo = ({ className, poster, src }: LazyVideoProps) => {
  const ref = useRef<HTMLVideoElement>(null);
  const [isNear, setIsNear] = useState(false);
  const [isWanted, setIsWanted] = useState(poster !== undefined);
  const shouldLoad = isNear && isWanted;

  useEffect(() => {
    const video = ref.current;
    if (!video) {
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setIsNear(true);
          if (window.matchMedia(CAN_HOVER).matches) {
            setIsWanted(true);
          }
          observer.disconnect();
        }
      },
      { rootMargin: PRELOAD_MARGIN }
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const video = ref.current;
    const row = video?.closest<HTMLElement>(ROW_SELECTOR);
    if (!(video && row)) {
      return;
    }
    const canHover = window.matchMedia(CAN_HOVER);
    const reducedMotion = window.matchMedia(REDUCED_MOTION);
    let isHovered = canHover.matches && row.matches(":hover");

    const sync = async () => {
      if (!(isHovered || row.matches(":focus-visible"))) {
        video.pause();
        return;
      }
      setIsWanted(true);
      if (!shouldLoad || reducedMotion.matches) {
        return;
      }
      try {
        await video.play();
      } catch (error) {
        if (!(error instanceof DOMException)) {
          throw error;
        }
      }
    };
    const onPointerEnter = () => {
      isHovered = canHover.matches;
      sync();
    };
    const onPointerLeave = () => {
      isHovered = false;
      sync();
    };

    sync();
    row.addEventListener("pointerenter", onPointerEnter);
    row.addEventListener("pointerleave", onPointerLeave);
    row.addEventListener("focus", sync);
    row.addEventListener("blur", sync);
    return () => {
      row.removeEventListener("pointerenter", onPointerEnter);
      row.removeEventListener("pointerleave", onPointerLeave);
      row.removeEventListener("focus", sync);
      row.removeEventListener("blur", sync);
    };
  }, [shouldLoad]);

  return (
    <video
      className={className}
      loop
      muted
      playsInline
      poster={poster}
      preload={poster === undefined ? "auto" : "none"}
      ref={ref}
      src={shouldLoad ? src : undefined}
    />
  );
};
