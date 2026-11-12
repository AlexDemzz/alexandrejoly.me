// No imports: plugins/skill-code.ts loads this file at build time to highlight
// each snippet.

export interface Snippet {
  code: string;
  lang: "bash" | "json" | "tsx";
}

export const SKILL_SNIPPETS = {
  "grokbot-notify": {
    install: {
      code: "npx skills add AlexDemzz/skills --skill grokbot-notify -g",
      lang: "bash",
    },
    payload: {
      code: `{
  "from": "claude-code",
  "project": "my-app",
  "branch": "fix-login-redirect",
  "status": "done",
  "message": "Fixed the login redirect loop. The PR is ready for review.",
  "links": ["https://github.com/owner/my-app/pull/42"]
}`,
      lang: "json",
    },
    setup: {
      code: "~/.claude/skills/grokbot-notify/scripts/setup-webhook",
      lang: "bash",
    },
  },
  "design-to-shadcn": {
    install: {
      code: "npx skills add AlexDemzz/skills --skill design-to-shadcn -g",
      lang: "bash",
    },
    installShadcn: {
      code: "npx skills add shadcn/ui --skill shadcn -g",
      lang: "bash",
    },
    run: {
      code: `/design-to-shadcn https://example.com
/design-to-shadcn ./shots/home-light.png ./shots/home-dark.png settings`,
      lang: "bash",
    },
  },
  "shadcn-composition-patterns": {
    install: {
      code: "npx skills add AlexDemzz/skills --skill shadcn-composition-patterns -g",
      lang: "bash",
    },
    link: {
      code: `// Base UI
<JobCard render={<Link to="/jobs/$id" params={{ id }} />}>
  <JobCardTitle>{job.title}</JobCardTitle>
</JobCard>

// Radix
<JobCard asChild>
  <Link to={\`/jobs/\${id}\`}>
    <JobCardTitle>{job.title}</JobCardTitle>
  </Link>
</JobCard>`,
      lang: "tsx",
    },
    skeleton: {
      code: `import { cn } from "@/lib/utils";

function Navbar({ className, ...props }: React.ComponentProps<"nav">) {
  return (
    <nav
      className={cn("flex items-center gap-4 px-4 py-3", className)}
      data-slot="navbar"
      {...props}
    />
  );
}

function NavbarTitle({ className, ...props }: React.ComponentProps<"h1">) {
  return (
    <h1
      className={cn("text-base font-semibold", className)}
      data-slot="navbar-title"
      {...props}
    />
  );
}

export { Navbar, NavbarTitle };`,
      lang: "tsx",
    },
  },
} as const satisfies Record<string, Record<string, Snippet>>;

export type SkillPageName = keyof typeof SKILL_SNIPPETS;

export type SnippetKey<Name extends SkillPageName> =
  keyof (typeof SKILL_SNIPPETS)[Name];
