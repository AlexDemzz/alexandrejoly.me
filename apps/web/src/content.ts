export const LINKS = {
  dribbble: "https://dribbble.com/AlexDemzz",
  email: "mailto:alexandre.joly36@gmail.com",
  github: "https://github.com/AlexDemzz",
  linkedin: "https://www.linkedin.com/in/alexandre-joly-a23154107/",
  skills: "https://github.com/AlexDemzz/skills",
} as const;

export interface Project {
  description: string;
  href: string;
  icon: string;
  kind: string;
  name: string;
  year: number;
}

export const PROJECTS: Project[] = [
  {
    description: "AI strength coach, built on a professional coach's system",
    href: "https://gymup.ai",
    icon: "/projects/gymup.svg",
    kind: "iOS & web app",
    name: "Gymup",
    year: 2026,
  },
  {
    description: "You build the product, Kwern does the marketing",
    href: "https://kwern.app",
    icon: "/projects/kwern.png",
    kind: "Web app",
    name: "Kwern",
    year: 2026,
  },
  {
    description: "Headless, zero-dependency modal stack for React",
    href: "https://react-easy-modals-docs.vercel.app/",
    icon: "/projects/react-easy-modals.svg",
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

export const skillHref = (name: string) =>
  `${LINKS.skills}/tree/master/${name}`;

export interface Award {
  href: string;
  issuer: string;
  title: string;
  year: number;
}

export const AWARDS: Award[] = [
  {
    href: "https://www.cssdesignawards.com/sites/alexandre-joly-portfolio/46054",
    issuer: "CSS Design Awards",
    title: "Website of the Day, Best UI, UX & Innovation",
    year: 2024,
  },
  {
    href: "https://www.awwwards.com/sites/alexandre-joly-portfolio",
    issuer: "Awwwards",
    title: "Honorable Mention",
    year: 2024,
  },
  {
    href: "https://www.cssdesignawards.com/sites/alexandre-joly-portfolio/33214/",
    issuer: "CSS Design Awards",
    title: "Website of the Day, Best UI, UX & Innovation",
    year: 2018,
  },
];

export interface Archive {
  description: string;
  href: string;
  year: number;
}

export const ARCHIVES: Archive[] = [
  {
    description: "Next.js, Three.js and a lot of springs",
    href: "https://2025.alexandrejoly.me",
    year: 2025,
  },
  {
    description: "React, Sass and smooth scrolling",
    href: "https://2018.alexandrejoly.me",
    year: 2018,
  },
];
