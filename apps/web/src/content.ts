import type { ComponentType } from "react";

import { AwwwardsIcon } from "@/components/awwwards-icon";
import { CssDesignAwardsIcon } from "@/components/css-design-awards-icon";
import { EnvelopeIcon } from "@/components/envelope-icon";
import { GithubIcon } from "@/components/github-icon";
import { GymupIcon } from "@/components/gymup-icon";
import { KwernIcon } from "@/components/kwern-icon";
import { LinkedinIcon } from "@/components/linkedin-icon";
import { ReactEasyModalsIcon } from "@/components/react-easy-modals-icon";
import { XIcon } from "@/components/x-icon";

export const SITE = {
  description:
    "Alexandre Joly, French developer in Geneva at Yoojo. Building Gymup, an AI strength coach, Kwern, marketing on autopilot, and react-easy-modals.",
  name: "Alexandre Joly",
  title: "Alexandre Joly – Developer in Geneva",
  url: "https://alexandrejoly.me/",
} as const;

export const X_HANDLE = "AlexDmzz";

export const LINKS = {
  email: "mailto:alexandre.joly36@gmail.com",
  github: "https://github.com/AlexDemzz",
  linkedin: "https://www.linkedin.com/in/alexandre-joly-a23154107/",
  skills: "https://www.skills.sh/alexdemzz/skills",
  x: `https://x.com/${X_HANDLE}`,
} as const;

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
    description: "AI strength coach, built on a professional coach's system",
    href: "https://gymup.ai",
    icon: GymupIcon,
    kind: "iOS & web app",
    name: "Gymup",
    year: 2026,
  },
  {
    backdrop: "/projects/kwern-peaks.png",
    description: "You build the product, Kwern does the marketing",
    href: "https://kwern.app",
    icon: KwernIcon,
    kind: "Web app",
    name: "Kwern",
    year: 2026,
  },
  {
    description: "Headless, zero-dependency modal stack for React",
    href: "https://react-easy-modals-docs.vercel.app/",
    icon: ReactEasyModalsIcon,
    kind: "React library",
    name: "react-easy-modals",
    year: 2025,
  },
];

export interface Skill {
  description: string;
  name: string;
}

export const SKILLS: Skill[] = [
  {
    description: "Copy any website's design onto shadcn primitives",
    name: "pimp-my-shadcn",
  },
  {
    description: "Compound-component laws for shadcn projects",
    name: "shadcn-composition-patterns",
  },
  {
    description: "Today's recognized best practice, backed by sources",
    name: "for-sure",
  },
  {
    description: "Drive your own Chrome session from an agent",
    name: "agent-browser-chrome",
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
