import { createFileRoute } from "@tanstack/react-router";

import { ComponentPreview } from "@/components/docs/component-preview";
import { DocsHeader, DocsSections } from "@/components/docs/docs-sections";
import { TOAST_CARD } from "@/components/og-card";
import { SiteFooter } from "@/components/site-footer";
import { TOAST_PAGE } from "@/content";
import { TOAST_PATH } from "@/lab/experiments";
import { CreditRuns, LabBreadcrumb } from "@/lab/lab-page-heading";
import { TOASTER_API, TOASTER_DEMO, TOASTER_EXAMPLES } from "@/lab/toast/docs";
import { ToasterSoundScope } from "@/lab/toast/sound-chrome";
import { getLabItemCode } from "@/lib/component-code";
import { pageHead } from "@/lib/head";
import { headingIds } from "@/lib/heading-ids";

const ids = headingIds({ api: TOASTER_API, examples: TOASTER_EXAMPLES });
const MainDemo = TOASTER_DEMO.Component;

const ToastPage = () => {
  const code = Route.useLoaderData();
  return (
    <main className="content-grid py-12 sm:py-32 md:py-16" data-lab="toast">
      <ToasterSoundScope>
        <DocsHeader
          description={<CreditRuns runs={TOAST_PAGE.credit} />}
          nav={<LabBreadcrumb />}
          title={TOAST_PAGE.title}
        />

        <div className="breakout" data-toast-kitchen="">
          <ComponentPreview
            Chrome={TOASTER_DEMO.Chrome}
            code={code.demos[TOASTER_DEMO.file]}
          >
            <MainDemo />
          </ComponentPreview>
        </div>

        <div>
          <DocsSections
            api={TOASTER_API}
            cli={code.cli}
            demos={code.demos}
            examples={TOASTER_EXAMPLES}
            ids={ids}
            usage={code.usage}
          />
          <SiteFooter />
        </div>
      </ToasterSoundScope>
    </main>
  );
};

const toastHead = pageHead({
  description: TOAST_PAGE.description,
  image: {
    alt: `${TOAST_CARD.title}: ${TOAST_CARD.description}`,
    path: "og/lab/toast.png",
  },
  path: TOAST_PATH,
  title: TOAST_PAGE.documentTitle,
  type: "website",
});

export const Route = createFileRoute("/lab/toast")({
  component: ToastPage,
  loader: () => getLabItemCode("toaster"),
  head: () => toastHead,
  staleTime: Number.POSITIVE_INFINITY,
});
