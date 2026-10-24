import { EMAIL, EMPLOYER, LINKS, SITE, X_HANDLE } from "@/content";
import type { Paragraph } from "@/content";

export interface InfoSection {
  paragraphs: Paragraph[];
  title: string;
}

export interface InfoPage {
  description: string;
  /** The `<title>`, when it should say more than "<title> – <site name>". */
  documentTitle?: string;
  intro: Paragraph[];
  sections: InfoSection[];
  title: string;
}

export const INFO_PAGE_SLUGS = ["about", "contact", "privacy"] as const;

export type InfoPageSlug = (typeof INFO_PAGE_SLUGS)[number];

export const isInfoPageSlug = (slug: string): slug is InfoPageSlug =>
  (INFO_PAGE_SLUGS as readonly string[]).includes(slug);

const email: Paragraph[number] = { href: LINKS.email, text: EMAIL };

export const INFO_PAGES: Record<InfoPageSlug, InfoPage> = {
  about: {
    description: `Who ${SITE.name} is: a French design engineer in Geneva who has built ${EMPLOYER.name}’s interfaces since 2018, plus side products, shadcn/ui components and awards.`,
    documentTitle: `About ${SITE.name}, design engineer at ${EMPLOYER.name}`,
    intro: [
      [
        `I’m ${SITE.name}, a French design engineer based in Geneva, Switzerland. I work where design meets code: I draw an interface, then build it, animate it and keep polishing it until it feels right. I work in French and English.`,
      ],
    ],
    sections: [
      {
        paragraphs: [
          [
            "I studied web design in Limoges, France, then started as a web developer at ABProd in Châteauroux. There I built the interfaces of ordering kiosks for Burger King, and that is where UI animation hooked me.",
          ],
          [
            "In 2018 I joined ",
            { href: EMPLOYER.href, text: EMPLOYER.name },
            ", a Swiss platform to book help at home, as its front-end developer and UI/UX designer. I lead UI and UX across the website and the mobile app, look after the brand, and take features from first concept to production. I also created Simplr, Yoojo’s design system, from scratch: one set of components and icons, in Figma and in code, shared by React and React Native.",
          ],
        ],
        title: "Path",
      },
      {
        paragraphs: [
          [
            "Outside Yoojo I build my own products and maintain open-source work: React libraries, the shadcn/ui components on this site and ",
            { href: LINKS.skills, text: "agent skills" },
            ". The ",
            { href: SITE.url, text: "home page" },
            " lists what I’m working on now.",
          ],
        ],
        title: "On the side",
      },
      {
        paragraphs: [
          [
            "Each of my portfolios is rebuilt from scratch, and they have received awards from CSS Design Awards and Awwwards since 2018. The source of this one is ",
            { href: LINKS.repo, text: "public on GitHub" },
            ".",
          ],
        ],
        title: "Recognition",
      },
    ],
    title: "About",
  },
  contact: {
    description: `How to reach ${SITE.name}: email for a project, a role or a question about a component, X and LinkedIn to follow along, and GitHub issues for any bug.`,
    intro: [
      [
        "Email is the best way to reach me: write to ",
        email,
        ". Tell me who you are and what you have in mind, whether it is a project, a role, a question about one of my components or just a hello.",
      ],
    ],
    sections: [
      {
        paragraphs: [
          [
            "I’m on ",
            { href: LINKS.x, text: `X as @${X_HANDLE}` },
            ", where I share what I’m building, and on ",
            { href: LINKS.linkedin, text: "LinkedIn" },
            " for work. My code lives on ",
            { href: LINKS.github, text: "GitHub" },
            ".",
          ],
        ],
        title: "Elsewhere",
      },
      {
        paragraphs: [
          [
            "Found a bug in a component or on this site? Open an issue on ",
            { href: `${LINKS.repo}/issues`, text: "the site’s repository" },
            " with the steps to reproduce it, your browser and, if you can, a screenshot. For anything about my products, use the contact details on their own sites.",
          ],
        ],
        title: "Bugs and issues",
      },
    ],
    title: "Contact",
  },
  privacy: {
    description: `What ${SITE.name}’s site collects about visitors: no cookies, no analytics, no tracking. Only Cloudflare’s request logs, kept a few days to debug errors.`,
    intro: [
      [
        "This site is a personal portfolio. It sets no cookies, runs no analytics or advertising scripts, embeds no third-party trackers and has no forms, so it collects nothing about you on purpose. This page explains the little that still happens when you visit.",
      ],
    ],
    sections: [
      {
        paragraphs: [
          [
            "The site runs on ",
            {
              href: "https://www.cloudflare.com/privacypolicy/",
              text: "Cloudflare",
            },
            ", which processes each request, including your IP address and browser details, to serve the page and protect it from abuse. Request logs are kept for a few days to debug errors and are not used to profile visitors.",
          ],
        ],
        title: "Hosting",
      },
      {
        paragraphs: [
          [
            "Text is set in your device’s own fonts, and images and videos come from this domain, not from a third party. Anything the site shows from another service is fetched by the server, so your browser only talks to this domain. If a page fails to load after a deploy, the site keeps a reload counter in your browser’s session storage; it never leaves your device.",
          ],
        ],
        title: "Your browser",
      },
      {
        paragraphs: [
          [
            "Links to other sites, such as my projects, GitHub or LinkedIn, open those sites under their own privacy policies. For any question about your data, write to ",
            email,
            ".",
          ],
        ],
        title: "Questions",
      },
    ],
    title: "Privacy",
  },
};
