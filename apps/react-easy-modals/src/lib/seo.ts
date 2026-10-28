import { absoluteUrl, SITE_NAME } from "./site";

export const pageHead = ({
  path,
  title,
  description,
}: {
  path: string;
  title?: string;
  description?: string;
}) => {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
  const url = absoluteUrl(path);

  return {
    meta: [
      { title: fullTitle },
      { property: "og:title", content: fullTitle },
      { property: "og:url", content: url },
      ...(description
        ? [
            { name: "description", content: description },
            { property: "og:description", content: description },
          ]
        : []),
    ],
    links: [{ rel: "canonical", href: url }],
  };
};
