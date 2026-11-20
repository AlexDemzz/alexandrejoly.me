import {
  Lightbox,
  LightboxClose,
  LightboxContent,
  LightboxCounter,
  LightboxItem,
  LightboxNext,
  LightboxPrevious,
} from "@registry/lightbox";

export const LightboxVideo = () => (
  <Lightbox className="w-full max-w-sm">
    <LightboxItem height={1200} href="/demos/lightbox/forest.png" width={960}>
      <img
        alt="A misty forest on a slope"
        className="aspect-4/5 w-full rounded-lg object-cover"
        height={300}
        src="/demos/lightbox/forest-thumb.png"
        width={240}
      />
    </LightboxItem>
    <LightboxItem
      height={864}
      href="/demos/lightbox/landscapes.mp4"
      type="video"
      width={864}
    >
      <img
        alt="Landscapes fading into one another"
        className="aspect-4/5 w-full rounded-lg object-cover"
        height={216}
        src="/demos/lightbox/landscapes-thumb.png"
        width={216}
      />
    </LightboxItem>
    <LightboxItem
      height={1200}
      href="/demos/lightbox/foggy-woodlands.png"
      width={960}
    >
      <img
        alt="Foggy woodlands"
        className="aspect-4/5 w-full rounded-lg object-cover"
        height={300}
        src="/demos/lightbox/foggy-woodlands-thumb.png"
        width={240}
      />
    </LightboxItem>
    <LightboxContent>
      <LightboxCounter />
      <LightboxClose />
      <LightboxPrevious />
      <LightboxNext />
    </LightboxContent>
  </Lightbox>
);
