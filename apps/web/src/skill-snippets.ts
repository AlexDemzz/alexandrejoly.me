// No imports: plugins/skill-code.ts loads this file at build time to highlight
// each snippet.

export interface Snippet {
  code: string;
  lang: "bash" | "json";
}

export const SKILL_SNIPPETS = {
  "notify-grokbot": {
    install: {
      code: "npx skills add AlexDemzz/skills --skill notify-grokbot -g",
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
      code: "~/.claude/skills/notify-grokbot/scripts/setup-webhook",
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
} as const satisfies Record<string, Record<string, Snippet>>;

export type SkillPageName = keyof typeof SKILL_SNIPPETS;

export type SnippetKey<Name extends SkillPageName> =
  keyof (typeof SKILL_SNIPPETS)[Name];
