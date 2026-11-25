import { Button } from "@portfolio/ui/components/button";
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
import { useState } from "react";

const slides = [
  {
    alt: "A red canyon at noon",
    name: "Canyon",
    src: "/lab/literal-ui/carousel/canyon.webp",
  },
  {
    alt: "An alpine meadow",
    name: "Meadow",
    src: "/lab/literal-ui/carousel/meadow.webp",
  },
  {
    alt: "A fishing harbour",
    name: "Harbour",
    src: "/lab/literal-ui/carousel/harbor.webp",
  },
];

export const CarouselControlled = () => {
  const [page, setPage] = useState(1);

  return (
    <div className="flex w-full max-w-sm flex-col gap-6">
      <Carousel onPageChange={setPage} page={page}>
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
      <div className="flex gap-2">
        {slides.map((slide, index) => (
          <Button
            aria-pressed={page === index + 1}
            key={slide.src}
            onClick={() => setPage(index + 1)}
            variant={page === index + 1 ? "secondary" : "outline"}
          >
            {slide.name}
          </Button>
        ))}
      </div>
    </div>
  );
};
