import {
  Carousel,
  CarouselFocus,
  CarouselNext,
  CarouselPrevious,
  CarouselContent,
  CarouselItem,
  CarouselStage,
  CarouselPlayToggle,
} from "@registry/carousel/carousel";
import { CarouselAudio } from "@registry/carousel/carousel-sound";

const slides = [
  { alt: "Sand dunes at dusk", src: "/lab/literal-ui/carousel/dunes.webp" },
  { alt: "A pine forest in fog", src: "/lab/literal-ui/carousel/forest.webp" },
  {
    alt: "A glacier above a lake",
    src: "/lab/literal-ui/carousel/glacier.webp",
  },
  { alt: "A red canyon at noon", src: "/lab/literal-ui/carousel/canyon.webp" },
  { alt: "An alpine meadow", src: "/lab/literal-ui/carousel/meadow.webp" },
  { alt: "A fishing harbour", src: "/lab/literal-ui/carousel/harbor.webp" },
];

export const CarouselDemo = () => (
  <Carousel className="w-full max-w-xl">
    <CarouselStage>
      <CarouselContent aria-label="Holiday slides">
        {slides.map((slide) => (
          <CarouselItem key={slide.src}>
            <img
              alt={slide.alt}
              className="size-full object-cover"
              height={848}
              src={slide.src}
              width={1264}
            />
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselFocus />
      <CarouselPlayToggle />
      <CarouselPrevious />
      <CarouselNext />
    </CarouselStage>
    <CarouselAudio />
  </Carousel>
);
