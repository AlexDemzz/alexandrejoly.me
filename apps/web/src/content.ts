import type { ComponentType } from "react";

import { AwwwardsIcon } from "@/components/awwwards-icon";
import { CssDesignAwardsIcon } from "@/components/css-design-awards-icon";
import { EnvelopeIcon } from "@/components/envelope-icon";
import { GithubIcon } from "@/components/github-icon";
import { GymupIcon } from "@/components/gymup-icon";
import { KwernIcon } from "@/components/kwern-icon";
import { LinkedinIcon } from "@/components/linkedin-icon";
import { ReactEasyModalsIcon } from "@/components/react-easy-modals-icon";
import { SkipprIcon } from "@/components/skippr-icon";
import { XIcon } from "@/components/x-icon";

export const SITE = {
  description:
    "I’m a developer at Yoojo. I design and build interfaces end to end, and I care about the details that make them feel right.",
  name: "Alexandre Joly",
  title: "Alexandre Joly – Developer at Yoojo",
  url: "https://alexandrejoly.me/",
} as const;

export const X_HANDLE = "AlexDmzz";

export const EMAIL = "alexandre.joly36@gmail.com";

export const LINKS = {
  email: `mailto:${EMAIL}`,
  github: "https://github.com/AlexDemzz",
  linkedin: "https://www.linkedin.com/in/alexandre-joly-a23154107/",
  repo: "https://github.com/AlexDemzz/alexandrejoly.me",
  skills: "https://www.skills.sh/alexdemzz/skills",
  x: `https://x.com/${X_HANDLE}`,
} as const;

export interface Audit {
  href: string;
  name: string;
  scores: { label: string; value: number }[];
}

// Measured on the live site; re-run each audit and update after notable changes.
export const AUDITS: Audit[] = [
  {
    href: "https://pagespeed.web.dev/analysis?url=https%3A%2F%2Falexandrejoly.me%2F&form_factor=mobile",
    name: "Lighthouse",
    scores: [
      { label: "Performance", value: 100 },
      { label: "Accessibility", value: 100 },
      { label: "Best practices", value: 100 },
      { label: "SEO", value: 100 },
    ],
  },
  {
    href: "https://is-agentic.com/scan/alexandrejoly.me",
    name: "Is Agentic",
    scores: [{ label: "Agent readiness", value: 100 }],
  },
];

export interface Social {
  href: string;
  icon: ComponentType<{ className?: string }>;
  name: string;
}

export const SOCIALS: Social[] = [
  { href: LINKS.x, icon: XIcon, name: "X" },
  { href: LINKS.github, icon: GithubIcon, name: "GitHub" },
  { href: LINKS.linkedin, icon: LinkedinIcon, name: "LinkedIn" },
  { href: LINKS.email, icon: EnvelopeIcon, name: "Email" },
];

export const EMPLOYER = {
  href: "https://yoojo.com",
  /** The Organization `@id` in the JSON-LD that yoojo.com publishes. */
  jsonLdId: "https://yoojo.ch/#organization",
  name: "Yoojo",
} as const;

export interface Project {
  /** A dithered scene revealed behind the logo on row hover. */
  backdrop?: string;
  description: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
  kind: string;
  name: string;
  year: number;
}

export const PROJECTS: Project[] = [
  {
    backdrop: "/projects/kwern-landscapes.webm",
    description: "A team of AI agents that market your product",
    href: "https://kwern.app",
    icon: KwernIcon,
    kind: "Web app",
    name: "Kwern",
    year: 2026,
  },
  {
    description: "AI strength coach, built on a professional coach's system",
    href: "https://gymup.ai",
    icon: GymupIcon,
    kind: "iOS & web app",
    name: "Gymup",
    year: 2026,
  },
  {
    description: "The SSH terminal built for agents, on iPad",
    href: "https://skippr.sh",
    icon: SkipprIcon,
    kind: "iPad app",
    name: "Skippr",
    year: 2026,
  },
  {
    description: "Headless, zero-dependency modal stack for React",
    href: "https://react-easy-modals.alexandrejoly.me/",
    icon: ReactEasyModalsIcon,
    kind: "React library",
    name: "react-easy-modals",
    year: 2025,
  },
];

/** A run of prose: plain text, or a link. */
export type Inline = string | { href: string; text: string };

export type Paragraph = Inline[];

const projectLink = (name: string): Inline => {
  const project = PROJECTS.find((candidate) => candidate.name === name);
  if (!project) {
    throw new Error(`PROJECTS has no project named ${name}`);
  }
  return { href: project.href, text: project.name };
};

export const INTRO: Paragraph[] = [
  [
    "I design and build interfaces end to end, and I care about the details that make them feel right.",
  ],
  [
    "Right now I’m building ",
    projectLink("Kwern"),
    ", a team of AI agents that market your product while you keep building it, and ",
    projectLink("Gymup"),
    ", an AI strength coach built on a professional coach’s system. I also maintain ",
    projectLink("react-easy-modals"),
    ", a headless modal stack for React.",
  ],
];

export interface Skill {
  description: string;
  name: string;
}

export const SKILLS: Skill[] = [
  {
    description: "Skin shadcn primitives from any website or screenshot",
    name: "design-to-shadcn",
  },
  {
    description: "Compound-component laws for shadcn projects",
    name: "shadcn-composition-patterns",
  },
];

export const skillHref = (name: string) => `${LINKS.skills}/${name}`;

export interface Award {
  href: string;
  icon: ComponentType<{ className?: string }>;
  issuer: string;
  title: string;
  year: number;
}

export const AWARDS: Award[] = [
  {
    href: "https://www.cssdesignawards.com/sites/alexandre-joly-portfolio/46054",
    icon: CssDesignAwardsIcon,
    issuer: "CSS Design Awards",
    title: "Website of the Day, Best UI, UX & Innovation",
    year: 2024,
  },
  {
    href: "https://www.awwwards.com/sites/alexandre-joly-portfolio",
    icon: AwwwardsIcon,
    issuer: "Awwwards",
    title: "Honorable Mention",
    year: 2024,
  },
  {
    href: "https://www.cssdesignawards.com/sites/alexandre-joly-portfolio/33214/",
    icon: CssDesignAwardsIcon,
    issuer: "CSS Design Awards",
    title: "Website of the Day, Best UI, UX & Innovation",
    year: 2018,
  },
];

export interface Archive {
  description: string;
  href: string;
  media: string;
  title: string;
  year: number;
}

export const ARCHIVES: Archive[] = [
  {
    description: "Next.js, Three.js and a lot of springs",
    href: "https://2025.alexandrejoly.me",
    media: "/archives/2025.webm",
    title: "Portfolio 2025",
    year: 2025,
  },
  {
    description: "React, Sass and smooth scrolling",
    href: "https://2018.alexandrejoly.me",
    media: "/archives/2018.webm",
    title: "Portfolio 2018",
    year: 2018,
  },
];
