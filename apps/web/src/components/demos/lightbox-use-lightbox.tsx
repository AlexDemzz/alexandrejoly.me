import { DownloadSimpleIcon } from "@phosphor-icons/react";
import { Button } from "@portfolio/ui/components/button";
import {
  Lightbox,
  LightboxClose,
  LightboxContent,
  LightboxItem,
  LightboxNext,
  LightboxPrevious,
  useLightbox,
} from "@registry/lightbox";

const LANDSCAPES = [
  { alt: "Snowy mountains in sunlight", name: "peaks" },
  { alt: "A wave breaking on a sandy shore", name: "shore" },
  { alt: "A wet mountain valley", name: "wet-valley" },
];

const LightboxDownload = () => {
  const { index } = useLightbox();
  const landscape = LANDSCAPES[index];

  return (
    <Button
      className="self-end justify-self-center"
      nativeButton={false}
      render={({ children, ...props }) => (
        <a {...props} download href={`/demos/lightbox/${landscape?.name}.png`}>
          {children}
        </a>
      )}
      variant="outline"
    >
      <DownloadSimpleIcon data-icon="inline-start" />
      Download
    </Button>
  );
};

export const LightboxUseLightbox = () => (
  <Lightbox className="w-full max-w-sm">
    {LANDSCAPES.map(({ alt, name }) => (
      <LightboxItem
        height={1200}
        href={`/demos/lightbox/${name}.png`}
        key={name}
        width={960}
      >
        <img
          alt={alt}
          className="aspect-4/5 w-full rounded-lg object-cover"
          height={300}
          src={`/demos/lightbox/${name}-thumb.png`}
          width={240}
        />
      </LightboxItem>
    ))}
    <LightboxContent>
      <LightboxClose />
      <LightboxPrevious />
      <LightboxNext />
      <LightboxDownload />
    </LightboxContent>
  </Lightbox>
);
