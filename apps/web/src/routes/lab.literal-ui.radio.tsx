import { createFileRoute } from "@tanstack/react-router";

import { ComponentPreview } from "@/components/docs/component-preview";
import { DocsHeader, DocsSections } from "@/components/docs/docs-sections";
import { RADIO_CARD } from "@/components/og-card";
import { SiteFooter } from "@/components/site-footer";
import { RADIO_PAGE } from "@/content";
import { RADIO_PATH } from "@/lab/experiments";
import { CreditRuns, LiteralBreadcrumb } from "@/lab/lab-page-heading";
import { RADIO_API, RADIO_DEMO, RADIO_EXAMPLES } from "@/lab/radio/docs";
import { RadioSoundScope } from "@/lab/radio/sound-chrome";
import { getLabItemCode } from "@/lib/component-code";
import { pageHead } from "@/lib/head";
import { headingIds } from "@/lib/heading-ids";

const ids = headingIds({ api: RADIO_API, examples: RADIO_EXAMPLES });
const MainDemo = RADIO_DEMO.Component;

const RadioPage = () => {
  const code = Route.useLoaderData();
  return (
    <main className="content-grid py-12 sm:py-32 md:py-16" data-lab="radio">
      <RadioSoundScope>
        <DocsHeader
          description={<CreditRuns runs={RADIO_PAGE.credit} />}
          nav={<LiteralBreadcrumb />}
          title={RADIO_PAGE.title}
        />

        <div className="breakout" data-radio-shelf="">
          <ComponentPreview
            Chrome={RADIO_DEMO.Chrome}
            code={code.demos[RADIO_DEMO.file]}
          >
            <MainDemo />
          </ComponentPreview>
        </div>

        <div>
          <DocsSections
            api={RADIO_API}
            cli={code.cli}
            demos={code.demos}
            examples={RADIO_EXAMPLES}
            ids={ids}
            usage={code.usage}
          />
          <SiteFooter />
        </div>
      </RadioSoundScope>
    </main>
  );
};

const radioHead = pageHead({
  description: RADIO_PAGE.description,
  image: {
    alt: `${RADIO_CARD.title}: ${RADIO_CARD.description}`,
    path: "og/lab/literal-ui/radio.png",
  },
  path: RADIO_PATH,
  title: RADIO_PAGE.documentTitle,
  type: "website",
});

export const Route = createFileRoute("/lab/literal-ui/radio")({
  component: RadioPage,
  loader: () => getLabItemCode("radio"),
  head: () => radioHead,
  staleTime: Number.POSITIVE_INFINITY,
});
