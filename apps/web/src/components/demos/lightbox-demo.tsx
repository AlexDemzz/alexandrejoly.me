import {
  Lightbox,
  LightboxActions,
  LightboxClose,
  LightboxContent,
  LightboxCounter,
  LightboxItem,
  LightboxNext,
  LightboxPrevious,
  LightboxZoom,
} from "@registry/lightbox";

const LANDSCAPES = [
  { alt: "A turquoise mountain lake", name: "lake-forest" },
  { alt: "Clouds mirrored in a mountain lake", name: "mirror-lake" },
  { alt: "Snowy mountains in sunlight", name: "peaks" },
  { alt: "A wave breaking on a sandy shore", name: "shore" },
  { alt: "A wintry evergreen forest from above", name: "snow-forest" },
  { alt: "A wet mountain valley", name: "wet-valley" },
];

export const LightboxDemo = () => (
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
      <LightboxCounter />
      <LightboxActions>
        <LightboxZoom />
        <LightboxClose />
      </LightboxActions>
      <LightboxPrevious />
      <LightboxNext />
    </LightboxContent>
  </Lightbox>
);
