import { SITE } from "@/content";
import type { Paragraph } from "@/content";
import type { HighlightedCode } from "@/lib/component-code";
import { SKILL_SNIPPETS } from "@/skill-snippets";
import type { SkillPageName, SnippetKey } from "@/skill-snippets";

export type { SkillPageName } from "@/skill-snippets";

/** Cells are plain text with `backtick` spans; the first cell names its row. */
export interface SkillTable {
  head: [string, string];
  /** The table's accessible name. */
  label: string;
  rows: [string, string][];
}

export type SkillBlock<Name extends SkillPageName> =
  | { kind: "code"; snippet: SnippetKey<Name> }
  | ({ kind: "table" } & SkillTable)
  /** `lead` opens the paragraph in `foreground`, as a question or key phrase. */
  | { kind: "text"; lead?: string; text: Paragraph };

/** A block of any skill page. */
export type AnySkillBlock = {
  [Name in SkillPageName]: SkillBlock<Name>;
}[SkillPageName];

export interface SkillSection<Name extends SkillPageName> {
  blocks: SkillBlock<Name>[];
  title: string;
}

export interface SkillPage<Name extends SkillPageName> {
  description: string;
  documentTitle: string;
  intro: Paragraph[];
  sections: SkillSection<Name>[];
}

export const SKILL_PAGE_NAMES = Object.keys(SKILL_SNIPPETS) as SkillPageName[];

export const isSkillPageName = (name: string): name is SkillPageName =>
  (SKILL_PAGE_NAMES as string[]).includes(name);

export const skillPath = (name: SkillPageName) => `skills/${name}`;

