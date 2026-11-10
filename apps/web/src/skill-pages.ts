import { SITE, skillHref } from "@/content";
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
              "Grok Bot tells you in your chat that a test message arrived, right after the wizard’s last stage. If the wizard shows a warning instead, check both values and run it again.",
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
                href: skillHref("design-to-shadcn"),
                text: "design-to-shadcn",
              },
              ", which skins shadcn primitives from any website or screenshot, and ",
              {
                href: skillHref("shadcn-composition-patterns"),
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
};

/** A page's snippets, highlighted and keyed as in `SKILL_SNIPPETS`. */
export type SkillCode = Record<string, HighlightedCode>;

// One chunk per page, built by plugins/skill-code.ts.
const SKILL_CODE: Record<SkillPageName, () => Promise<{ default: SkillCode }>> =
  {
    "notify-grokbot": () => import("virtual:skill-code/notify-grokbot"),
  };

export const getSkillCode = async (name: SkillPageName): Promise<SkillCode> => {
  const { default: code } = await SKILL_CODE[name]();
  return code;
};
