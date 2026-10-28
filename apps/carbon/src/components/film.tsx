import {
  ArrowCounterClockwiseIcon,
  PauseIcon,
  PlayIcon,
} from "@phosphor-icons/react";
import { buttonVariants } from "@portfolio/ui/components/button";
import { cn } from "@portfolio/ui/lib/utils";
import { useRef, useState } from "react";

import darkPoster from "@/media/carbon-flow-dark-poster.webp?no-inline";
import darkMp4 from "@/media/carbon-flow-dark.mp4";
import poster from "@/media/carbon-flow-poster.webp?no-inline";
import mp4 from "@/media/carbon-flow.mp4";

const DARK = "(prefers-color-scheme: dark)";

type Playback = "idle" | "playing" | "paused" | "ended";

const CONTROL = {
  ended: { icon: ArrowCounterClockwiseIcon, label: "Replay" },
  idle: { icon: PlayIcon, label: "Play" },
  paused: { icon: PlayIcon, label: "Play" },
  playing: { icon: PauseIcon, label: "Pause" },
} as const;

/**
 * The landing film, rendered by apps/carbon-video in both appearances. It
 * plays only when asked, muted and once, so it never moves on its own: the
 * whole card is its play/pause button, and the pill names the next action.
 * The poster is a picture over the video, since `poster` can't follow the
 * color scheme.
 */
export const Film = () => {
  const ref = useRef<HTMLVideoElement>(null);
  const [playback, setPlayback] = useState<Playback>("idle");
  const control = CONTROL[playback];
  const Icon = control.icon;

  const toggle = async () => {
    const video = ref.current;
    if (!video) {
      return;
    }
    if (playback === "playing") {
      video.pause();
      return;
    }
    try {
      await video.play();
    } catch {
      setPlayback("paused");
    }
  };

  return (
    <figure className="group/film relative overflow-hidden rounded-2xl border">
      <video
        className="bg-muted aspect-video w-full"
        height={900}
        muted
        onEnded={() => setPlayback("ended")}
        onPause={(event) => {
          if (!event.currentTarget.ended) {
            setPlayback("paused");
          }
        }}
        onPlay={() => setPlayback("playing")}
        playsInline
        preload="metadata"
        ref={ref}
        width={1600}
      >
        <source media={DARK} src={darkMp4} type="video/mp4" />
        <source src={mp4} type="video/mp4" />
      </video>
      {playback === "idle" ? (
        <picture>
          <source media={DARK} srcSet={darkPoster} />
          <img
            alt=""
            className="absolute inset-0 size-full"
            height={900}
            src={poster}
            width={1600}
          />
        </picture>
      ) : null}
      <button
        aria-label={`${control.label} video`}
        // The figure clips its corners, so the focus ring sits inside them.
        className="absolute inset-0 flex items-end rounded-2xl p-3 focus-visible:-outline-offset-2"
        onClick={toggle}
        type="button"
      >
        {/* While it plays, the pill hides until the card is hovered or focused. */}
        <span
          className={cn(
            "transition-opacity duration-200",
            playback === "playing" &&
              "can-hover:group-hover/film:opacity-100 opacity-0 group-has-focus-visible/film:opacity-100"
          )}
        >
          <span
            className={buttonVariants({ size: "sm", variant: "secondary" })}
          >
            <Icon data-icon="inline-start" weight="fill" />
            {control.label}
          </span>
        </span>
      </button>
      <figcaption className="sr-only">
        A 34-second demo without sound. Join a call, and Carbon starts on its
        own: the dot in its menu bar icon turns red and a notification reads
        “Transcribing in English.” When the call ends, the meeting opens on its
        participants, then every word with who said it and when. Copy Path hands
        the meeting’s Markdown file to an AI agent in a terminal. No sign-in, no
        bot, no cloud.
      </figcaption>
    </figure>
  );
};