export const SKILL_PAGES: { [Name in SkillPageName]: SkillPage<Name> } = {
  "notify-grokbot": {
    description: `notify-grokbot, an open-source agent skill by ${SITE.name}: your Claude Code agent messages you in your Grok Bot chat when it finishes a task, gets blocked or needs your decision.`,
    documentTitle: `notify-grokbot agent skill – ${SITE.name}`,
    intro: [
      [
        "An agent skill that lets your Claude Code agent message you in your Grok Bot chat.",
      ],
    ],
    sections: [
      {
        blocks: [
          {
            kind: "text",
            text: [
              "Your agent tells you when it finishes a task, gets blocked or needs your decision. Leave a session running and hear back without watching it.",
            ],
          },
          {
            kind: "text",
            text: [
              "The agent runs one script, which POSTs a short JSON message to the webhook of a Grok Bot routine. Grok Bot relays it in your chat, in plain words, with the links the agent attached.",
            ],
          },
        ],
        title: "What it does",
      },
      {
        blocks: [
          {
            kind: "text",
            text: [
              'You don’t call it; the agent does, once per outcome, with `~/.claude/skills/notify-grokbot/scripts/notify-grokbot <status> "<summary>" [link …]`. Progress never earns a message.',
            ],
          },
          {
            head: ["Status", "Sent when"],
            kind: "table",
            label: "Statuses",
            rows: [
              ["`done`", "A meaningful task is finished."],
              ["`blocked`", "The agent can’t go on without outside help."],
              ["`question`", "The agent needs your decision."],
              ["`info`", "Something else is worth an interruption."],
            ],
          },
          {
            kind: "text",
            text: [
              "A new outcome earns a new message: blocked now, done an hour later.",
            ],
          },
        ],
        title: "When to reach for it",
      },
      {
        blocks: [
          {
            kind: "text",
            text: [
              "A Grok Bot account with its desktop app, where you create the routine and copy its webhook. Claude Code. Sending also uses `curl` and `python3`.",
            ],
          },
        ],
        title: "Prerequisites",
      },
      {
        blocks: [
          { kind: "text", text: ["Install the skill:"] },
          { kind: "code", snippet: "install" },
          {
            kind: "text",
            text: [
              "Then run the wizard in your own terminal. It needs you at the keyboard, so don’t hand it to an agent:",
            ],
          },
          { kind: "code", snippet: "setup" },
          {
            head: ["Stage", "What you do"],
            kind: "table",
            label: "Wizard stages",
            rows: [
              [
                "Create the routine",
                "Paste the prompt the wizard copied into your Bot’s chat in the desktop app, and send it. Skip this if the routine exists.",
              ],
              [
                "Webhook URL",
                "Copy “POST to” from the routine’s Webhook section and paste it.",
              ],
              [
                "Authorization header",
                "Copy “header” from the same section and paste it.",
              ],
              ["Test message", "Send one test ping, or skip it."],
            ],
          },
          {
            kind: "text",
            text: [
              "The wizard saves both values to `~/.config/grokbot/webhook.env`. Run it again when one changes: Enter keeps the others.",
            ],
          },
        ],
        title: "Setup",
      },
      {
        blocks: [
          {
            kind: "text",
            lead: "Why paste the header, not the key?",
            text: [
              "The header already is `Bearer <key>`, so it carries the key. Paste the bare key instead and the wizard adds `Bearer` for you.",
            ],
          },
          {
            kind: "text",
            lead: "Will it fail my agent’s task?",
            text: [
              "No. The script always exits 0. When nothing went out, it prints a warning, and the agent tells you once to run the wizard, then carries on.",
            ],
          },
          {
            kind: "text",
            lead: "Can I see what gets sent?",
            text: [
              "Yes. One JSON object, with `from` set to `claude-code`, the repository’s folder as `project`, and the current `branch`:",
            ],
          },
          { kind: "code", snippet: "payload" },
          {
            kind: "text",
            lead: "Can a message make Grok Bot act?",
            text: [
              "Not on its own. The routine treats every message as untrusted data: it tells you what a message asks and acts only if you say yes in the chat.",
            ],
          },
          {
            kind: "text",
            lead: "What stays out of a message?",
            text: [
              "Secrets, tokens and customer data. The skill tells agents to send summaries and links only.",
            ],
          },
        ],
        title: "Common questions",
      },
      {
        blocks: [
          {
            kind: "text",
            text: [
              "Send the test message at the wizard’s last stage: Grok Bot tells you in your chat that it arrived. If the wizard shows a warning instead, check both values and run it again.",
            ],
          },
        ],
        title: "It’s working if",
      },
      {
        blocks: [
          {
            kind: "text",
            text: [
              "notify-grokbot lives in ",
              {
                href: "https://github.com/AlexDemzz/skills/tree/master/notify-grokbot",
                text: "my skills repository on GitHub",
              },
              ", next to ",
              {
                href: "/skills/design-to-shadcn",
                text: "design-to-shadcn",
              },
              ", which skins shadcn primitives from a reference design, and ",
              {
                href: "/skills/shadcn-composition-patterns",
                text: "shadcn-composition-patterns",
              },
              ", the compound-component laws for shadcn projects.",
            ],
          },
        ],
        title: "Where it fits",
      },
    ],
  },
  "design-to-shadcn": {
    description: `design-to-shadcn, an open-source agent skill by ${SITE.name}: your agent skins your shadcn primitives from a reference design, then rebuilds one screen to prove the match.`,
    documentTitle: `design-to-shadcn agent skill – ${SITE.name}`,
    intro: [
      [
        "An agent skill that skins your shadcn primitives from a reference design.",
      ],
    ],
    sections: [
      {
        blocks: [
          {
            kind: "text",
            text: [
              "Give your agent a reference: a live website, a case study made of screenshots, or a folder of images. It skins your project’s shadcn primitives until they match: same colors, radii, type, spacing and states, in light and dark. Your app never restyles; it only lays out.",
            ],
          },
          {
            kind: "text",
            text: ["The work runs in four phases, in order, one commit each:"],
          },
          {
            head: ["Phase", "What you get"],
            kind: "table",
            label: "Phases",
            rows: [
              [
                "Capture",
                "A `DESIGN.md` written from sampled pixels, with a `shadcnMapping` block every later phase reads.",
              ],
              [
                "Tokens",
                "That mapping written to `:root` and `.dark` in your CSS file, in OKLCH. No component file changes.",
              ],
              [
                "Primitives",
                "Missing primitives installed from a registry, then skinned in their base classes and variants, shown on a `/dev/primitives` page.",
              ],
              [
                "Iso page",
                "One screen rebuilt from the primitives alone, compared region by region with the reference.",
              ],
            ],
          },
          {
            kind: "text",
            text: [
              "The iso page is the proof. If a stranger can tell it from the reference, a primitive still needs work.",
            ],
          },
        ],
        title: "What it does",
      },
      {
        blocks: [
          {
            kind: "text",
            text: [
              "You have a reference design but no tokens for it yet: a live site, a case study or a set of screenshots. Your project runs shadcn on Tailwind v4, or doesn’t exist yet.",
            ],
          },
          {
            kind: "text",
            text: [
              "Your agent never picks this skill on its own. You call it with the reference and, optionally, the screen to rebuild:",
            ],
          },
          { kind: "code", snippet: "run" },
          {
            kind: "text",
            text: [
              "Without a screen, the agent picks the one that uses the most primitives: a settings page beats a hero. If your `DESIGN.md` already holds the reference, say so instead, and the capture phase shrinks to a check.",
            ],
          },
        ],
        title: "When to reach for it",
      },
      {
        blocks: [
          {
            kind: "text",
            text: [
              "A shadcn project on Tailwind v4. A folder without `components.json` works too: the agent scaffolds it first, with the shadcn style closest to the reference.",
            ],
          },
        ],
        title: "Prerequisites",
      },
      {
        blocks: [
          { kind: "text", text: ["Install the skill:"] },
          { kind: "code", snippet: "install" },
          {
            kind: "text",
            text: [
              "It loads the `shadcn` skill before anything else, so install that one too if you haven’t:",
            ],
          },
          { kind: "code", snippet: "installShadcn" },
          {
            kind: "text",
            text: ["Then make sure these tools are on your machine:"],
          },
          {
            head: ["Tool", "What it’s for"],
            kind: "table",
            label: "Tools",
            rows: [
              [
                "`magick`",
                "ImageMagick. Samples the pixel each color comes from.",
              ],
              ["`node`", "Runs the two bundled scripts."],
              [
                "`agent-browser`",
                "Drives a live site and reads its computed styles. Without it, headless Chrome takes the screenshots, with no style readout.",
              ],
            ],
          },
        ],
        title: "Setup",
      },
      {
        blocks: [
          {
            kind: "text",
            lead: "Will my app fill up with overrides?",
            text: [
              "No. Your app keeps layout classes only. A color, border, radius or font class there counts as an override, and each one goes on the record with its reason. A new variant has to earn its place: a role the reference reuses at least twice, or a change to at least two of color, radius, size, spacing, type, border and shadow. Anything less becomes a `className` or folds into the base classes.",
            ],
          },
          {
            kind: "text",
            lead: "Is the brand color my primary?",
            text: [
              "Not by default. `--primary` follows the reference’s primary button, read from its computed style. The hex everyone quotes for a brand is often a pressed state or a section band.",
            ],
          },
          {
            kind: "text",
            lead: "What about the frame around case-study screenshots?",
            text: [
              "Ignored. The window on a gray desk, the browser bar, the device bezel and the drop shadow are the portfolio’s staging. The agent samples inside the screen only.",
            ],
          },
          {
            kind: "text",
            lead: "Do I get a say before the iso page?",
            text: [
              "Yes. The agent lists every region of the screen with the primitive and variant that renders it, then waits for your go.",
            ],
          },
          {
            kind: "text",
            lead: "Where does the progress go?",
            text: [
              "Into a ledger, `docs/design/<slug>-skin.md`, one section per phase. On a repository with `docs/agents/issue-tracker.md`, the four phases become four tickets instead.",
            ],
          },
        ],
        title: "Common questions",
      },
      {
        blocks: [
          {
            kind: "text",
            text: [
              "Your iso page and the reference look the same in light and dark, and the ledger lists the primitives that had to change and the overrides your app needed.",
            ],
          },
        ],
        title: "It’s working if",
      },
      {
        blocks: [
          {
            kind: "text",
            text: [
              "design-to-shadcn lives in ",
              {
                href: "https://github.com/AlexDemzz/skills/tree/master/design-to-shadcn",
                text: "my skills repository on GitHub",
              },
              ", next to ",
              {
                href: "/skills/shadcn-composition-patterns",
                text: "shadcn-composition-patterns",
              },
              ", the compound-component laws for shadcn projects, and ",
              {
                href: "/skills/notify-grokbot",
                text: "notify-grokbot",
              },
              ", which messages you in your Grok Bot chat when your agent finishes, gets blocked or needs your decision.",
            ],
          },
        ],
        title: "Where it fits",
      },
    ],
  },
  "shadcn-composition-patterns": {
    description: `shadcn-composition-patterns, an open-source agent skill by ${SITE.name}: your coding agent builds React components the way shadcn builds its own, and grades existing ones against the same laws.`,
    documentTitle: `shadcn-composition-patterns agent skill – ${SITE.name}`,
    intro: [
      [
        "An agent skill that makes your coding agent build components the way shadcn builds its own.",
      ],
    ],
    sections: [
      {
        blocks: [
          {
            kind: "text",
            text: [
              "Your agent builds every component as a compound: one file, one prefixed family of parts, each part a single element you style and replace from the call site.",
            ],
          },
          { kind: "code", snippet: "skeleton" },
          {
            kind: "text",
            text: [
              "Hand it an existing file instead and it grades that file against the same laws, part by part.",
            ],
          },
        ],
        title: "What it does",
      },
      {
        blocks: [
          {
            kind: "text",
            text: [
              "Every time a React component is created, changed or audited in a project with a `components.json`. Give it a component to build, or a file to review.",
            ],
          },
          {
            head: ["Law", "What it asks"],
            kind: "table",
            label: "Laws",
            rows: [
              [
                "Compound, prefixed named exports",
                "One root plus parts, each a top-level export: `NavbarTitle`, never `Navbar.Title`.",
              ],
              [
                "Each part is one element",
                "`data-slot`, `className` through `cn` and props spread last. Spacing between parts lives on the parent.",
              ],
              [
                "Variants at the call site",
                "A one-off look is the consumer’s `className`. A `cva` variant needs several consumers.",
              ],
              [
                "Polymorphic root, navigation-agnostic",
                "The consumer picks the element: `render` on Base UI, `asChild` on Radix. No auto-`<Link>`.",
              ],
              [
                "Styling from outside targets `data-slot`",
                "`[&_[data-slot=item-title]]:font-semibold` on the root’s `className`.",
              ],
            ],
          },
        ],
        title: "When to reach for it",
      },
      {
        blocks: [
          {
            kind: "text",
            text: [
              "A shadcn project: a `components.json`, with Base UI or Radix in the `package.json` beside it. In a monorepo, that’s your ui package. And a coding agent that loads skills.",
            ],
          },
        ],
        title: "Prerequisites",
      },
      {
        blocks: [
          { kind: "text", text: ["Install the skill:"] },
          { kind: "code", snippet: "install" },
          {
            kind: "text",
            text: [
              "There’s nothing to configure. On each run, the agent reads your project’s base from that `package.json`: any `@base-ui` dependency means Base UI, otherwise `radix-ui` or `@radix-ui/*` means Radix. The base decides how a part becomes a link.",
            ],
          },
          {
            kind: "text",
            text: [
              "Then it lists your components directory before writing anything. If a primitive or a compound already covers the need, it stops and points you to it.",
            ],
          },
        ],
        title: "Setup",
      },
      {
        blocks: [
          {
            kind: "text",
            lead: "Where does the new component go?",
            text: [
              "Used by one consumer, it lives in that consumer’s file. Shared, it follows your existing component convention, or sits beside the shadcn primitives at your `aliases` path.",
            ],
          },
          {
            kind: "text",
            lead: "Can I add a variant prop?",
            text: [
              "Only for a purely visual look that several consumers share. A variant with one consumer is that consumer’s `className`. A prop that only makes sense for one variant gets a part of its own.",
            ],
          },
          {
            kind: "text",
            lead: "How do I make a part a link?",
            text: [
              "Hand it the element. The component never guesses a link from a `url` prop:",
            ],
          },
          { kind: "code", snippet: "link" },
          {
            kind: "text",
            lead: "Why the callback form for a plain anchor?",
            text: [
              "On Base UI, `render={<a href={url} />}` trips the anchor-content lint, and silencing the lint fails the law. `render={(props) => <a {...props} href={url} />}` spreads the children in, so the lint passes.",
            ],
          },
          {
            kind: "text",
            lead: "Why does my data-state class do nothing?",
            text: [
              "Tailwind v4 needs the bracket form for custom data attributes: `data-[state=open]:…`. A bare `data-state-open:` fails silently.",
            ],
          },
        ],
        title: "Common questions",
      },
      {
        blocks: [
          {
            kind: "text",
            text: [
              "After a build, you get one file of prefixed parts, such as `Navbar` and `NavbarTitle`, already used in one place in your app with its own `className`. Lint and typecheck pass on the file.",
            ],
          },
          {
            kind: "text",
            text: [
              "After a review, you get every law per part, pass or fail, with the offending line and the fix.",
            ],
          },
        ],
        title: "It’s working if",
      },
      {
        blocks: [
          {
            kind: "text",
            text: [
              "shadcn-composition-patterns is the shadcn layer on top of `vercel-composition-patterns`, which covers the React theory: why compounds, why no boolean props, lifting state into a provider.",
            ],
          },
          {
            kind: "text",
            text: [
              "It lives in ",
              {
                href: "https://github.com/AlexDemzz/skills/tree/master/shadcn-composition-patterns",
                text: "my skills repository on GitHub",
              },
              ", next to ",
              {
                href: "/skills/design-to-shadcn",
                text: "design-to-shadcn",
              },
              ", which skins shadcn primitives from a reference design, and ",
              {
                href: "/skills/notify-grokbot",
                text: "notify-grokbot",
              },
              ", which messages you in your Grok Bot chat when your agent finishes, gets blocked or needs your decision.",
            ],
          },
        ],
        title: "Where it fits",
      },
    ],
  },
};

/** A page's snippets, highlighted and keyed as in `SKILL_SNIPPETS`. */
export type SkillCode = Record<string, HighlightedCode>;

// One chunk per page, built by plugins/skill-code.ts.
const SKILL_CODE: Record<SkillPageName, () => Promise<{ default: SkillCode }>> =
  {
    "design-to-shadcn": () => import("virtual:skill-code/design-to-shadcn"),
    "shadcn-composition-patterns": () =>
      import("virtual:skill-code/shadcn-composition-patterns"),
    "notify-grokbot": () => import("virtual:skill-code/notify-grokbot"),
  };

export const getSkillCode = async (name: SkillPageName): Promise<SkillCode> => {
  const { default: code } = await SKILL_CODE[name]();
  return code;
};
