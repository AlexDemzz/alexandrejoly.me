import { useEffect, useRef, useState } from "react";

// Starts fetching only once the video nears the viewport, so below-the-fold
// clips stay out of the initial page load.
const PRELOAD_MARGIN = "200px";

export const LazyVideo = ({
  className,
  src,
}: {
  className?: string;
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

  return (
    <video
      aria-hidden
      autoPlay
      className={className}
      loop
      muted
      playsInline
      preload="none"
      ref={ref}
      src={isNear ? src : undefined}
    />
  );
};
