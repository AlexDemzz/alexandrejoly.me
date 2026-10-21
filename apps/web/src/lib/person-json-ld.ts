import { EMAIL, EMPLOYER, LINKS, SITE } from "@/content";

/** The home page's schema.org Person, contact point included. */
export const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  address: {
    "@type": "PostalAddress",
    addressCountry: "CH",
    addressLocality: "Geneva",
  },
  contactPoint: {
    "@type": "ContactPoint",
    availableLanguage: ["en", "fr"],
    contactType: "general inquiries",
    email: EMAIL,
    url: new URL("contact", SITE.url).href,
  },
  description: SITE.description,
  email: EMAIL,
  jobTitle: "Developer",
  name: SITE.name,
  sameAs: [LINKS.github, LINKS.linkedin, LINKS.x],
  url: SITE.url,
  worksFor: {
    "@type": "Organization",
    name: EMPLOYER.name,
    url: EMPLOYER.href,
  },
};
