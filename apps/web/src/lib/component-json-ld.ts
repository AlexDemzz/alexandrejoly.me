import { COMPONENTS_PAGE, LINKS, SITE } from "@/content";
import { absolute } from "@/lib/head";
import { PERSON_ID } from "@/lib/person-json-ld";
import { COMPONENTS_PATH, REGISTRY_ITEMS, componentPath } from "@/lib/registry";
import type { RegistryItem } from "@/lib/registry";

const breadcrumb = (trail: { name: string; url: string }[]) => ({
  "@type": "BreadcrumbList",
  itemListElement: trail.map(({ name, url }, index) => ({
    "@type": "ListItem",
    item: url,
    name,
    position: index + 1,
  })),
});

const HOME = { name: SITE.name, url: SITE.url };
const COMPONENTS = {
  name: COMPONENTS_PAGE.title,
  url: absolute(COMPONENTS_PATH),
};

/** The `/components` index's schema.org graph: its breadcrumb, and the page as a list of every docs page. */
export const componentsJsonLd = () => ({
  "@context": "https://schema.org",
  "@graph": [
    breadcrumb([HOME, COMPONENTS]),
    {
      "@type": "CollectionPage",
      description: COMPONENTS_PAGE.description,
      mainEntity: {
        "@type": "ItemList",
        itemListElement: REGISTRY_ITEMS.map(({ name, title }, index) => ({
          "@type": "ListItem",
          name: title,
          position: index + 1,
          url: absolute(componentPath(name)),
        })),
      },
      name: COMPONENTS_PAGE.documentTitle,
      url: COMPONENTS.url,
    },
  ] as const,
});

/** A docs page's schema.org graph: its breadcrumb through the index, and the component as source code. */
export const componentJsonLd = ({ description, name, title }: RegistryItem) => {
  const url = absolute(componentPath(name));
  return {
    "@context": "https://schema.org",
    "@graph": [
      breadcrumb([HOME, COMPONENTS, { name: title, url }]),
      {
        "@type": "SoftwareSourceCode",
        author: { "@id": PERSON_ID, name: SITE.name },
        codeRepository: LINKS.repo,
        description,
        license: "https://opensource.org/licenses/MIT",
        name: title,
        programmingLanguage: "TypeScript",
        runtimePlatform: "React",
        url,
      },
    ] as const,
  };
};
