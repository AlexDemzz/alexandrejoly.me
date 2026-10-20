import { LazyVideo } from "@/components/lazy-video";

// A loop of dithered scenes behind a row's logo, revealed on row hover. A 20%
// black overlay keeps the mark legible on top of it.
export const MediaBackdrop = ({ src }: { src: string }) => (
  <span
    aria-hidden
    className="ease-settle can-hover:group-hover/item:scale-100 can-hover:group-hover/item:opacity-100 can-hover:group-hover/item:duration-260 pointer-events-none absolute inset-0 scale-115 opacity-0 transition duration-200 group-focus-visible/item:scale-100 group-focus-visible/item:opacity-100 group-focus-visible/item:duration-260 motion-reduce:scale-100"
  >
    <LazyVideo className="size-full object-cover select-none" src={src} />
    <span className="absolute inset-0 bg-black/20" />
  </span>
);
