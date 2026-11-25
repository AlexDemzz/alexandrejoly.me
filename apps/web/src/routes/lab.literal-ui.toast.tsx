import { createFileRoute } from "@tanstack/react-router";

import { ComponentPreview } from "@/components/docs/component-preview";
import { DocsHeader, DocsSections } from "@/components/docs/docs-sections";
import { TOAST_CARD } from "@/components/og-card";
import { SiteFooter } from "@/components/site-footer";
import { TOAST_PAGE } from "@/content";
import { TOAST_PATH } from "@/lab/experiments";
import { CreditRuns, LiteralBreadcrumb } from "@/lab/lab-page-heading";
import { TOAST_API, TOAST_DEMO, TOAST_EXAMPLES } from "@/lab/toast/docs";
import { ToastSoundScope } from "@/lab/toast/sound-chrome";
import { getLabItemCode } from "@/lib/component-code";
import { pageHead } from "@/lib/head";
import { headingIds } from "@/lib/heading-ids";

const ids = headingIds({ api: TOAST_API, examples: TOAST_EXAMPLES });
const MainDemo = TOAST_DEMO.Component;

const ToastPage = () => {
  const code = Route.useLoaderData();
  return (
    <main className="content-grid py-12 sm:py-32 md:py-16" data-lab="toast">
      <ToastSoundScope>
        <DocsHeader
          description={<CreditRuns runs={TOAST_PAGE.credit} />}
          nav={<LiteralBreadcrumb />}
          title={TOAST_PAGE.title}
        />

        <div className="breakout" data-toast-kitchen="">
          <ComponentPreview
            Chrome={TOAST_DEMO.Chrome}
            code={code.demos[TOAST_DEMO.file]}
          >
            <MainDemo />
          </ComponentPreview>
        </div>

        <div>
          <DocsSections
            api={TOAST_API}
            cli={code.cli}
            demos={code.demos}
            examples={TOAST_EXAMPLES}
            ids={ids}
            usage={code.usage}
          />
          <SiteFooter />
        </div>
      </ToastSoundScope>
    </main>
  );
};

const toastHead = pageHead({
  description: TOAST_PAGE.description,
  image: {
    alt: `${TOAST_CARD.title}: ${TOAST_CARD.description}`,
    path: "og/lab/literal-ui/toast.png",
  },
  path: TOAST_PATH,
  title: TOAST_PAGE.documentTitle,
  type: "website",
});

export const Route = createFileRoute("/lab/literal-ui/toast")({
  component: ToastPage,
  loader: () => getLabItemCode("toast"),
  head: () => toastHead,
  staleTime: Number.POSITIVE_INFINITY,
});
