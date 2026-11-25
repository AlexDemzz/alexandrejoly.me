import { createFileRoute } from "@tanstack/react-router";

import { ComponentPreview } from "@/components/docs/component-preview";
import { DocsHeader, DocsSections } from "@/components/docs/docs-sections";
import { CAROUSEL_CARD } from "@/components/og-card";
import { SiteFooter } from "@/components/site-footer";
import { CAROUSEL_PAGE } from "@/content";
import {
  CAROUSEL_API,
  CAROUSEL_DEMO,
  CAROUSEL_EXAMPLES,
} from "@/lab/carousel/docs";
import { CarouselSoundScope } from "@/lab/carousel/sound-chrome";
import { CAROUSEL_PATH } from "@/lab/experiments";
import { CreditRuns, LiteralBreadcrumb } from "@/lab/lab-page-heading";
import { getLabItemCode } from "@/lib/component-code";
import { pageHead } from "@/lib/head";
import { headingIds } from "@/lib/heading-ids";

const ids = headingIds({ api: CAROUSEL_API, examples: CAROUSEL_EXAMPLES });
const MainDemo = CAROUSEL_DEMO.Component;

const CarouselPage = () => {
  const code = Route.useLoaderData();
  return (
    <main className="content-grid py-12 sm:py-32 md:py-16" data-lab="carousel">
      <CarouselSoundScope>
        <DocsHeader
          description={<CreditRuns runs={CAROUSEL_PAGE.credit} />}
          nav={<LiteralBreadcrumb />}
          title={CAROUSEL_PAGE.title}
        />

        <div className="breakout" data-carousel-room="">
          <ComponentPreview
            Chrome={CAROUSEL_DEMO.Chrome}
            code={code.demos[CAROUSEL_DEMO.file]}
          >
            <MainDemo />
          </ComponentPreview>
        </div>

        <div>
          <DocsSections
            api={CAROUSEL_API}
            cli={code.cli}
            demos={code.demos}
            examples={CAROUSEL_EXAMPLES}
            ids={ids}
            usage={code.usage}
          />
          <SiteFooter />
        </div>
      </CarouselSoundScope>
    </main>
  );
};

const carouselHead = pageHead({
  description: CAROUSEL_PAGE.description,
  image: {
    alt: `${CAROUSEL_CARD.title}: ${CAROUSEL_CARD.description}`,
    path: "og/lab/literal-ui/carousel.png",
  },
  path: CAROUSEL_PATH,
  title: CAROUSEL_PAGE.documentTitle,
  type: "website",
});

export const Route = createFileRoute("/lab/literal-ui/carousel")({
  component: CarouselPage,
  loader: () => getLabItemCode("carousel"),
  head: () => carouselHead,
  staleTime: Number.POSITIVE_INFINITY,
});
