import {
  Lightbox,
  LightboxCaption,
  LightboxClose,
  LightboxContent,
  LightboxItem,
  LightboxItemCaption,
  LightboxNext,
  LightboxPrevious,
} from "@registry/lightbox";

const LANDSCAPES = [
  {
    caption: "Fog rolling over the hills before sunrise.",
    name: "misty-hills",
    title: "Misty hills",
  },
  {
    caption: "Waves breaking on the rocks of a rough coast at dusk.",
    name: "rough-coast",
    title: "A rough ocean coast",
  },
  {
    caption: "A turquoise lake hidden in a pine forest.",
    name: "lake-forest",
    title: "A turquoise mountain lake",
  },
];

export const LightboxCaptions = () => (
  <Lightbox className="w-full max-w-sm">
    {LANDSCAPES.map(({ caption, name, title }) => (
      <LightboxItem
        height={1200}
        href={`/demos/lightbox/${name}.png`}
        key={name}
        width={960}
      >
        <img
          alt={title}
          className="aspect-4/5 w-full rounded-lg object-cover"
          height={300}
          src={`/demos/lightbox/${name}-thumb.png`}
          width={240}
        />
        <LightboxItemCaption>{caption}</LightboxItemCaption>
      </LightboxItem>
    ))}
    <LightboxContent>
      <LightboxClose />
      <LightboxPrevious />
      <LightboxNext />
      <LightboxCaption />
    </LightboxContent>
  </Lightbox>
);
